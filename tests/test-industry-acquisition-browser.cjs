const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { startStaticServer } = require('./static-server.cjs');

const pages = ['plumbers', 'construction', 'home-services', 'property-management', 'legal', 'healthcare', 'financial-services'];

async function submitSimpleTool(page, values = {}) {
  const form = page.locator('#tool');
  for (const input of await form.locator('input[required], textarea[required]').all()) {
    if (!(await input.inputValue())) await input.fill('Test workflow information');
  }
  for (const [name, value] of Object.entries(values)) await page.locator(`[name="${name}"]`).selectOption(value);
  await form.locator('button[type="submit"]').click();
  await page.locator('.industry-result-next').waitFor();
}

async function submitFit(page, answers) {
  await page.locator('[name="workLabel"]').fill('Appointment request response');
  await page.locator('[name="task"][value="customer-response"]').check();
  await page.locator('[name="jobType"]').selectOption('customer-contact');
  for (const [name, value] of Object.entries(answers)) await page.locator(`[name="${name}"][value="${value}"]`).check();
  await page.locator('button[type="submit"]').click();
  await page.locator('.industry-result-next').waitFor();
}

(async () => {
  const server = await startStaticServer();
  const browser = await chromium.launch({ headless: true });
  try {
    for (const viewport of [{ width: 320, height: 720 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      const consoleErrors = [];
      page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
      for (const slug of pages) {
        await page.goto(`${server.origin}/tools/${slug}/`, { waitUntil: 'networkidle' });
        assert.equal(await page.locator('h1').count(), 1, `${slug} has one H1 at ${viewport.width}px`);
        assert.equal(await page.locator('.industry-tool-card').count(), 5, `${slug} keeps a five-tool pack`);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
        assert.equal(overflow, false, `${slug} has no horizontal overflow at ${viewport.width}px`);
      }
      assert.deepEqual(consoleErrors, [], `No acquisition-page console errors expected at ${viewport.width}px`);
      await context.close();
    }

    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();

    await page.goto(`${server.origin}/tools/plumbers/`);
    await page.locator('.industry-tool-card').first().locator('a').click();
    assert.match(page.url(), /customer-contact-workflow-review\/\?industry=plumbing/);
    await page.locator('[name="business"]').fill('Plumbing business');
    await page.locator('[name="channels"][value="phone"]').check();
    await submitSimpleTool(page, { gap: 'answer' });
    assert.equal(await page.locator('.industry-context-bar strong').textContent(), 'Missed Call & Booking Check');
    assert.equal(await page.locator('.industry-result-next a.button').getAttribute('href'), '/voice-agent/home-services/');

    await page.goto(`${server.origin}/tools/construction/`);
    await page.locator('.industry-tool-card').nth(1).locator('a').click();
    await submitSimpleTool(page, { friction: 'handoff' });
    assert.equal(await page.locator('.industry-result-next a.button').getAttribute('href'), '/services/workflow-systems-integration/');

    const safe = { repeated: 'yes', defined: 'yes', sources: 'yes', sensitive: 'no', consequence: 'no', reviewer: 'yes', owner: 'yes', reversible: 'yes' };
    await page.goto(`${server.origin}/tools/ai-fit-check/?industry=healthcare&source=industry-tools`);
    await submitFit(page, safe);
    assert.equal(await page.locator('.industry-result-next a.button').getAttribute('href'), '/tools/ai-pilot-starter/?industry=healthcare&source=industry-result');

    const restrained = { ...safe, sensitive: 'yes', consequence: 'yes', reviewer: 'no', owner: 'unclear' };
    await page.goto(`${server.origin}/tools/ai-fit-check/?industry=healthcare&source=industry-tools`);
    await submitFit(page, restrained);
    assert.equal(await page.locator('.industry-result-next h3').textContent(), 'Do not automate this yet.');
    assert.equal(await page.locator('.industry-result-next a.button').getAttribute('href'), '/tools/human-review-checklist/?industry=healthcare&source=industry-result');

    await page.goto(`${server.origin}/tools/customer-contact-workflow-review/?industry=property-management&source=industry-tools`);
    await page.locator('[name="business"]').fill('Property-management team');
    await page.locator('[name="channels"][value="phone"]').check();
    await submitSimpleTool(page, { gap: 'route' });
    assert.equal(await page.locator('.industry-result-next a.button').getAttribute('href'), '/voice-agent/property-management/');

    for (const industry of ['legal', 'financial-services']) {
      await page.goto(`${server.origin}/tools/human-review-checklist/?industry=${industry}&source=industry-tools`);
      await page.locator('[name="workLabel"]').fill('Client-facing AI-assisted response');
      await page.locator('[name="workType"]').selectOption({ index: 1 });
      for (const name of ['sources', 'facts', 'evidence', 'limits', 'dignity', 'fairness', 'voice', 'owner', 'disclosure', 'correctable']) {
        await page.locator(`[name="${name}"][value="${name === 'owner' ? 'unsure' : 'yes'}"]`).check();
      }
      await page.locator('button[type="submit"]').click();
      await page.locator('.industry-result-next').waitFor();
      assert.equal(await page.locator('.industry-result-next h3').textContent(), 'Keep this work paused.');
      assert.match(await page.locator('.industry-result-next a.button').getAttribute('href'), new RegExp(`/tools/ai-fit-check/\\?industry=${industry}`));
    }

    await context.close();
    console.log('Industry acquisition journeys passed at 320, 768 and 1440 pixels, including all required result routes.');
  } finally {
    await browser.close();
    await server.close();
  }
})().catch((error) => { console.error(error); process.exitCode = 1; });
