import {defineConfig,mergeConfig} from 'vitest/config';
import viteConfig from './vite.config';

/** Unit/engine tests only. Browser tests are exclusively owned by playwright.config.ts.
 * Without an explicit include, Vitest discovers tests/browser/*.spec.ts and tries to
 * register Playwright test() calls in its own runner, failing during collection.
 */
export default mergeConfig(viteConfig,defineConfig({
  test:{
    include:['src/**/*.test.ts','src/**/*.test.tsx'],
    exclude:['tests/browser/**','**/node_modules/**','**/dist/**'],
  },
}));
