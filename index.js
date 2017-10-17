const fs = require('fs');

var ts = require('typescript');

const typing = process.argv[2];
console.log('Generating AngularJS bindings for component', typing);
let sourceFile = ts.createSourceFile(typing, fs.readFileSync(typing).toString(), ts.ScriptTarget.ES6, /*setParentNodes */ true);


const printClass = (node) => {
  node.members.forEach(n => {
    console.log(n.name.getText());
    console.log(n.type.getText());
  });
}

const printTree = (root) => {
  p(root);
  function p(node) {
    //console.log('Identifier', node);
    switch(node.kind) {
      //case ts.SyntaxKind.Identifier:
      case ts.SyntaxKind.ClassDeclaration:
        printClass(node);
        break;
    }
    ts.forEachChild(node, p);
  }
}

printTree(sourceFile);
/*

const funcs = Object.keys(ts).map(k => {
  if(typeof ts[k] === 'function') { return k; }
}).sort((a, b) => {
  if(a < b) { return -1; }
  if(b < a) { return 1; }
  return 0;
});

funcs.forEach(f => console.log(f));
*/


/*
const program = ts.createProgram([typing], {
    noEmitOnError: true,
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS
});

let emitResult = program.emit();

console.log('Emit result', emitResult);
*/

/*
let allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

allDiagnostics.forEach(diagnostic => {
  console.log('Diagnostics', diagnostic);
    let { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
    let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
});

let exitCode = emitResult.emitSkipped ? 1 : 0;

*/