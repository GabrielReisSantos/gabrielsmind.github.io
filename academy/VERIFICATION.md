# v1.7 verification — 2026-10-30

## Passed here

- `npm run verify:pki-advanced`: **282** targeted behavioral/integrity assertions (root/intermediate/leaf creation, chain construction, missing intermediate, incorrect host, expired/untrusted/revoked simulations, simulated mTLS, NGFW decryption, token rotation, recall).
- `openssl verify -CAfile root.crt -untrusted intermediate.crt -verify_hostname app.cyberlab.test server.crt`: **OK** against certificates emitted by the new engine.
- `openssl verify -purpose sslclient -CAfile root.crt -untrusted intermediate.crt client.crt`: **OK**.
- `openssl req -verify`: **OK** for intermediate and client CSRs.
- Retained offline checks: topology (173), visual (291), v1.0 design contracts (61), v1.1 quality (32), shared incident (23), v1.3 OSCP cases (135), v1.4 investigation (112), coding (88), v1.6 crypto (154). All passed.
- New advanced React UI passed an isolated TypeScript check with test-only shims for unavailable `react` and `lucide-react` packages. Static parsing of changed UI files passed.

## Not verified in this environment

- `npm install` failed with `EAI_AGAIN` connecting to `registry.npmjs.org`.
- Thus the **actual** React/Vite `npm run build` and Playwright browser tests were not run. No verified browser rendering or production deployment is claimed. Run on Ubuntu before publication.
- The Python and NGINX syntax exercises are **source-structure checks, not program executions**.

## Safety limitations

The interpreter does not run OpenSSL binaries, create real sockets, use live PAN-OS, contact APIs or save private key material. Certificate revocation behavior is simulated, not OCSP/CRL processing. No production trust store is modified.
