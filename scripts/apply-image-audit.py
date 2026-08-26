from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

def write(path, content):
    p = ROOT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding='utf-8')

p = ROOT / 'index.html'
html = p.read_text(encoding='utf-8')
html = html.replace('https://skills.oobcreative.com/images/ai-relationship/opportunity.webp','https://skills.oobcreative.com/images/ai-relationship/ai-workflow-map.webp')
html = html.replace('src="/images/ai-relationship/oob-ai-hero.png"','src="/images/ai-relationship/ai-workflow-map.webp"')
html = html.replace('alt="A confused business leader meets with a cheerful AI agent that presents a complicated process as easy."','alt="A business owner and AI assistant map a workflow together, making steps, handoffs and decisions visible."')
html = html.replace('width="1200"\n              height="800"','width="1122"\n              height="1402"')
html = html.replace('<figcaption id="hero-art-caption" class="hero-art__caption">A confused business leader meets with a cheerful AI agent that presents a complicated process as easy.</figcaption>','<figcaption id="hero-art-caption" class="hero-art__caption">A business owner and AI assistant map the work before choosing what to change.</figcaption>')
for old,new in {
'/images/ai-character/section-lockups/problem-question.webp':'/images/ai-character/poses/robot-thinking.webp',
'/images/ai-character/section-lockups/free-tools.webp':'/images/ai-character/poses/robot-pointing.webp',
'/images/ai-character/section-lockups/plain-answers.webp':'/images/ai-character/poses/robot-thinking.webp',
'/images/ai-character/section-lockups/three-problems.webp':'/images/ai-character/poses/robot-confident.webp',
'/images/ai-character/section-lockups/customer-call.webp':'/images/ai-character/poses/robot-waving.webp',
'/images/ai-character/section-lockups/measure-first.webp':'/images/ai-character/poses/robot-thinking.webp',
'/images/ai-character/section-lockups/support-level.webp':'/images/ai-character/poses/robot-thumbs-up.webp',
'/images/ai-character/section-lockups/human-centered.webp':'/images/ai-character/poses/robot-waving.webp',
'/images/ai-character/section-lockups/unbox.webp':'/images/ai-character/poses/robot-confident.webp',
}.items(): html=html.replace(old,new)
html = re.sub(r'(<img src="/images/ai-character/poses/robot-[^"]+\.webp" alt="" )width="\d+" height="\d+"',r'\1width="305" height="526" data-visual-role="headline-pose"',html)
experience_images={'opportunity':'/images/experiences/missed-calls.webp','friction':'/images/experiences/repeated-admin.webp','team':'/images/experiences/team-ai-boundaries.webp','build':'/images/experiences/website-message-clarity.webp','control':'/images/experiences/idea-to-test.webp'}
def inject_experience(match):
    block=match.group(0); key=match.group(1)
    block=re.sub(r'\s*<img class="review-option__art".*?>','',block,flags=re.S)
    image=f'\n                <img class="review-option__art" src="{experience_images[key]}" alt="" width="512" height="512" loading="eager" decoding="async" data-visual-role="experience">'
    return block.replace('<span class="review-option__marker" aria-hidden="true"></span>','<span class="review-option__marker" aria-hidden="true"></span>'+image)
html=re.sub(r'<button class="review-option" type="button" data-review="(opportunity|friction|team|build|control)" aria-pressed="false">.*?</button>',inject_experience,html,flags=re.S)
p.write_text(html,encoding='utf-8')

