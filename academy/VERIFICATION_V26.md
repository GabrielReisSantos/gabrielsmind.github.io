# v2.6 verification log

## Performed

- Standalone TypeScript compilation of the password engine (`--strict`)
- Original SHA-256 fixture matching using `crypto.subtle.digest`
- Dictionary, rule, bounded mask and John-syntax exercises
- Negative tests: command injection, wrong hash format, skipped stages, failed defense, forged restoration
- Existing source/engine regression scripts (network, 3D, PKI, AD, Purple Team, certification, Unified Range)
- Parse-only inspection of TS/TSX source and browser tests
- Password workbench checked with an isolated React declaration shim to catch unused declarations and obvious type errors; not the full project build

## Not performed

- Complete npm-dependency-backed `tsc -b && vite build`
- `vitest run` using installed project dependencies
- Rendered Playwright browser tests / real keyboard and mobile interaction
- Actual Hashcat, John, GPU benchmarking, Argon2id derivation or authentication against a server

## Local release gate

```bash
npm install
npm run verify:all
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

The training outputs are synthetic and cannot substitute for authorized real-environment verification.
