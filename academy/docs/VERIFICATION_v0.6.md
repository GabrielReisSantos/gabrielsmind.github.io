# CyberLab Interactive v0.6 — verification report

## Verified in packaging environment

- TypeScript isolated strict compilation passed for the **three new pure engines** and the reused v0.5 troubleshooting engine.
- All **three new React interfaces** passed strict isolated `.tsx` type checks with temporary minimal React/lucide type declarations. These are useful source-level checks but **not a substitute for compiling against actual React types**.
- The complete source tree passed TypeScript transpilation syntax checks (no syntax diagnostics).
- A standalone Node.js regression program, `VERIFY_ENGINE.cjs`, passed **103 assertions**, verifying five vulnerable HTTP cases and patched controls, evidence-gated completions, three AD graph paths and legitimate access preservation, and eight correlated failure/repair scenarios. Includes negative checks for bypassing required proof.
- Existing v0.5 source modules were retained, with intentionally small navigation/curriculum entrypoint changes and removal of external Google Fonts import.
- New exercises use in-memory, fixed fixtures. The HTTP engine does not call `fetch`, `eval`, the OS, network or a real filesystem.

## Not verified here

- `npm install` failed resolving `registry.npmjs.org` (`EAI_AGAIN`). Consequently, **full `npm test`, full `npm run build`, React/Vite bundle compilation, actual browser rendering, navigation/interaction in Firefox, and Vercel deployment were not verified**.
- No claim that synthetic findings replicate full HTTP browser behavior, offensive tools, PAN-OS, a real Active Directory domain, BloodHound, Cisco IOS or OffSec laboratory outcomes.
- No claim of exam readiness based on the simulated exercises.

## Local release gates (must pass before considering stable)

```bash
npm install
npm test
npm run build
npm run dev
```

Use the checklist in `MIGRATION.md`. If a local build fails, copy the exact terminal errors for a targeted fix rather than deleting the working v0.5 installation.