hero_map={
'start-here/index.html':('choose-the-right-path.webp','A business owner and AI assistant compare practical paths before choosing the next step.'),
'free-tools/index.html':('practical-ai-toolkit.webp','The oobCREATIVE AI assistant opens a practical toolkit of checks, decisions and working aids.'),
'assessments/index.html':('human-reviewed-ai-workflow-steps.webp','A person and AI assistant move through staged, human-reviewed workflow steps.'),
'practical-ai/index.html':('ai-workflow-map.webp','A business owner and AI assistant map a workflow together before adding AI.'),
'tools/ai-fit-check/index.html':('choose-the-right-path.webp','A business owner and AI assistant compare different paths before deciding whether AI fits the task.'),
'tools/human-review-checklist/index.html':('human-reviewed-ai-workflow-steps.webp','A person and AI assistant review work through visible checkpoints before release.'),
'tools/ai-pilot-starter/index.html':('responsible-ai-working-plan.webp','Two people and an AI assistant build a working plan with visible ownership and safeguards.'),
'assessments/ai-workday-review/index.html':('ai-workflow-map.webp','A business owner and AI assistant make the workday workflow visible before testing AI.'),
'assessments/idea-to-test-review/index.html':('human-reviewed-ai-workflow-steps.webp','A person and AI assistant move an idea through clear test stages and checkpoints.'),
'services/index.html':('choose-the-right-path.webp','A business owner and AI assistant compare practical paths based on the business problem.'),
'services/responsible-ai-implementation/index.html':('responsible-ai-working-plan.webp','Two people and an AI assistant build a responsible working plan with visible safeguards.'),
'services/local-ai-systems/index.html':('local-small-business-ai-workflow.webp','A local business owner and AI assistant connect customer contact, scheduling and follow-up.'),
'services/ai-receptionist-small-business/index.html':('ai-receptionist-human-handoff.webp','An AI receptionist receives a call and routes information toward a clear human follow-up.'),
}
for rel,(image,alt) in hero_map.items():
    file=ROOT/rel; source=file.read_text(encoding='utf-8')
    if 'content-hero__visual' in source: continue
    match=re.search(r'<aside class="content-hero__aside">(.*?)</aside>',source,re.S)
    if not match: raise RuntimeError(f'No content hero aside found in {rel}')
    aside=match.group(0)
    visual=f'<div class="content-hero__visual"><img class="content-hero__scene" src="/images/ai-relationship/{image}" alt="{alt}" width="1122" height="1402" decoding="async" fetchpriority="high">{aside}</div>'
    file.write_text(source[:match.start()]+visual+source[match.end():],encoding='utf-8')

p=ROOT/'content-pages.css'; css=p.read_text(encoding='utf-8')
old='.content-hero__inner { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(260px, .65fr); gap: clamp(2.5rem, 7vw, 7rem); align-items: end; }\n.content-hero h1 { max-width: 13ch; }\n.content-hero__aside { max-width: 31rem; padding-left: 1.4rem; border-left: 5px solid var(--ballpoint); }\n.content-hero__aside p:last-child { margin-bottom: 0; color: var(--soft); }'
new='.content-hero__inner { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(340px, .95fr); gap: clamp(2.5rem, 6vw, 6rem); align-items: center; }\n.content-hero h1 { max-width: 13ch; }\n.content-hero__visual { position: relative; min-width: 0; min-height: clamp(380px, 38vw, 590px); display: flex; align-items: center; justify-content: center; }\n.content-hero__scene { display: block; width: min(100%, 560px); height: auto; max-height: 590px; object-fit: contain; }\n.content-hero__aside { position: absolute; right: 0; bottom: 0; width: min(88%, 31rem); max-width: 31rem; padding: 1.2rem 1.35rem; border: 1px solid var(--ink); border-left: 5px solid var(--ballpoint); background: rgba(255,255,255,.94); box-shadow: 8px 8px 0 rgba(17,17,17,.08); }\n.content-hero--blue .content-hero__aside { background: rgba(246,248,255,.96); }\n.content-hero__aside p:last-child { margin-bottom: 0; color: var(--soft); }'
if old not in css: raise RuntimeError('Expected original content hero CSS was not found.')
css=css.replace(old,new)
css=css.replace('@media (max-width: 980px) {\n  .content-hero__inner, .tool-sheet, .product-layout { grid-template-columns: 1fr; }','@media (max-width: 980px) {\n  .content-hero__inner, .tool-sheet, .product-layout { grid-template-columns: 1fr; }\n  .content-hero__visual { min-height: 0; width: min(100%, 720px); justify-self: center; padding-bottom: 3.5rem; }\n  .content-hero__scene { width: min(100%, 560px); }\n  .content-hero__aside { position: relative; right: auto; bottom: auto; width: min(92%, 31rem); margin: -3rem 0 0 auto; }')
css=css.replace('@media (max-width: 720px) {\n  .content-grid { grid-template-columns: 1fr; }','@media (max-width: 720px) {\n  .content-grid { grid-template-columns: 1fr; }\n  .content-hero { padding-block: clamp(3rem, 10vw, 4.5rem); }\n  .content-hero__inner { gap: 2rem; }\n  .content-hero__visual { padding-bottom: 2.5rem; }\n  .content-hero__scene { width: min(92vw, 520px); }\n  .content-hero__aside { width: 94%; margin-top: -2.25rem; padding: 1rem 1.05rem; }')
p.write_text(css,encoding='utf-8')

