# Deploy CyberLab v1.7 under /training/

The app is still a static Vite application with `base: '/training/'`. Keep CyberLab in its own GitHub repository, and have the existing Astro website GitHub Actions workflow build it into the portfolio's `public/training/` folder before publishing GitHub Pages. Follow the previously prepared deployment kit if that workflow is still in use; review its exact repository names and permissions before adopting it.

Before publishing:

```bash
npm install                 # generates package-lock.json; commit it
npm run verify:all
npm run build
npx playwright install chromium
npm run test:browser
```

Check the production preview (`npm run preview`) and verify that assets load from `/training/assets/`, all labs work on desktop/mobile, and that no real credentials or private keys are committed to the public repository. HTTPS is required for `crypto.subtle` in deployed browsers.

The build and browser steps were not executable in the packaging environment due to npm registry `EAI_AGAIN`; they remain required acceptance gates on Ubuntu.
