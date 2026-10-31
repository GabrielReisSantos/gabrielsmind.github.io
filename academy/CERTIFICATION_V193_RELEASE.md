# CyberLab v1.9.3 — Certification Quality & Recall

## Scope

This release improves the existing three Palo Alto Networks study tracks without increasing their question counts:

- **36 original questions per certification** (108 total), with the same six/three/five blueprint domains and published weights.
- Audits every question's numerical objective reference against the uploaded datasheet-derived domain outline. Fixed the NGFW Engineer `FW-05` item: it now tests logging/forwarding objective 2.3 rather than App-ID behavior mislabeled as 2.3.
- Reworked a selection of obviously implausible answer options and added detailed wrong-answer explanations for eight curated questions. This is **not** a comprehensive vendor technical review of the complete bank.
- Study review history records attempts, errors, last answer, due date, and successful recall on separate days. The latter is a study signal, **not proof of mastery**. Wrong answers get a brief retry interval; correct answers follow 1/3/7/14/30-day intervals.
- Persistent 30-question exams with an absolute 45-minute deadline, saved question order and answers, flags, navigator, unanswered warnings, expiry after closing the tab, domain scores, and a short local attempt history.
- Recomputes saved exam scores rather than trusting imported score fields; validates saved IDs, answers, deadlines, and question-bank versions.
- Remembers the selected certification track across page reloads.
- Keeps the older `cyberlab-cert-answers-v3` format populated for the existing dashboard; newer recall records are stored separately and take precedence in the dashboard where present.
- All state stays in browser localStorage. Browser storage can be edited by a student; no official exam integrity or credentials are involved.

## Known limitations

- Only 36 questions are available per track and 30 appear per mock exam. Every two full attempts necessarily share **at least 24 questions (80%)** regardless of randomization. A high score does not predict passing an official exam.
- Objective-number audits verify blueprint *placement*, not the technical truth of every question. Thorough vendor documentation review remains necessary.
- Progress and timers depend on the user's device clock and localStorage. The page has no anti-cheating protection and isn't suitable for official certification or high-stakes grading.
- New progress is retained on the same origin and may be included in the existing progress backup. Preserve backups before clearing browser storage.
- A production Vite build, Vitest execution, Playwright Chromium tests, and the final `/training/` deployment still need checking on a machine with npm dependencies. This build environment could not reach registry.npmjs.org (`EAI_AGAIN`).

## Upgrade (working v1.9.2)

Back up your directory before applying the patch. Unzip the v1.9.3 patch at the project root (where `package.json` lives). Run:

```bash
npm install
npm run verify:certifications
npm run verify:cert-quality
npm test
npm run build
npm run dev
```

Then visit `http://127.0.0.1:5173/training/#certification` or the address Vite prints. Test exam start, answer, flag, reload/resume, time expiry, submission, and results. For browser tests:

```bash
npx playwright install chromium
npm run test:browser
```

**Before pushing to GitHub**: keep the `package-lock.json` produced by `npm install` and commit it. Use `npm ci` in CI for reproducibility once that file is checked in. Do not deploy until `npm test`, `npm run build`, and browser acceptance tests are green.

## Training and copyright note

Original educational questions. Not official Palo Alto Networks exam items. Based on the user-provided datasheets: Network Security Professional (June 2026), NGFW Engineer (November 2025), and Cloud Security Professional (August 2025).
