# CyberLab Interactive v2.5 — AD Mission Control & Guided Onboarding

## Purpose
Turn the existing AD Academy's fictional permission-graph cases into a friendlier, recoverable practice workflow. This is an incremental product release, **not** a new real Active Directory infrastructure or a replacement for the existing labs.

## What's implemented

### AD Mission Control
- At the top of Investigate & Defend, one active objective is derived from the actual investigation grader: map baseline, collect evidence, identify root cause, repair, retest, write finding, validate.
- **Guided** mode includes next-step explanation, simulation-specific investigative suggestions, and optional beginner command examples. **Independent** mode hides those helpers without changing the grader.
- Milestone badges use grader checks for collected evidence, correct diagnosis and effective repair; clicking the correct-looking option alone does not count.
- All three existing AD risk scenarios remain, as do the original AD Graph Lab and the separate authentication and threat-model lessons.

### Persistent investigation drafts
- `cyberlab-v25-ad-drafts` stores per-case permission changes, revision, baseline observation, typed diagnostic history, pinned evidence, analyst notes, root-cause choice, and retest summary.
- A previously active case is reselected upon return; a case with saved work opens Investigate & Defend. Switching cases preserves separate drafts.
- Data recovery filters unsupported commands, forged evidence output and invalid permission edges. Drafts remain locally editable **and are not cryptographically attested**. An attacker can tamper with localStorage; this is a learning tool, not an exam proctor.
- Old completed-mission and lesson storage keys are untouched. New drafts are included automatically by existing CyberLab backups because the backup engine captures `cyberlab-` keys.
- The *Reset case* action resets that case and its saved draft to a blank starting point. Export reports separately if you want a permanent copy of notes.

### More discoverable AD graph
- Search users, groups, service identities and hosts; click a result to focus the node.
- Filter visible relationships: All, Excessive permissions, Conditional paths.
- Fit entire graph; keep existing 2D pan/zoom and perspective 3D orbit/pan/zoom controls.
- Node selection and the selected relationship survive switching between 2D and 3D within the workbench.
- Filters are presentation-only and never modify the underlying attack-path or authorization graph.

### Automatic onboarding
- The How to Use page now measures six actual AD interactions: enter investigation, select graph node/edge, zoom graph, run recognized diagnostic, pin evidence and run a retest.
- A step is shown as *verified by interaction* only after the corresponding action is recorded in this browser.
- Onboarding actions are not equivalent to successful remediation, and cannot substitute for the mission's stricter evidence-based grader.

## Scope and limitations
- All directory objects, ACLs, users, Windows/PowerShell responses, and attacks are **fictional synthetic fixtures**.
- AD's 3D view remains a perspective-projected graph, not a general-purpose WebGL identity engine.
- Browser-local data persists only for the current browser profile unless backed up; storage can be cleared or modified by the user.
- No live Active Directory commands or attacker code are executed.

## QA status
- All prior verification suites through native NGFW/3D were run and passed, plus v2.5 and v2.4 offline checks.
- Dedicated draft validation and activity-parser unit tests were added.
- Browser tests for draft recovery, 2D/3D focus, and measured onboarding were added, but **not run here** (npm registry DNS failure).
- Real `npm test`, `npm run build` and `npm run test:browser` remain mandatory before production deployment.

## Quick start
```bash
npm install
npm run verify:ad-mission
npm run verify:all
npm run build
npx playwright install chromium
npm run test:browser
npm run dev
```
Navigate to `/training/#guide` or `/training/#adlab`.
