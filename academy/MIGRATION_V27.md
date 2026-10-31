# Upgrading CyberLab v2.6 to v2.7

Use the complete ZIP in a fresh directory (recommended), or apply the patch only to a verified **v2.6** source tree. Do not use the patch against older v2.5 builds. Export your learning progress before replacing files.

No existing progress keys were renamed or overwritten. A new key `cyberlab-secrets-atlas-v27` stores only simulated command strings, the selected case, and guided/independent mode. Completion is reconstructed on load, not trusted from stored completion flags. It is included by the existing `cyberlab-` prefix in the learning backup.

Open **Learn → Secrets Storage Atlas**, **Pentest Academy → Secrets Storage Atlas**, or `/training/#secrets`. The v2.6 Password Auditing Lab now includes a direct shortcut to the new module.

Run:

```bash
npm install
npm run verify:secrets
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

The lab requires no backend, OS privileges or new npm dependencies. No old missions are migrated into the new Atlas; it begins with an empty, separate 14-case progress record.
