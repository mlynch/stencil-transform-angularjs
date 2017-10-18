const fs = require('fs');

var ts = require('typescript');

//console.log(ts.SyntaxKind);

if(process.argv.length < 5) {
  console.error('Usage: npm run typeFile angularModuleName angularComponentPrefix');
  process.exit(1);
}

const commandArgs = {
  typeFile: process.argv[2],
  angularModuleName: process.argv[3],
  angularComponentPrefix: process.argv[4]
};

let sourceFile = ts.createSourceFile(commandArgs.typeFile, fs.readFileSync(commandArgs.typeFile).toString(), ts.ScriptTarget.ES6, /*setParentNodes */ true);

const generateUtils = () => {
  const utils = `
var createComponent = function(componentName, props, events) {
  var bindings = {};
  props.forEach(function(p) {
    bindings[p] = '<'
  });
  events.forEach(function(e) {
    bindings[e] = '&'
  });
  return {
    template: \`<\$\{componentName\}></\$\{componentName\}>\`,
    bindings: bindings,
    controller: function($element) {
      var self = this;
      var e = angular.element($element.children()[0]);
      events.forEach(function(en) {
        e.on(en, function(e) {
          return self[en]();
        })
      });

      // Update props on component
      // from Angular bindings changes
      this.$onChanges = function(c) {
        for(let i in c) {
          e[0][i] = c[i].currentValue;
        }
      }
    }
  }
}
  `
  console.log(utils);
}

const generateAngularComponent = (classNode) => {
  const className = classNode.name.getText();

  // Convert MyComponent into my-component
  const classNameParts = className.match(/[A-Z][a-z]+/g)
  const componentName = classNameParts.map(x => x.toLowerCase()).join('-');
  const angularComponentName = commandArgs.angularComponentPrefix + className.slice();

  const props = [];
  const events = [];

  classNode.members.forEach(n => {
    const typeName = n.type.getText();

    // Skip method declarations
    if(n.kind == ts.SyntaxKind.MethodDeclaration) {
      return;
    }

    if(typeName == 'EventEmitter') {
      events.push(n);
    } else {
      props.push(n);
    }
  });


  const componentText = `
angular.module('${commandArgs.angularModuleName}')
.component('${angularComponentName}', createComponent('${componentName}',
  [${props.map(p => `'${p.name.getText()}'`).join(',')}],
  [${events.map(p => `'${p.name.getText()}'`).join(',')}]
))
`;

  console.log(componentText);
};

const walkAst = (root) => {
  p(root);
  function p(node) {
    switch(node.kind) {
      case ts.SyntaxKind.ClassDeclaration:
        generateAngularComponent(node);
        break;
    }
    ts.forEachChild(node, p);
  }
}

generateUtils();
walkAst(sourceFile);