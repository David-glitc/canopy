const { chromium } = require('/home/david/.npm/_npx/fd3bca3c548369c0/node_modules/playwright');
const path = require('node:path');

const chrome = '/home/david/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome';
const origin = process.env.CANOPY_CAPTURE_ORIGIN || 'http://127.0.0.1:3010';
const pages = {
  landing: '/',
  app: '/app',
  markets: '/markets',
  instant: '/instant?asset=AAPLx&contract=XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp&source=xStocks&price=341.000000',
  vaults: '/sectors',
  matter: '/matter',
  rankings: '/leaderboard',
  demo: '/demo',
};

(async () => {
  const browser = await chromium.launch({ executablePath: chrome, headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  for (const [name, pathname] of Object.entries(pages)) {
    const page = await context.newPage();
    await page.goto(`${origin}${pathname}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(__dirname, 'assets', `${name}.png`) });
    await page.close();
    process.stdout.write(`${name}\n`);
  }

  const demo = await context.newPage();
  await demo.goto(`${origin}/demo`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await demo.waitForTimeout(1500);
  for (const [name, selector] of [
    ['demo-portfolio', '[data-demo-shot="portfolio"]'],
    ['demo-governance', '[data-demo-shot="governance"]'],
    ['demo-moat', '[data-demo-shot="moat"]'],
  ]) {
    await demo.locator(selector).evaluate((element) => {
      const top = element.getBoundingClientRect().top + window.scrollY - 92;
      window.scrollTo({ top, behavior: 'instant' });
    });
    await demo.waitForTimeout(400);
    await demo.screenshot({ path: path.join(__dirname, 'assets', `${name}.png`) });
    process.stdout.write(`${name}\n`);
  }
  await demo.close();
  await browser.close();
})();
