import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import assert from 'node:assert/strict';
const get = f => readFileSync(join(process.cwd(),f),'utf8');
for (const route of ['src/pages/index.astro','src/pages/about.astro','src/pages/projects.astro','src/pages/reports/index.astro','src/pages/certifications/index.astro','src/pages/contact.astro','src/pages/blog/index.astro','src/pages/academy.astro','src/pages/cyberlab/index.astro','src/pages/projects/[slug].astro']) assert(existsSync(route),`missing ${route}`);
for(const file of ['public/cyberlab/topology.html','public/images/about-reflection.jpg','public/images/extra-dark.jpg','public/images/hero-escalator.jpg','public/images/hacker-photoshoot-00.jpg','public/reports/apt34-report.pdf','public/reports/report-anz.pdf','public/reports/pitch.pdf','public/reports/presentation3.pdf','public/reports/presentation4.pdf']) assert(existsSync(file),`missing ${file}`);
const home=get('src/pages/index.astro');
for(const keyword of ['Offense by','Defense by','Proxmox Cluster Security Lab','GabrielsMind Enterprise Defense','My Home SOC Lab','CyberLab — Proxmox Cyber Range','Cyber Academy','Global threat telemetry','https://cybermap.kaspersky.com','Hack The Box','LinkedIn','GitHub','Medium','Research &amp; reports']) assert(home.includes(keyword),`missing homepage content ${keyword}`);
const project=get('src/pages/projects.astro');
for(const keyword of ['CyberLab — Proxmox Cyber Range','Cyber Academy','Proxmox Cluster Security Lab','GabrielsMind Enterprise Defense','My Home SOC Lab']) assert(project.includes(keyword),`missing project ${keyword}`);
const cert=get('src/pages/certifications/index.astro');
for(const keyword of ['CompTIA Security+','Security Operations Professional','Security Operations Analyst Associate','SC-200','CCNA','Fortinet Certified Associate','Dante','Zephyr','OSCP','GIAC GRID','Penetration Testing, Threat Hunting, and Cryptography','IBM']) assert(cert.includes(keyword),`missing cert ${keyword}`);
console.log('PASS: content + routes + original assets preserved (source-level checks)');

assert(!home.includes('NetworkViz'), 'legacy simulated network remains on homepage');
assert(!home.includes('Professional development'), 'requested section remains on homepage');
assert(!get('src/components/Header.astro').includes('brand-glyph'), 'old G brand remains');
assert(!get('src/pages/contact.astro').includes('mailto:'), 'old email link remains');
assert(!get('src/pages/certifications/index.astro').includes('How to read this page'), 'certification explanation remains');
for (const credential of ['dd60fec9-86c5-4de2-b068-2cffd888d92a','ec43a042-4822-4e93-82c6-6c4ec3919f97','dc3f0610-689b-4715-b0bf-4469ce63ef29']) assert(cert.includes(credential), `missing credential ${credential}`);
console.log('PASS: minimal portfolio design + user-supplied credential links');

const labPage=get('src/pages/cyberlab/index.astro');
assert(labPage.includes('/cyberlab/topology.html'), 'homelab topology link missing');
assert(!get('src/pages/academy.astro').includes('href="/cyberlab/">Open current CyberLab'), 'academy links to wrong application');
assert(get('src/pages/certifications/index.astro').includes('019cbeff-c958-7184-b047-f0d25cc9dec8'), 'HTB profile missing');
assert(home.indexOf('elsewhere-spot') < home.indexOf('Selected work'), 'Elsewhere is not directly under the homepage hero');
assert(!home.includes('class="dark-band"'), 'outdated specialties band remains');
console.log('PASS: HTB achievements, distinctions, and explicit CyberLab route');
