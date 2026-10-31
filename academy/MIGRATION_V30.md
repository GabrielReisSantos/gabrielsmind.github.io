# Migration v2.9 → v3.0

Use the complete source ZIP in a new folder. Keep v2.9 as a rollback copy. Export progress from the current Academy first, especially if you're changing the origin or browser.

The new route is `#campaign`, the dashboard's featured action leads there, and the sidebar has Campaign Room. Old routes `#explorer`, `#missionroom`, `#secrets`, and others remain intact. All old progress keys remain; the only new storage key is `cyberlab-connected-campaign-v30`.

The first two missions intentionally mutate the shared enterprise directory, native guest topology/NGFW configuration and approved HTTPS access. Changes can alter exercises in connected labs until you restore them. The campaign's Reset dialog resets these shared enterprise controls as well as campaign-only notes; it does not erase unrelated Academy progress.

Run `npm install && npm run verify:all && npm run build && npx playwright install chromium && npm run test:browser` prior to publishing. Generate and commit the lockfile. Do not add actual credentials or malware samples to a public repository.
