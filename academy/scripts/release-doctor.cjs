#!/usr/bin/env node
'use strict';
/** Verify real release prerequisites. Intentionally does not pretend source parses equal builds. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
let failures=0;
function check(ok,pass,fail){console.log(`${ok?'PASS':'FAIL'} ${ok?pass:fail}`);if(!ok)failures++;}
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const lockPath=path.join(root,'package-lock.json');
const exists=p=>fs.existsSync(path.join(root,p));
let lock=null;
try{if(fs.existsSync(lockPath))lock=JSON.parse(fs.readFileSync(lockPath,'utf8'));}catch{}
check(!!lock&&lock.lockfileVersion>=3&&lock.packages&&lock.packages['']&&lock.packages[''].version===pkg.version,'npm lockfile is valid and matches the project version','Missing or outdated package-lock.json. Run npm install on Ubuntu and commit the generated file.');
check(exists('node_modules/vite/package.json'),'Vite dependency is installed','Dependencies missing. Run npm ci after generating the lockfile.');
check(exists('dist/index.html'),'Production index exists','Build missing. Run npm run build.');
let html='';try{html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');}catch{}
check(html.includes('/training/assets/')&&html.includes('id="root"'),'Built asset paths use /training/','dist/index.html is missing /training/ assets or root mount. Check Vite base.');
check(exists('tests/browser/experience.spec.ts')&&exists('tests/browser/quality.spec.ts'),'Browser acceptance suites exist','Browser test files missing.');
console.log(`\n${failures?'RELEASE BLOCKED':'STATIC RELEASE PREREQUISITES PASSED'}: ${failures} problem(s).`);
console.log('This command does not run Vitest or Playwright. Run npm run qa:full separately.');
process.exitCode=failures?1:0;
