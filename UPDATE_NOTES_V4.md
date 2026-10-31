# GabrielsMind v4 — update notes

## Important distinction
- **CyberLab** is Gabriel’s Proxmox homelab / DIVD cybersecurity range (OPNsense, Cisco SG300, WireGuard, FastAPI). Public page: `/cyberlab/`; original bundled topology: `/cyberlab/topology.html`.
- **Cyber Academy** is a separate browser-based educational simulation platform. Overview: `/academy/`; actual compiled interactive application should be published separately under `/training/` only after its build/tests pass.

## Changes
- Shorter homepage hero; photo background across the full hero with smooth dark overlay, slightly reduced text size.
- Replaced the under-hero list of skills with the *Elsewhere / Follow the process* links. Removed the duplicate Elsewhere section lower down.
- Added Hack The Box **Zephyr** and **Dante** verified Pro Lab achievements (March 2026), linked to the supplied HTB profile.
- Preserved existing credentials, reports, research, content and project articles.
- New Astro-generated `/cyberlab/` landing page embeds the original topology and provides a full-screen link.
- Moved the preexisting single-file topology from `public/cyberlab/index.html` to `public/cyberlab/topology.html` to avoid an output-path conflict with the new Astro route.

## Local preview (don't open Astro page as a file:// URL)
```bash
npm ci
npm run verify:content
npm run build
npm run dev
```
Open the URL printed by Astro (usually `http://localhost:4321/`), then visit `http://localhost:4321/cyberlab/`.

For production, deploy the **contents of `dist/`** to your hosting root. `dist/cyberlab/index.html` should be the generated landing page and `dist/cyberlab/topology.html` should be the original interactive topology document. Verify both URLs after deployment.

If using GitHub Pages, rebuild the Astro site through GitHub Actions and confirm the published artifact includes those two files. Merely opening `public/cyberlab/index.html` from Downloads with `file://` cannot resolve absolute routes like `/cyberlab/` or `/projects/`.

If `/training/` is not yet deployed, do not use a fake placeholder as proof the Cyber Academy application is live.
