(function () {
  'use strict';

  const contexts = {
    plumbing: { name: 'plumbing', pack: 'Plumbers', back: '/tools/plumbers/', business: 'plumbing business', voice: '/voice-agent/home-services/' },
    construction: { name: 'construction', pack: 'Construction', back: '/tools/construction/', business: 'construction company', voice: '/voice-agent/construction/' },
    'home-services': { name: 'home services', pack: 'Home Services', back: '/tools/home-services/', business: 'home-service business', voice: '/voice-agent/home-services/' },
    'property-management': { name: 'property management', pack: 'Property Management', back: '/tools/property-management/', business: 'property-management team', voice: '/voice-agent/property-management/' },
    legal: { name: 'legal', pack: 'Law Firms', back: '/tools/legal/', business: 'law firm', voice: '/voice-agent/legal/' },
    healthcare: { name: 'healthcare administration', pack: 'Healthcare Practices', back: '/tools/healthcare/', business: 'healthcare practice', voice: '/voice-agent/healthcare/' },
    'financial-services': { name: 'financial services', pack: 'Financial Services', back: '/tools/financial-services/', business: 'financial-service firm', voice: '/voice-agent/financial-services/' },
  };
  const labels = {
    'customer-contact-workflow-review': { plumbing: 'Missed Call & Booking Check', construction: 'Lead & Estimate Follow-Up Review', 'home-services': 'Call Coverage & Booking Check', 'property-management': 'Leasing & Maintenance Request Review', legal: 'New Client Intake & Call Routing Review', healthcare: 'Patient Inquiry & Scheduling Review', 'financial-services': 'Client Inquiry & Scheduling Review' },
    'workflow-systems-review': { plumbing: 'Office-to-Field Workflow Review', construction: 'Field-to-Office Workflow Review', 'home-services': 'Booking-to-Dispatch Workflow Review', 'property-management': 'Property Request Routing Review', legal: 'Administrative Legal Workflow Review', healthcare: 'Administrative Handoff Review', 'financial-services': 'Client Service Workflow Review' },
    'founder-bottleneck-review': { plumbing: 'Owner Approval Bottleneck Review', construction: 'Contractor Knowledge Bottleneck Review', 'home-services': 'Service Owner Bottleneck Review' },
    'ai-fit-check': { plumbing: 'AI Fit Check for Plumbing Work', construction: 'AI Fit Check for Construction Work', 'home-services': 'AI Fit Check for Service Work', 'property-management': 'AI Fit Check for Property Work', legal: 'AI Fit Check for Legal Work', healthcare: 'AI Fit Check for Healthcare Administration', 'financial-services': 'AI Fit Check for Financial Work' },
    'human-review-checklist': { 'property-management': 'Human Review Check for Resident Communication', legal: 'Professional Human Review Checklist', healthcare: 'Human Review Checklist for Patient Communication', 'financial-services': 'Human Accountability Checklist' },
    'website-message-clarity-review': { plumbing: 'Service Website Message Check', construction: 'Project Fit & Website Message Check', 'home-services': 'Service Area & Website Clarity Check', 'property-management': 'Leasing Website Clarity Check', legal: 'Practice Area & Intake Message Check', healthcare: 'Patient Website Clarity Check', 'financial-services': 'Service & Client Fit Message Check' },
  };
  const params = new URLSearchParams(window.location.search);
  const key = params.get('industry');
  const context = contexts[key];
  if (!context) return;
  const engine = window.location.pathname.split('/').filter(Boolean).pop();
  const publicName = labels[engine]?.[key];
  if (!publicName) return;

  document.body.dataset.industryContext = key;
  const hero = document.querySelector('.content-hero');
  if (hero) {
    const bar = document.createElement('aside');
    bar.className = 'industry-context-bar';
    bar.setAttribute('aria-label', 'Industry tool context');
    bar.innerHTML = `<div class="site-shell industry-context-bar__inner"><p><strong>${publicName}</strong> <span>— selected for ${context.name} work</span></p><a href="${context.back}">Back to the ${context.pack} tool pack</a></div>`;
    hero.before(bar);
  }
  const business = document.querySelector('[name="business"]');
  if (business && !business.value) business.placeholder = `Describe your ${context.business}`;
  const work = document.querySelector('[name="workLabel"]');
  if (work && !work.value) work.placeholder = `One ${context.name} task or responsibility`;

  document.querySelectorAll('a[href^="/tools/"]').forEach((link) => {
    const url = new URL(link.href, window.location.origin);
    if (labels[url.pathname.split('/').filter(Boolean).pop()]?.[key]) {
      url.searchParams.set('industry', key);
      url.searchParams.set('source', 'industry-tools');
      link.href = `${url.pathname}${url.search}`;
    }
  });

  function choice(form, name) { return form.querySelector(`[name="${name}"]:checked`)?.value || form.elements.namedItem(name)?.value || ''; }
  function recommendation(form) {
    if (engine === 'customer-contact-workflow-review') {
      const gap = choice(form, 'gap');
      if (['answer', 'intake', 'schedule', 'route'].includes(gap)) return { title: 'Call coverage may be the first useful change.', copy: `The result points to a first-conversation or routing gap in this ${context.business}. A voice agent is one way to answer approved questions, capture the caller’s need and hand exceptions to a person.`, href: context.voice, label: `See the Voice Agent for ${context.pack}` };
      return { title: 'Fix the follow-up workflow before adding a new front door.', copy: 'The result points beyond call coverage. Map ownership, triggers and the system of record first so a new tool does not automate the same uncertainty.', href: '/tools/workflow-systems-review/', label: 'Map the workflow', free: true };
    }
    if (engine === 'ai-fit-check') {
      const sensitive = choice(form, 'sensitive');
      const consequence = choice(form, 'consequence');
      const reviewer = choice(form, 'reviewer');
      const owner = choice(form, 'owner');
      if ((sensitive === 'yes' || consequence === 'yes') && (reviewer !== 'yes' || owner !== 'yes')) return { title: 'Do not automate this yet.', copy: `The answers combine sensitive or consequential ${context.name} work with incomplete human ownership. Keep the task human until a qualified reviewer, approved information boundary and correction path are defined.`, href: '/tools/human-review-checklist/', label: 'Define the human review', free: true };
      return { title: 'Test the smallest safe version before choosing a platform.', copy: `Use the result to bound one ${context.name} task, name its reviewer and compare it with the current process. A short test should prove usefulness without expanding access or consequence.`, href: '/tools/ai-pilot-starter/', label: 'Build a 14-day AI test', free: true };
    }
    if (engine === 'human-review-checklist') {
      const verdict = document.querySelector('[data-result]')?.dataset.verdict;
      if (verdict === 'pause') return { title: 'Keep this work paused.', copy: `A critical safeguard is unresolved. Do not turn the ${context.name} use into an automation project until the named source, owner, consent or correction gap has a defensible answer.`, href: '/tools/ai-fit-check/', label: 'Recheck the task itself', free: true };
      if (verdict === 'revise') return { title: 'Build the review gap into the workflow.', copy: `The same ${context.name} responsibility should not depend on someone remembering the safeguard each time. Define the review point and its owner before expanding use.`, href: '/services/responsible-ai-implementation/', label: 'See responsible AI implementation' };
      return { title: 'Keep the standard attached to the work.', copy: 'The checks support this version, not permanent approval. Preserve the sources, named owner and correction path as the task or information changes.', href: '/tools/ai-pilot-starter/', label: 'Plan a bounded test', free: true };
    }
    if (engine === 'workflow-systems-review') return { title: 'Repair the handoff the map exposed.', copy: `Start with the ownership, duplicate entry or status gap named in the result. Connect existing systems only after the ${context.name} workflow has one clear trigger, owner and completion state.`, href: '/services/workflow-systems-integration/', label: 'See workflow and systems support' };
    if (engine === 'founder-bottleneck-review') return { title: 'Turn one repeated correction into a team asset.', copy: `The result identifies context the ${context.business} can reuse without transferring every exception or consequential decision. Start with the smallest guide, example set or approval rule.`, href: '/services/founder-knowledge-systems/', label: 'See founder knowledge support' };
    return { title: 'Fix the message gap before adding more traffic.', copy: `Use the result to make service fit and the next step clearer for this ${context.business}. Automation cannot repair a page that leaves the customer unsure what the business does or whether to contact it.`, href: '/services/website-messaging-audience-clarity/', label: 'See website messaging support' };
  }

  document.addEventListener('submit', (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    window.setTimeout(() => {
      const result = document.querySelector('#result:not([hidden]), [data-result-wrap]:not([hidden]), [data-fit-result]:not([hidden])');
      if (!result) return;
      result.querySelector('.industry-result-next')?.remove();
      const next = recommendation(form);
      const block = document.createElement('section');
      block.className = 'industry-result-next';
      block.setAttribute('aria-label', 'Industry-aware next step');
      block.innerHTML = `<p class="meta">What this means for ${context.name}</p><h3>${next.title}</h3><p>${next.copy}</p><div class="content-actions"><a class="${next.free ? 'button button--paper' : 'button button--blue'}" href="${next.href}${next.free && next.href.startsWith('/tools/') ? `?industry=${key}&source=industry-result` : ''}">${next.label}</a><a class="text-link" href="${context.back}">Return to the tool pack <span aria-hidden="true">→</span></a></div>`;
      result.append(block);
    }, 0);
  });
})();
