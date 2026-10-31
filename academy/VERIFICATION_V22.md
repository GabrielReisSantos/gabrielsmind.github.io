# CyberLab v2.2 verification record

## Checks available offline

- Pure enterprise+Unified Range TypeScript engine compilation: `npm run verify:enterprise`.
- Cross-module deny/allow semantics, event causality, AD ACL denial, session preservation, restore-schema validation, bounded history, stale retests: `VERIFY_V22.cjs`.
- Existing v2.1 Unified Range checks, plus the historical engine/design/quality verifiers.
- Separate strict component typecheck with local JSX shims (not equivalent to the actual React/TS build).
- `src/**/*.ts(x)` and `tests/**/*.ts(x)` syntax parsing.

## Tests that still require real dependencies

- `npm test` — the complete Vitest suite, including `src/enterprise/engine.test.ts`.
- `npm run build` — `tsc -b && vite build`, including actual React types and module integration.
- `npm run test:browser` — Playwright navigation, persistence across reload, mobile layout and linked events.
- `npm run release:check` — checks the real build artifact and dependency lockfile.

Dependency installation was not completed in this sandbox. A missing npm registry connection is **not** an acceptable substitute for green production tests.
