const { chromium } = require('playwright');
const { startStaticServer } = require('./static-server.cjs');

const scenarios = [
  {
    name: 'pilot-now', expected: 'Pilot now - narrowly',
    judgment: 'low', consequence: 'low', sensitivity: 'public', sources: 'ready', reviewer: 'named', reversible: 'yes', capacity: 'strong',
  },
  {
    name: 'prepare-first', expected: 'Prepare first',
    judgment: 'medium', consequence: 'medium', sensitivity: 'internal', sources: 'poor', reviewer: 'possible', reversible: 'limited', capacity: 'sample',
  },
  {
    name: 'smaller-task', expected: 'Pilot a smaller support task',
    judgment: 'high', consequence: 'low', sensitivity: 'public', sources: 'ready', reviewer: 'named', reversible: 'yes', capacity: 'strong',
  },
  {
    name: 'keep-human', expected: 'Keep the decision human',
    judgment: 'high', consequence: 'high', sensitivity: 'regulated', sources: 'ready', reviewer: 'named', reversible: 'limited', capacity: 'strong',
  },
];

(async () => {
  const server = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  try {
    for (const scenario of scenarios) {
      const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1280, height: 900 } });
      const page = await context.newPage();
      await page.goto(`${server.origin}/assessments/ai-workday-review/`, { waitUntil: 'networkidle' });
      await page.evaluate(() => localStorage.clear());
      await page.reload({ waitUntil: 'networkidle' });

      await page.fill('#organization', 'Example Company');
      await page.fill('#role', 'Operations lead');
      await page.check('input[name="pressure"][value="time"]');
      await page.check('input[name="protect"][value="quality"]');
      await page.click('#next-step');

      await page.check('input[name="workArea"][value="communication"]');
      await page.check('input[name="workArea"][value="reporting"]');
      await page.check('input[name="workArea"][value="knowledge"]');
      await page.fill('#task', 'Prepare the weekly client update from approved project notes.');
      await page.selectOption('#frequency', 'daily');
      await page.selectOption('#duration', 'extended');
      await page.fill('#current-process', 'The owner gathers updates from several notes, rewrites them and waits for missing information.');
      await page.click('#next-step');

      await page.selectOption('#judgment', scenario.judgment);
      await page.selectOption('#consequence', scenario.consequence);
      await page.selectOption('#sensitivity', scenario.sensitivity);
      await page.selectOption('#sources', scenario.sources);
      await page.selectOption('#reviewer', scenario.reviewer);
      await page.selectOption('#reversible', scenario.reversible);
      await page.fill('#prohibited', 'Personal records, price exceptions and unsupported promises.');
      await page.click('#next-step');

      await page.fill('#owner', 'Operations Manager');
      await page.selectOption('#measure', 'rework');
      await page.selectOption('#capacity', scenario.capacity);
      await page.fill('#good-output', 'Every statement matches an approved source and missing information is marked.');
      await page.fill('#stop-condition', 'The system invents a fact or requires more review than the original task.');
      await page.check('input[name="acknowledgement"]');
      await page.click('#create-result');

      const verdict = (await page.locator('.result-verdict h3').textContent()).trim();
      if (verdict !== scenario.expected) throw new Error(`${scenario.name}: expected ${scenario.expected}, got ${verdict}`);

      const downloadPromise = page.waitForEvent('download');
      await page.click('#download-result');
      const download = await downloadPromise;
      if (!download.suggestedFilename().endsWith('ai-workday-workfile.md')) throw new Error(`${scenario.name}: bad download filename`);

      await context.close();
      console.log(`${scenario.name}: ${verdict}`);
    }

    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    const mobilePage = await mobile.newPage();
    await mobilePage.goto(`${server.origin}/assessments/ai-workday-review/#review`, { waitUntil: 'networkidle' });
    const overflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    if (overflow) throw new Error('AI Workday Review has horizontal overflow at 390px.');
    await mobile.close();
    console.log('AI Workday Review browser flow passed four verdicts, downloads and mobile overflow check.');
  } finally {
    await browser.close();
    await server.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
