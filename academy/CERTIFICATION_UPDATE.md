# v1.9.2 — Certification Academy expansion

## Scope
- Added 71 independently authored, objective-mapped questions to the previous 37; **108 total / 36 per exam track**.
- Retained domain names, official weightings, objective summaries, and editions from the user-supplied exam datasheets.
- Added `src/certification/expandedQuestions.ts` rather than modifying existing question IDs, preserving browser study progress.
- A randomized, approximately blueprint-weighted **30-question / 45-minute** practice assessment replaces the fixed 10-question / 15-minute assessment.
- Exam explanations remain hidden until results submission. Learning mode remains untimed with immediate feedback and retries.
- New certification selection tests in `src/certification/exam.test.ts`, integrity tests in `src/certification/blueprints.test.ts`, and Playwright acceptance tests in `tests/browser/certifications.spec.ts`.

## Verify on Ubuntu

```bash
npm install
npm run verify:certifications
npm test
npm run build
npx playwright install chromium
npm run test:browser
npm run dev
```

Open `http://127.0.0.1:5173/training/#certification` (or the local URL shown by Vite).

## Grounding and caveats
- Network Security Professional: **June 2026** datasheet, six weighted domains.
- NGFW Engineer: **November 2025** datasheet, three weighted domains.
- Cloud Security Professional: **August 2025** datasheet, five weighted domains.
- The course uses original practice items, not exam dumps or official/provider-reviewed content. The test timer and length are CyberLab practice settings, not representations of official exam settings.
- An automated check confirms question count, option structure, unique IDs, explanations, domain coverage and domain-weighted exam distribution. Technical wording should still be reviewed by a qualified instructor before high-stakes use.
- Public hosting remains static, without a server-side grading system. Local scores can be modified by users, so they should not be treated as externally verifiable credentials.


## v1.9.3 update

The question count remains 36 per track. New objective mapping checks, persisted mock exams, scheduled review, improved distractors and a curated wrong-answer review are documented in [CERTIFICATION_V193_RELEASE.md](CERTIFICATION_V193_RELEASE.md).
