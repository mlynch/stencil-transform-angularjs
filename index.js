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
.component('${angularComponentName}', {
  template: '<${componentName}></${componentName}>',
  bindings: {
${props.map(p => `    '${p.name.getText()}': '<',`).join('\n')}
${events.map(p => `    '${p.name.getText()}': '&',`).join('\n')}
  },
  controller: function($element) {
    var self = this;
    const e = angular.element($element.children()[0]);
    ${events.map(p => `
    e.on('${p.name.getText()}', function(e) {
      return self.${p.name.getText()}();
    });

    `)}
    // Update props on component
    // from Angular bindings changes
    this.$onChanges = function(c) {
      for(let i in c) {
        e[0][i] = c[i].currentValue;
      }
    }
  }
})
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

walkAst(sourceFile);