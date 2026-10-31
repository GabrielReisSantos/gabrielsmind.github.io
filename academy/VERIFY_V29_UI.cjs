/** Guards v2.8 home crash class and ensures explorer route / actions stay wired. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
const filenames=['src/explorer/SystemsExplorer.tsx','src/experience/App.tsx','src/experience/Dashboard.tsx'];let checks=0;
for(const file of filenames){
 const code=fs.readFileSync(file,'utf8'),ast=ts.createSourceFile(file,code,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 assert.equal(ast.parseDiagnostics.length,0,`${file} has valid TSX`);checks++;
 const names=new Set();const bind=n=>{if(ts.isIdentifier(n))names.add(n.text);else if(ts.isObjectBindingPattern(n)||ts.isArrayBindingPattern(n))for(const e of n.elements)if(ts.isBindingElement(e))bind(e.name);};
 const scan=n=>{if(ts.isImportDeclaration(n)&&n.importClause){if(n.importClause.name)names.add(n.importClause.name.text);const b=n.importClause.namedBindings;if(b){if(ts.isNamespaceImport(b))names.add(b.name.text);else for(const e of b.elements)names.add(e.name.text);}}if(ts.isVariableDeclaration(n)||ts.isParameter(n))bind(n.name);if((ts.isFunctionDeclaration(n)||ts.isClassDeclaration(n))&&n.name)names.add(n.name.text);ts.forEachChild(n,scan);};scan(ast);
 const unresolved=[];const jsx=n=>{if((ts.isJsxOpeningElement(n)||ts.isJsxSelfClosingElement(n))&&ts.isIdentifier(n.tagName)&&/^[A-Z]/.test(n.tagName.text)&&!names.has(n.tagName.text))unresolved.push(n.tagName.text);ts.forEachChild(n,jsx);};jsx(ast);assert.deepEqual(unresolved,[],`${file} unbound JSX components`);checks++;
}
const route=fs.readFileSync('src/experience/routes.ts','utf8'),app=fs.readFileSync('src/experience/App.tsx','utf8'),dash=fs.readFileSync('src/experience/Dashboard.tsx','utf8'),ui=fs.readFileSync('src/explorer/SystemsExplorer.tsx','utf8');
for(const cond of [route.includes('explorer:{'),app.includes("page==='explorer'&&<SystemsExplorer"),dash.includes("onNavigate('campaign')")&&route.includes('campaign:{')&&app.includes("page==='campaign'&&<ConnectedCampaign"),ui.includes('inspectSystems(enterprise,native,local)'),ui.includes('editRule(current.topology'),ui.includes('changeSharedEnterprise('),ui.includes('assessmentCurrent(local,view)'),ui.includes('localStorage.setItem(EXPLORER_STORAGE')]){assert.ok(cond,'Explorer route, shared state and persistence integrated');checks++;}
console.log(`CyberLab v2.9: ${checks} UI and route binding checks passed.`);
