# Upgrade to CyberLab 2.0

1. Back up your existing working v1.9.3 folder and, in the app, export your local progress backup (browser localStorage can be overwritten or cleared).
2. Extract the complete ZIP into a NEW directory. For the small patch, extract on top of your verified v1.9.3 source, after making a full copy.
3. Run `npm install`, `npm run verify:experience`, `npm run verify:all`, `npm run build`, and `npm run test:browser` (Playwright browsers must be installed first).
4. Open `/training/#home`, or any existing bookmarked route. `#certification`, `#world`, `#purple` and all original destinations are preserved.
5. Confirm saved certification exam answers, Purple Team case progress, and last-visited module remain available; the browser origin must remain the same for localStorage restoration.
6. The first build should generate `package-lock.json`; commit it and use `npm ci` in CI going forward.

**No stored-record migration:** This version retains the v1.9.3 storage format and keys. The old `src/Dashboard.tsx` and its historical CSS remain in the source for reference, while `src/experience/Dashboard.tsx` is the active home.

**New UI navigation:** Six sections: Home, Learn, Labs, Investigate, Certifications, My Progress. All fifteen older module hashes still work.
