# CyberLab v1.9 verification report

## Verified in the packaging environment

- New Purple Team engine: 172 deterministic behavior/integrity assertions using `npm run verify:purple`.
- Existing offline verification commands: topology, visual geometry, design, quality, shared incident, OSCP deep practice, investigation engine, coding, cryptography, advanced PKI, AD Academy — all passed.
- Positive controls: each of the 3 scenario paths produces a baseline impact; after appropriate controls, the current-revision replay blocks the modeled unauthorized action.
- Negative controls: unsupported arbitrary commands never execute; inappropriate global shutdown fails the legitimate-business test; broad event-ID rules generate false-positive matches; missing audit policies suppress historical events rather than backfill them.
- Other grading gates: missing baseline event, missing retest evidence, incorrect diagnosis, weak report, no tuned detection, missing cleanup, and stale replay all block completion.
- Windows event conditionality: 4769 tied to DC Kerberos auditing; 4724 emitted only for accepted reset (not an access-denied attempt); 5136 tied to an accepted AD-object modification plus Directory Service Changes auditing and SACL.

## Not verified in this environment

- Full `npm install` / `npm run build` against actual dependencies.
- Playwright browser tests and real rendered UI, including mobile and exam timing.
- GitHub Pages live `/training/` deployment.

These must pass locally before public release. The app contains a source-backed **simulator**, not a real domain controller or command executor.

## Local commands

```bash
npm install
npm run verify:all
npm run build
npx playwright install chromium
npm run test:browser
npm run dev
```

Check `/training/#purple` on desktop and mobile. In each scenario reproduce the baseline, create normal events, tune detection, harden, retest, run `test legitimate`, pin evidence, submit, export report.