p=ROOT/'home-ai-cards-v3.css'; css=p.read_text(encoding='utf-8'); start=css.index('.review-option::before {'); end=css.index('.review-option > span:last-child {'); p.write_text(css[:start]+'.review-option::before {\n  content: none !important;\n  display: none !important;\n  background-image: none !important;\n}\n\n'+css[end:],encoding='utf-8')
p=ROOT/'hero-animation.js'; js=p.read_text(encoding='utf-8').replace('PNG <img>','WebP <img>').replace('/images/ai-relationship/oob-ai-hero.png','/images/ai-relationship/ai-workflow-map.webp').replace('A confused business leader meets with a cheerful AI agent that presents a complicated process as easy.','A business owner and AI assistant map a workflow together, making steps, handoffs and decisions visible.').replace('image.width = 1200;','image.width = 1122;').replace('image.height = 800;','image.height = 1402;'); p.write_text(js,encoding='utf-8')
write('site-polish-v4.js',"""(() => {
  /* Image hierarchy is authored directly in HTML. This only removes stale legacy pose markup. */
  document.querySelectorAll('.content-hero__art').forEach((art) => {
    art.remove();
    document.querySelector('.content-hero__inner')?.classList.remove('has-ai-art');
  });
})();
""")
p=ROOT/'site-polish-v4.css'; css=p.read_text(encoding='utf-8').replace('normal image files','semantic WebP image files').replace('one solo robot pose.','one solo robot pose WebP.'); p.write_text(css,encoding='utf-8')

p=ROOT/'tests/test-homepage-browser.cjs'; t=p.read_text(encoding='utf-8')
t=t.replace("'/images/ai-relationship/oob-ai-hero.png'","'/images/ai-relationship/ai-workflow-map.webp'").replace('assert.equal(mobile.heroImageNaturalWidth, 1200);','assert.equal(mobile.heroImageNaturalWidth, 1122);').replace('assert.equal(mobile.heroImageNaturalHeight, 800);','assert.equal(mobile.heroImageNaturalHeight, 1402);')
t=t.replace("""    assert.deepEqual(mobile.cardArtSrcs, [
      '/images/ai-relationship-v2/opportunity.png',
      '/images/ai-relationship-v2/friction.png',
      '/images/ai-relationship-v2/team.png',
      '/images/ai-relationship-v2/build.png',
      '/images/ai-relationship-v2/control.png'
    ]);""","""    assert.deepEqual(mobile.cardArtSrcs, [
      '/images/experiences/missed-calls.webp',
      '/images/experiences/repeated-admin.webp',
      '/images/experiences/team-ai-boundaries.webp',
      '/images/experiences/website-message-clarity.webp',
      '/images/experiences/idea-to-test.webp'
    ]);""")
t=t.replace("""    assert.ok(mobile.lockupSrcs.every(src => [
      '/images/ai-character/poses/pointing.png',
      '/images/ai-character/poses/thinking.png',
      '/images/ai-character/poses/waving.png'
    ].includes(src)), 'Every H2 lockup uses a simple solo robot pose PNG');""","""    assert.ok(mobile.lockupSrcs.every(src => src.startsWith('/images/ai-character/poses/robot-') && src.endsWith('.webp')), 'Every H2 lockup uses a semantic solo robot WebP');""")
