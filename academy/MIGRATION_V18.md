# Upgrading from CyberLab v1.7 to v1.8

1. Keep your working v1.7 directory for rollback. Extract the **complete v1.8 ZIP** into a separate directory.
2. `cd` to the extracted directory (the ZIP root contains `package.json`).
3. Run `npm install`, `npm run verify:adacademy`, `npm run verify:all`, then `npm run build`.
4. Start using `npm run dev` and open the URL printed by Vite; this app is configured for `/training/`.
5. Open `#adlab`: verify Learn AD, Authentication Lab, Abuse & Defense Atlas, Investigate & Defend, and Original Graph Lab.
6. Run the browser acceptance tests using `npx playwright install chromium` and `npm run test:browser` before publishing.

## Compatibility

- The existing route `#adlab` now loads the new Academy shell; the original Graph Lab is available within the shell.
- The original graph engine and its saved results are preserved.
- New concept check and mission-completion keys: `cyberlab-v18-ad-lessons` and `cyberlab-v18-ad-completed`.
- All network, NGFW, coding, OSCP, crypto, secrets, and 3D modules remain in the package.
- The build base `/training/` is unchanged.
- No VMs, backend, cloud instances or production AD servers are needed or contacted.

## Constraints

The lesson checks are educational self-assessments. Command output is synthetic; none of the typing executes a command. Conditional graph edges are not exploit proofs. The documented attack conditions and defensive controls are modeled at a conceptual level.
