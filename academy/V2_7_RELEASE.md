# CyberLab v2.7.0 — Secrets Storage Atlas

## What changed

- Added **Secrets Storage Atlas** under Learn and Pentest Academy, plus a dashboard shortcut.
- Seven platforms, each with two fictional cases (14 total): GitHub, SQL, Windows, Linux, macOS, iOS/iPhone, containers/Kubernetes.
- A typed, bounded simulation terminal for inspect → classify → fix → retest. Each scenario teaches a protected storage design and a common exposure pattern.
- Guided/independent mode, per-case progress, replay-validated browser recovery, 14-case completion report and official-reference links.
- Updated shared progress statistics and local progress backup (new key `cyberlab-secrets-atlas-v27`).
- Added stand-alone engine regression, Vitest tests, progress test and Playwright browser scenario.
- Existing password auditing session, crypto/PKI, AD, networking/NGFW and certification workbenches preserved.

## Accuracy and safety boundaries

Only synthetic case data is presented. Neither commands nor UI connect to GitHub, SQL databases, Linux/Windows/macOS devices, iOS, Docker, Kubernetes or any shell. The lab does **not** extract passwords or real credentials. It is an educational simulation and not an enterprise security scanner. False claims of completion in local storage are not trusted, but client-side self-reporting is not tamper-proof against a developer changing code.

The earlier uploaded *Hash Crack Password Cracking Manual (v3)* informs the broader password-auditing track, not the platform-specific credential-storage descriptions. Those descriptions were written separately and cross-checked against GitHub, Microsoft, Apple, Kubernetes, IETF and OWASP references in `docs/SECRETS_STORAGE_ATLAS.md`.

## Known limitations

- Genuine browser rendering, Playwright interactions, and full `npm test`/`npm run build` were **not executed here** because the npm registry was unreachable (`EAI_AGAIN`).
- A dependency lockfile must be generated and committed on a connected development computer before `npm ci` CI checks can succeed.
- Command grammar is intentionally narrower than actual system tools. The training console never executes typed commands.

## Verify on Ubuntu

```bash
npm install
npm run verify:secrets
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

Launch via `npm run dev` and visit `/training/#secrets`.
