# CyberLab v2.6.0 — Password Auditing (OSCP-oriented)

Added a single integrated password-auditing session grounded in the user-provided *Hash Crack: Password Cracking Manual (v3)*. All examples, texts and training datasets are newly created.

- Eight ordered checkpoints and one synthetic enterprise audit scope.
- Keyboard-first command terminal: supported Hashcat/John syntax, `cat` files, keyspace exercise, and policy commands. No OS shell execution.
- Browser WebCrypto actually calculates SHA-256 for bounded dictionary, rule, mask and John candidate lists. 2,700 candidate cap for the custom mask. Synthetic benchmark and modeled Argon2id policy are plainly labeled.
- Guided/independent practice, checkpoint state, recovery by replaying approved commands, notes and Markdown report.
- Integrated under Learn, Pentest Academy, dashboard, saved-location routing, progress dashboard and local backup.
- One new offline verifier, Vitest unit suite and Playwright browser check. CI script includes the new offline verifier.
- Existing v2.5.1 AD recovery hotfix and earlier labs are unchanged.

## Release status

Source-level and offline engine checks passed in this workspace. The complete dependency-backed `npm test`, `npm run build`, and Playwright UI checks are **not** verified here because this workspace cannot install npm project dependencies. Execute those locally before deployment.
