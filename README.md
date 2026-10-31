# GabrielsMind — cybersecurity portfolio

**Offense by curiosity. Defense by design. :)**

This is the Astro-based portfolio for Gabriel Reis Santos. It showcases security engineering, cybersecurity lab projects, research, reports, credentials, articles and professional contact information.

## Design

The redesign uses a unified CyberLab identity: deep navy `#09111d`, mint `#64e7bc`, cyan `#69bfe5`, dark panels `#132231`, and accessible typography. The homepage includes a small **synthetic** network visualization with offensive and defensive perspectives. It does not make real network requests or perform attacks.

## Routes and project preservation

| Page | Path |
| --- | --- |
| Home | `/` |
| About | `/about/` |
| Projects | `/projects/` |
| Proxmox case study | `/projects/proxmox-cluster-security-lab/` |
| Cyber Academy overview | `/academy/` |
| Existing CyberLab demonstration | `/cyberlab/` |
| Reports and PDFs | `/reports/` |
| Certifications and roadmap | `/certifications/` |
| Blog | `/blog/` |
| Contact | `/contact/` |

Existing original photos, PDF files, report cover images and Proxmox markdown content are preserved, along with the original GitHub Pages deployment workflow. The `/training/` subpath is reserved for deploying the separate advanced CyberLab application later; it is not included in this portfolio bundle.

## Run locally

Requires Node.js **22.12 or newer**.

```bash
npm ci
npm run verify:content
npm run build
npm run dev
```

Visit the URL displayed by Astro, normally `http://localhost:4321`.

The included `verify:content` test checks for required pages, project listings, certification entries, and preserved assets. **It is not a substitute for `npm run build` or browser checks.**

## Deploy

The existing `.github/workflows/deploy.yml` publishes the site from the `main` branch using `withastro/action`. Upload the files to the root of the existing repository, commit, push to `main`, and review the GitHub Actions logs. Do not delete the existing `public/` folder.

## Publication review

See [REDESIGN_NOTES.md](REDESIGN_NOTES.md) for the preservation audit, credential notes, dependencies and production checklist.

In particular, **AZ-200** is retained as the code the portfolio owner provided, with its exact designation flagged for verification. Do not replace it with a different Azure certificate code unless the owner confirms it. The Contact page still carries the original contact domain and address until the owner confirms whether those should be changed.
