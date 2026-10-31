#!/usr/bin/env node
'use strict';
/** v2.8.1 runtime crash regression: reject unbound JSX components before deployment. */
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const files=['src/experience/Dashboard.tsx','src/experience/App.tsx','src/missionroom/MissionRoom.tsx'];
let failures=0;
for(const file of files){
 const code=fs.readFileSync(path.join(__dirname,file),'utf8');
 const ast=ts.createSourceFile(file,code,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 if(ast.parseDiagnostics.length){console.error('FAIL:',file,'parse diagnostics',ast.parseDiagnostics.map(d=>d.messageText));failures++;continue;}
 const bindings=new Set();
 const binding=node=>{
  if(ts.isIdentifier(node))bindings.add(node.text);
  else if(ts.isObjectBindingPattern(node)||ts.isArrayBindingPattern(node))for(const el of node.elements){if(ts.isBindingElement(el))binding(el.name);}
 };
 const declarations=node=>{
  if(ts.isImportDeclaration(node)&&node.importClause){
   if(node.importClause.name)bindings.add(node.importClause.name.text);
   const named=node.importClause.namedBindings;
   if(named){if(ts.isNamespaceImport(named))bindings.add(named.name.text);else for(const spec of named.elements)bindings.add(spec.name.text);}
  }
  if(ts.isVariableDeclaration(node)||ts.isParameter(node))binding(node.name);
  if((ts.isFunctionDeclaration(node)||ts.isClassDeclaration(node)||ts.isTypeAliasDeclaration(node))&&node.name)bindings.add(node.name.text);
  ts.forEachChild(node,declarations);
 };
 declarations(ast);
 const missing=new Set();
 const visit=node=>{
  if(ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node)){
   const tag=node.tagName;
   if(ts.isIdentifier(tag)&&/^[A-Z]/.test(tag.text)&&!bindings.has(tag.text))missing.add(tag.text);
  }
  ts.forEachChild(node,visit);
 };
 visit(ast);
 if(missing.size){console.error(`FAIL: ${file} unresolved JSX components: ${[...missing].join(', ')}`);failures++;}
 else console.log(`PASS: ${file} JSX component bindings`);
}
if(failures){console.error(`${failures} JSX binding failures`);process.exitCode=1;}else console.log('PASS: v2.8.1 home and mission import regression');