old_test="""    await page.goto(`${server.origin}/practical-ai/`, { waitUntil: 'networkidle' });
    const practicalAiHero = await page.evaluate(() => ({
      genericPoseArt: document.querySelectorAll('.content-hero__art').length,
      hasLegacyLayoutClass: document.querySelector('.content-hero__inner')?.classList.contains('has-ai-art'),
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    }));
    assert.equal(practicalAiHero.genericPoseArt, 0, 'Generic solo robot poses are not used as page-hero art');
    assert.equal(practicalAiHero.hasLegacyLayoutClass, false, 'Legacy three-column hero layout is removed');
    assert.equal(practicalAiHero.overflow, false);

    assert.deepEqual(consoleErrors, []);"""
new_test="""    const heroPages = {
      '/start-here/': '/images/ai-relationship/choose-the-right-path.webp',
      '/free-tools/': '/images/ai-relationship/practical-ai-toolkit.webp',
      '/assessments/': '/images/ai-relationship/human-reviewed-ai-workflow-steps.webp',
      '/practical-ai/': '/images/ai-relationship/ai-workflow-map.webp',
      '/tools/ai-fit-check/': '/images/ai-relationship/choose-the-right-path.webp',
      '/tools/human-review-checklist/': '/images/ai-relationship/human-reviewed-ai-workflow-steps.webp',
      '/tools/ai-pilot-starter/': '/images/ai-relationship/responsible-ai-working-plan.webp',
      '/assessments/ai-workday-review/': '/images/ai-relationship/ai-workflow-map.webp',
      '/assessments/idea-to-test-review/': '/images/ai-relationship/human-reviewed-ai-workflow-steps.webp',
      '/services/': '/images/ai-relationship/choose-the-right-path.webp',
      '/services/responsible-ai-implementation/': '/images/ai-relationship/responsible-ai-working-plan.webp',
      '/services/local-ai-systems/': '/images/ai-relationship/local-small-business-ai-workflow.webp',
      '/services/ai-receptionist-small-business/': '/images/ai-relationship/ai-receptionist-human-handoff.webp',
    };
    for (const [route, expectedSrc] of Object.entries(heroPages)) {
      await page.goto(`${server.origin}${route}`, { waitUntil: 'networkidle' });
      const heroState = await page.evaluate(() => ({
        sceneSrc: document.querySelector('.content-hero__scene')?.getAttribute('src'),
        genericPoseArt: document.querySelectorAll('.content-hero__art').length,
        hasLegacyLayoutClass: document.querySelector('.content-hero__inner')?.classList.contains('has-ai-art'),
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      }));
      assert.equal(heroState.sceneSrc, expectedSrc, `${route} uses the mapped detailed WebP scene`);
      assert.equal(heroState.genericPoseArt, 0, `${route} does not use generic solo robot hero art`);
      assert.equal(heroState.hasLegacyLayoutClass, false, `${route} has no legacy three-column hero class`);
      assert.equal(heroState.overflow, false, `${route} has no horizontal overflow`);
    }

    assert.deepEqual(consoleErrors, []);"""
if old_test not in t: raise RuntimeError('Expected original practical AI hero browser test was not found.')
t=t.replace(old_test,new_test).replace('Visual hierarchy passed: scene PNG hero, experience choice cards, solo robot H2 lockups, no sprite hero art.','Visual hierarchy passed: scene WebP hero, experience choice cards, solo robot H2 lockups, no sprite hero art.')
p.write_text(t,encoding='utf-8')

