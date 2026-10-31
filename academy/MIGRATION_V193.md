# Migrating CyberLab v1.9.2 → v1.9.3

1. Back up the working v1.9.2 folder (and browser-local progress if important).
2. Extract `cyberlab-v1.9.3-certification-patch.zip` at the **project root** or use the complete v1.9.3 source archive in a new folder.
3. Run `npm install` then `npm run verify:certifications` and `npm run verify:cert-quality`.
4. Run `npm test`, `npm run build`, and `npm run dev` on Ubuntu.
5. Open `/training/#certification`. Start an exam, answer, flag, change questions, reload, resume, and submit. Verify scores and detailed feedback. Test learning-mode retry and due review.
6. Run `npx playwright install chromium` and `npm run test:browser` for browser coverage.
7. Commit your generated `package-lock.json` before deploying via GitHub Actions.

Old single-answer study records (`cyberlab-cert-answers-v3`) are preserved and remain in use by earlier dashboards. The new recall data is tracked in `cyberlab-cert-review-v1`; exam attempts and results use `cyberlab-cert-exam-v2-<track>` and `cyberlab-cert-exam-history-v2`. Selected track is in `cyberlab-cert-selected-track-v1`.

The visible certification practice path is unchanged: `#certification` under `/training/`.
