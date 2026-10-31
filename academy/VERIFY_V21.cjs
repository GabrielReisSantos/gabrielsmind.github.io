#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=process.argv[2]||'.unified-verify';const e=require(path.resolve(root,'engine.js'));
let checks=0;function test(expr,msg){checks++;assert.ok(expr,msg);}
const commands=(s,...items)=>items.reduce(e.executeCommand,s);
function setup(){let s=commands(e.initialState(),'simulate normal','attack reset svc-reports','attack login app01');s=e.pinEvent(s,s.events.find(v=>v.kind==='attack'&&v.eventId==='4724').id);s=e.pinEvent(s,s.events.find(v=>v.kind==='attack'&&v.eventId==='4624').id);s=e.setRule(s,'event_id=4724 actor=lina.helpdesk target=svc-reports');s=e.setDiagnosis(s,'excessive-reset-rights');s=e.setExplanation(s,'Helpdesk reset privileges expose a powerful service identity and give an attacker unintended APP01 access across the application trust boundary.');return s;}
let s=setup();test(s.events.some(v=>v.eventId==='4724'),'reset event present');test(s.events.some(v=>v.eventId==='4624'),'logon event present');test(s.events.some(v=>v.eventId==='TRAFFIC'),'network event present');test(s.events.some(v=>v.eventId==='APP-AUTH'),'application event present');
for(const c of s.commands){for(const id of c.eventIds)test(s.events.some(v=>v.id===id&&v.commandId===c.id),'causal trace preserved');}
const result=e.evaluateRule(s);test(result.truePositives.length===1,'one attack detected');test(result.falsePositives.length===0,'normal admin spared');test(!e.gradeRange(s).complete,'must remediate');
for(const q of ['event_id=4724','event_id=4724 foo=x','event_id=4724 actor=x actor=y','event_id=4724 actor=x;rm'])test(!e.parseRule(q).rule,'invalid rule rejected');
s=commands(s,'fix remove-reset-acl','verify attack');test(!s.tests.attackBlocked,'credential/session survival detected');s=commands(s,'fix rotate-credential','verify attack');test(!s.tests.attackBlocked,'live session survived rotate');s=commands(s,'fix revoke-sessions','verify attack');test(s.tests.attackBlocked,'abuse denied');s=commands(s,'verify service');test(!s.tests.serviceWorks,'unsynced legitimate service fails');s=commands(s,'fix sync-application','verify attack','verify service','verify monitoring');test(e.gradeRange(s).complete,'fully validated mission');test(e.report(s).includes('**Status:** Validated'),'report accurate');
s=commands(s,'audit logon off');test(!e.gradeRange(s).complete,'config change invalidates grade');
const bad=commands(e.initialState(),'attack reset svc-reports','audit account off','attack reset svc-reports','attack login app01');test(bad.events.filter(v=>v.eventId==='4724').length===1,'audit off means no extra 4724');
const noBaseline=commands(e.initialState(),'audit account off','simulate normal','audit account on');test(!e.gradeRange(noBaseline).requirements.find(x=>x.label.includes('baseline')).ok,'baseline must contain actually recorded normal event');
const denied=commands(e.initialState(),'fix remove-reset-acl','attack reset svc-reports');test(denied.events.length===0,'no synthetic 4724 on denied reset');
for(const command of ['; rm -rf /','wget evil','curl https://example.com','powershell -nop','ad reset everything','__proto__']){const z=commands(e.initialState(),command);test(z.commands[0].success===false&&z.events.length===0,'unknown command blocked');}
const source=fs.readFileSync('src/experience/routes.ts','utf8');test(source.includes('unified'),'route registered');
const app=fs.readFileSync('src/experience/App.tsx','utf8');test(app.includes('UnifiedRange'),'UI linked');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));test(['2.','3.'].some(v=>pkg.version.startsWith(v)),'version current');
console.log(`PASS ${checks} Unified Range v2.1 assertions`);