write('.github/workflows/static.yml','''# Validate every proposed release and deploy the same tested artifact to GitHub Pages.
name: Validate and deploy static content to Pages

on:
  pull_request:
    branches: ["main"]
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  validate:
    runs-on: ubuntu-latest
    env:
      SITE_RELEASE_VERSION: ${{ github.sha }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm
      - name: Install test dependencies
        run: npm ci
      - name: Build and validate public artifact
        run: npm run validate
      - name: Run browser journeys
        run: npm run test:browser
      - name: Verify homepage release assets
        run: |
          file _site/images/ai-relationship/ai-workflow-map.webp | grep -F "Web/P image"
          grep -F 'src="/images/ai-relationship/ai-workflow-map.webp"' _site/index.html
          grep -F "/home-ai-cards-v3.css?v=${GITHUB_SHA}" _site/index.html
          ! grep -F 'oob-ai-hero-animated.svg' _site/index.html
      - name: Upload tested Pages artifact
        if: github.event_name != 'pull_request'
        uses: actions/upload-pages-artifact@v3
        with:
          path: './_site'

  deploy:
    if: github.event_name != 'pull_request'
    needs: validate
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    concurrency:
      group: "pages"
      cancel-in-progress: false
    steps:
      - name: Setup Pages
        uses: actions/configure-pages@v5
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v5
''')

obsolete=['images/ai-character/homepage-hero.png','images/ai-character/cards/build.png','images/ai-character/cards/control.png','images/ai-character/cards/friction.png','images/ai-character/cards/opportunity.png','images/ai-character/cards/team.png','images/ai-character/poses/AI-BOT-POSE-01.png','images/ai-character/poses/AI-BOT-POSE-02.png','images/ai-character/poses/AI-BOT-POSE-03.png','images/ai-character/poses/AI-BOT-POSE-06.png','images/ai-character/poses/AI-BOT-POSE-07.png','images/ai-character/poses/AI-BOT-POSE-08.png','images/ai-character/poses/AI-BOT-POSE-10.png','images/ai-character/poses/pointing.png','images/ai-character/poses/pointing2.png','images/ai-character/poses/thinking.png','images/ai-character/poses/waving.png','images/ai-character/section-lockups/ChatGPT Image Aug 25, 2026, 02_49_02 PM (2).png','images/ai-character/section-lockups/ChatGPT Image Aug 25, 2026, 02_49_02 PM (3).png','images/ai-character/section-lockups/ChatGPT Image Aug 25, 2026, 02_49_02 PM (4).png','images/ai-character/section-lockups/ChatGPT Image Aug 25, 2026, 02_49_02 PM (5).png','images/ai-character/section-lockups/ChatGPT Image Aug 25, 2026, 02_49_02 PM (6).png','images/ai-character/section-lockups/ChatGPT Image Aug 25, 2026, 02_49_02 PM (8).png','images/ai-character/section-lockups/customer-call.webp','images/ai-character/section-lockups/free-tools.webp','images/ai-character/section-lockups/human-centered.webp','images/ai-character/section-lockups/measure-first.webp','images/ai-character/section-lockups/plain-answers.webp','images/ai-character/section-lockups/problem-question.webp','images/ai-character/section-lockups/support-level.webp','images/ai-character/section-lockups/three-problems.webp','images/ai-character/section-lockups/unbox.webp','images/ai-relationship-v2/build.png','images/ai-relationship-v2/control.png','images/ai-relationship-v2/friction.png','images/ai-relationship-v2/opportunity.png','images/ai-relationship-v2/team.png','images/ai-relationship/connect-trust.png','images/ai-relationship/sign-post.png','images/ai-relationship/small-business.png','images/ai-relationship/success-steps.png','images/ai-relationship/tool-chest.png','images/ai-relationship/work-map.png','images/ai-relationship/working-plan.png','images/ai-relationship/oob-ai-hero.png','images/ai-relationship/opportunity.webp','images/ai-relationship/friction.webp','images/ai-relationship/team.webp','images/ai-relationship/build.webp','images/ai-relationship/control.webp','images/ai-relationship/plain-answers.webp']
for rel in obsolete:
    file=ROOT/rel
    if file.exists(): file.unlink()
for rel in ['index.html','home-ai-cards-v3.css','hero-animation.js','site-polish-v4.js']:
    text=(ROOT/rel).read_text(encoding='utf-8')
    for stale in ['ai-relationship-v2/','oob-ai-hero.png','/poses/pointing.png','/poses/pointing2.png','/poses/thinking.png','/poses/waving.png']:
        if stale in text: raise RuntimeError(f'Stale image reference {stale!r} remains in {rel}')
Path(__file__).unlink()
print('Applied semantic WebP image system and removed superseded assets.')
