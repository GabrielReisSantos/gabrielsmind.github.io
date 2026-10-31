# Secrets Storage Atlas — CyberLab v2.7

## Purpose
Learn **where credentials and verifiers are stored**, how protection varies by context, how fictional credential exposures occur, and how to fix them without breaking dependent services. The module complements the v2.6 Password Auditing Lab and the OSCP/Pentest Academy.

**Strict boundary:** Every artifact is fictional. The allowlisted interpreter does not open any real files, read real credentials, inspect your GitHub account, contact a SQL instance, query a device keychain or connect to Kubernetes. Do not paste real tokens, passwords, key material or production artifacts into the training input.

## Seven storage environments

| Platform | Protected design | What to audit / common mistakes |
| --- | --- | --- |
| GitHub | Actions environment/repository/org secrets, preferably short-lived federation for cloud access | Committed `.env`, access to workflow runtime, log leakage, historical commits |
| SQL/database | Salted adaptive password verifiers (Argon2id); reusable DB credentials stored separately in secrets tooling | Plaintext or fast-hashed passwords, reusable connection strings in source, overbroad DB accounts |
| Windows | Credential Manager, DPAPI, managed identities / gMSAs | Service config passwords, excessive user privileges, diagnostic exposure |
| Linux | Root-controlled `/etc/shadow`, SSH key file controls, desktop Secret Service/Keyring | Insecure permissions, committed environment files, weak lifecycle management |
| macOS | Keychain items with appropriate access policy | User preferences, scripts and exported plaintext credentials |
| iPhone/iOS | App Keychain, accessibility settings, Secure Enclave for supported key use | Secrets shipped in application bundles, weak token lifetime and access control |
| Containers & Kubernetes | Workload identity, scoped mounts, tightly controlled RBAC and at-rest protections | Secrets in image layers, base64 mistaken for encryption, namespace-wide read grants |

### Three distinctions everyone should understand

1. **A user password verifier is not the password itself.** `/etc/shadow` or a database authentication table normally holds verifiers. Strong password storage uses salted, adaptive hashing, not raw SHA-256.
2. **Secure location is not the same as unconditionally secure access.** GitHub Actions secrets can be used by authorized workflows; Credential Manager and Keychain items can be used in authorized security contexts; Kubernetes Secrets require RBAC and suitable at-rest protections.
3. **A leaked reusable credential requires lifecycle action.** Removing a string from current source is not enough: rotate/revoke, review history and access, replace dependent application configuration, retest.

## How to play

1. Select one of seven environments; two fictional investigations appear for each.
2. Inspect the stated artifact with the **typed allowlisted command** in the training terminal.
3. Type `classify protected`, `classify exposed`, or `classify conditional` as supported by the evidence.
4. Type a matching `fix <remediation-id>` command. Guided mode provides its precise spelling; Independent mode hides it, with `help` available.
5. Run `retest` and verify the scenario. Each case is saved independently through replayable successful commands.
6. Export a Markdown report for revision; the report is an educational artifact, not a security assessment of any real system.

The source code in `src/secrets/engine.ts` contains original invented scenarios, no user data. All output is synthetic. There is no real secret extraction, password cracking, shell execution or network access.

## References (official/primary)

- GitHub: https://docs.github.com/en/actions/reference/security/secrets
- Microsoft Windows credential handling: https://learn.microsoft.com/en-us/windows/win32/secbp/handling-passwords
- Apple Keychain: https://developer.apple.com/documentation/security/keychain-items
- Linux Secret Service specification: https://specifications.freedesktop.org/secret-service/latest/description.html
- OWASP password storage: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- OWASP secrets management: https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html
- Kubernetes Secrets: https://kubernetes.io/docs/concepts/configuration/secret/
- OAuth native apps RFC 8252: https://www.rfc-editor.org/rfc/rfc8252

## Verification

Run `npm run verify:secrets` for the TypeScript engine regression, `npm test` for the Vitest tests, `npm run build` for the production compiler/bundle, and `npm run test:browser` for browser interactions. Offline source checks are not a substitute for a browser test.
