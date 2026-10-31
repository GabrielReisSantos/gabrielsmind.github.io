/** Deterministic regression gate for the v2.3.1 build/test-runner fixes.
 * Run with: npm run verify:test-boundaries
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=__dirname;
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
let checked=0;
const check=(condition,message)=>{assert.ok(condition,message);checked++};
const config=read('vitest.config.ts');
check(config.includes("include:['src/**/*.test.ts','src/**/*.test.tsx']"),'Vitest must include only src unit tests');
check(config.includes("exclude:['tests/browser/**'"),'Vitest must exclude Playwright suite');
const playwright=read('playwright.config.ts');
check(playwright.includes("testDir:'./tests/browser'"),'Playwright must own browser tests');
const tests=(dir)=>{let out=[];for(const entry of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){
  const rel=path.posix.join(dir,entry.name); if(entry.isDirectory())out.push(...tests(rel));
  else if(/\.(test|spec)\.tsx?$/.test(entry.name))out.push(rel);
}return out};
const unit=tests('src'), browser=tests('tests/browser');
check(unit.length>=28,`Expected >=28 engine test files, got ${unit.length}`);
check(browser.length>=15,`Expected >=15 browser test files, got ${browser.length}`);
check(unit.every(p=>/\.test\.tsx?$/.test(p)), 'Unit folder unexpectedly contains a spec that Vitest may ignore');
check(browser.every(p=>/\.spec\.tsx?$/.test(p)), 'Browser folder unexpectedly contains test naming conflict');
const dashboard=read('src/Dashboard.tsx');
check(dashboard.includes('export type Destination=DestinationId;'),'Dashboard destinations must share the progress registry');
check(dashboard.includes('routeLabel(last.page)'),'Resume label must use route registry');
check(dashboard.includes("id:'unified' as Destination"),'Unified Cyber Range must be available from dashboard');
const learning=read('src/learning/progress.ts');
check(learning.includes("'purple','unified','correlation'"),'Shared progress registry missing unified route');
const routes=read('src/experience/routes.ts');
check(routes.includes('unified:{label:'),'Unified route must be defined in route registry');
const pkg=JSON.parse(read('package.json'));
check(/^(?:2|3)\.(?:3\.1|4\.[0-9]+|5\.[0-9]+|6\.[0-9]+|7\.[0-9]+|8\.[0-9]+|9\.[0-9]+)$/.test(pkg.version)||pkg.version==='3.0.0','Package version mismatch');
check(pkg.scripts['test:browser']==='playwright test','Do not change Playwright runner command');
console.log(`v2.3.1 test boundary and dashboard checks: ${checked} passed (${unit.length} Vitest files; ${browser.length} Playwright files).`);
