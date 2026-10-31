import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'./tests/browser',timeout:30_000,retries:0,
 use:{baseURL:'http://127.0.0.1:4173/training/',trace:'retain-on-failure'},
 projects:[{name:'desktop-chromium',use:{...devices['Desktop Chrome']}},{name:'mobile-chromium',use:{...devices['Pixel 7']}}],
 webServer:{command:'npm run preview -- --port 4173 --strictPort',url:'http://127.0.0.1:4173/training/',reuseExistingServer:!process.env.CI,timeout:60_000},
});
