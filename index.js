const fs = require('fs');

var ts = require('typescript');

//console.log(ts.SyntaxKind);

if(process.argv.length < 4) {
  console.error('Usage: npm run typeFile angularModuleName outputFilename');
  process.exit(1);
}

const commandArgs = {
  typeFile: process.argv[2],
  angularModuleName: process.argv[3],
  output: process.argv[4]
};

let sourceFile = ts.createSourceFile(commandArgs.typeFile, fs.readFileSync(commandArgs.typeFile).toString(), ts.ScriptTarget.ES6, /*setParentNodes */ true);

const generateUtils = () => {
  const oldWay = `
var createComponent = function(componentName, props, events) {
  var bindings = {};
  props.forEach(function(p) {
    bindings[p] = '<'
  });
  events.forEach(function(e) {
    bindings[e] = '&'
  });
  return {
    template: \`<\$\{componentName\} ng-transclude></\$\{componentName\}>\`,
    bindings: bindings,
    transclude: true,
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
  `;

  const utils = `
var createDirective = function(componentName, props, events) {
  var cap = x => x.substr(0, 1).toUpperCase() + x.substring(1);
  var decap = x => x.substr(0, 1).toLowerCase() + x.substring(1);
  var bindings = {};
  props.forEach(function(p) {
    bindings['prop' + cap(p)] = '<'
  });
  events.forEach(function(e) {
    bindings['prop' + cap(e)] = '&'
  });
  return function() {
    return {
      restrict: 'E',
      replace: false,
      //scope: false,
      scope: bindings,
      bindToController: true,
      controller: ['$element', '$scope', function($element, $scope) {
        var self = this;
        var wc = $element[0];

        this.$onChanges = function(c) {
          console.log('Changes', c);
          for(let i in c) {
            const propName = decap(i.substr(4));
            wc[propName] = c[i].currentValue;
          }
        }
        events.forEach(function(en) {
          $element.on(en, function(e) {
            return self['prop' + cap(en)]({ $event: e });
          });
        });
      }],
    }
  }
};

  `
  return utils;
}

const generateAngularComponent = (classNode) => {
  const className = classNode.name.getText();

  // Convert MyComponent into my-component
  const classNameParts = className.match(/[A-Z][a-z]+/g)
  const componentName = classNameParts.map(x => x.toLowerCase()).join('-');
  const angularComponentName = className.substr(0, 1).toLowerCase() + className.substr(1);

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
.directive('${angularComponentName}', createDirective('${componentName}',
  [${props.map(p => `'${p.name.getText()}'`).join(',')}],
  [${events.map(p => `'${p.name.getText()}'`).join(',')}]
))
`;

  return componentText;
};

const walkAst = (root, strings) => {
  p(root);
  function p(node) {
    switch(node.kind) {
      case ts.SyntaxKind.ClassDeclaration:
        strings.push(generateAngularComponent(node));
        break;
    }
    ts.forEachChild(node, p);
  }
  return strings;
}


const outputString = [
  generateUtils(),
  walkAst(sourceFile, []).join('\n')
].join('\n');

fs.writeFileSync(commandArgs.output, outputString); 