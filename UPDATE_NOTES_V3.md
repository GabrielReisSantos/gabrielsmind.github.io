# GabrielsMind — Portfolio Design Update v3

Source: user's current Astro portfolio, previously redesigned with a navy / mint / cyan CyberLab-aligned visual identity.

## Design changes

- Homepage is now a minimal photographic hero using `public/images/hacker-photoshoot-00.jpg` (supplied photograph). No simulated network panel appears in the hero.
- Main headline: **Offense by curiosity. Defense by design.**
- Navigation uses a clean wordmark without the `G` emblem. The Astro default favicon is replaced by a small abstract mint/cyan line motif.
- Entire **Professional development** section removed from the homepage, as requested. Certifications remain on their dedicated page.
- Removed the repetitive “LEARN / BUILD / TEST / INVESTIGATE” ticker and decorative label from the shared interior hero.
- Simplified the certifications page into a clean list of completed credentials and a separate compact list of lab training and learning goals. No marketing-style explanatory blocks or roadmap prose.
- Updated security certifications with the supplied Credly links for **CompTIA Security+**, **Palo Alto Networks Security Operations Professional**, and **IBM Penetration Testing, Threat Hunting, and Cryptography**. Existing CCNA and Fortinet certification entries remain.
- Replaced the incorrect `AZ-200` placeholder with **Microsoft Certified: Security Operations Analyst Associate (SC-200)**. The Microsoft Learn URL is a *program information link*, not a personal verification link.
- Removed the old email address from the Contact page instead of inventing a replacement. LinkedIn, GitHub, Medium and Calendly remain available.
- Original reports, assets, blog, project pages, CyberLab at `/cyberlab/`, and Cyber Academy at `/academy/` remain in the source.

## Notes about verification

`node scripts/verify-content.mjs` passes the source-level preservation tests, including all requested links and exclusions. Full production compilation/browser acceptance testing **has not been verified here** (Astro installation/binaries unavailable in this environment; local browser navigation restricted). Do not deploy without running:

```sh
npm ci
npm run verify:content
npm run build
npm run dev
```

Check homepage at desktop and mobile, especially readability over the photograph, external links on Certifications, contact links, and all existing project and PDF routes.

## Deployment

The supplied ZIP is the entire Astro project (not a built `dist/` directory). Place its contents in your repository, back up your existing version, run the checks, and then deploy using the original GitHub Pages workflow. No changes were made to the live website.

## Smaller patch

When updating the previous redesigned source, extract the patch at the root of your existing project. Remove `src/components/NetworkViz.astro` manually: it is no longer referenced by any route or page. The patch includes the new photograph and favicon.
