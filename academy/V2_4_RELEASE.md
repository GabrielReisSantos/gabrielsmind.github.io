# CyberLab v2.4.0 — Usability & Visual AD Lab

## Changes
- New `#guide` / **How to Use** landing page in the main sidebar and on the dashboard. Provides keyboard/mouse camera instructions, step-by-step training walkthrough, personal checklist and direct links. Checklist is stored in `cyberlab-v24-guide-checklist` (JSON array) and is included in existing progress backups. Checking a box is **not** a graded completion.
- Network 3D camera: drag orbit; Shift-drag or right-drag pan; non-passive wheel zoom; touch pinch zoom; explicit +/- and pan-arrow buttons; keyboard +/- arrows, Shift+arrows and Home; view presets and camera readout. Zoom is now proportional and bounded; original scene/device controls remain available. 3D renderer remains WebGL with the existing 2D fallback.
- Active Directory Academy > Investigate & Defend: switch between accessible, pannable/zoomable 2D map and orbitable **perspective-projected 3D relationship graph**, both reading the same AD scenarios and enabled/disabled edges. This AD 3D view is SVG-based perspective projection with layered nodes; it is **not a fully volumetric WebGL scene** and does not run a Windows domain. Edge selection and existing evidence/remediation grading are preserved.
- Current AD mission milestones: record baseline, collect 2 distinct evidence categories, diagnose, perform a narrow repair, validate and report. Completed AD cases persist as before.
- New browser smoke cases for guide, network camera controls, and AD 2D/3D view changes.
- Corrected older test scripts to accept the current 2.4 version without weakening inherited assertions; added executable clamped camera/math and AD permission-path checks.

## Constraints
No real domain controller, VM, code execution, or new server is required. Training data is synthetic. The six-step guide checklist is self-reported and does not change certification or lab scores.

## Local QA
```bash
npm install
npm test
npm run verify:all
npm run build
npx playwright install chromium
npm run test:browser
```
Full npm/Playwright suite and Vite build require installed dependencies; those were unavailable in the packaging workspace. Do not publish until these tests pass.
