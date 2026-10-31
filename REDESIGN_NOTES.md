# GabrielsMind — unified CyberLab redesign

## Preservation contract
This package is derived from the user's uploaded Astro repository, not a replacement static mockup. Original pages, content, public images, PDFs, GitHub Pages workflow, old `/cyberlab/` HTML, and existing Proxmox case study are preserved. The homepage uses the CyberLab navy / mint / cyan visual identity. Existing projects are kept, and CyberLab Interactive / Cyber Academy have been added.

## Changed
- Global design tokens + responsive shared styling
- Navbar / Footer / Hero / ProjectCard / CertificationCard / BaseLayout
- Homepage, including the original social links, original project links, reports section and Kaspersky third-party live map; an interactive illustration is added.
- Projects: two additional cards (CyberLab / Cyber Academy), all original cards retained.
- Certifications: three user-reported completions (Security+, Palo Alto Networks Security Operations Professional, and an AZ-200 designation pending confirmation). Original certifications and roadmap retained; CCNA year corrected to 2026.
- Reports heading adjusted; documents and their original files retained.
- New `/academy/` portfolio overview. The existing `/cyberlab/` page is retained unchanged. `/training/` is **reserved** for the separate advanced CyberLab bundle when it's tested and deployed; do not claim it's already published.

## Verification / publishing
Run `npm ci && npm run build` with Node >= 22.12.0; inspect `dist/` in `npm run preview`. Check every route and each PDF, especially on narrow viewports. The site is configured for static GitHub Pages with the original workflow preserved.

### Before publishing publicly
1. **Confirm AZ-200's exact certificate title**. AZ-200 was an older Microsoft Azure exam code; it should not be confused with contemporary AI-200, AZ-204, or AZ-500. The design intentionally marks this as a designation needing confirmation, without a claimed badge URL.
2. Add actual issuer verification URLs/badge IDs for the three new credentials, as appropriate. No dates or IDs were invented.
3. The site's Contact page still references `contact@gabrielsmind.io` and `gabrielsmind.io` because they were in the original repository. Update only if those addresses or domains have changed.
4. Confirm third-party Kaspersky widget embedding works in production; it depends on that external site.
5. Before replacing any deployed `/training/`, test the separate Vite application and combine build outputs intentionally.
