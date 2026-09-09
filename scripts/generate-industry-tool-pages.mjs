#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const origin = 'https://skills.oobcreative.com';

const engines = {
  contact: '/tools/customer-contact-workflow-review/',
  workflow: '/tools/workflow-systems-review/',
  founder: '/tools/founder-bottleneck-review/',
  fit: '/tools/ai-fit-check/',
  review: '/tools/human-review-checklist/',
  website: '/tools/website-message-clarity-review/',
};

const tool = (engine, name, situation, benefit, now) => ({ engine, name, situation, benefit, now });

const industries = [
  {
    slug: 'plumbers', context: 'plumbing', name: 'Plumbers', title: 'Free AI Tools for Plumbers | oobCREATIVE',
    heroAlt: 'Plumber repairing a kitchen sink while an illustrated AI assistant helps with intake',
    description: 'Five free AI and workflow tools for plumbing businesses to review missed calls, booking, dispatch handoffs, owner bottlenecks and responsible AI fit.',
    eyebrow: 'Free tools for plumbing businesses', h1: 'AI tools for plumbers should start with the calls and handoffs that shape the workday.',
    lead: 'Use five practical tools selected around service calls, scheduling, dispatch and the information that must move between the office and the field. No account or email is required.',
    recognition: 'A plumber cannot stop mid-job to answer every call. The office may be balancing urgent requests, routine bookings, reschedules and estimate follow-up while technicians need accurate information in the field. The useful question is not whether plumbing needs more AI. It is which handoff is costing attention, context or customer trust—and whether a small change can fix it.',
    realities: [
      ['Calls arrive during the work', 'Customers often call while the owner or technician is driving, working in a home or helping someone else.'],
      ['Urgency needs a human rule', 'A caller may describe a problem as urgent, but software should not make safety or technical judgments outside approved instructions.'],
      ['Office and field share one promise', 'Booking details, property access, job history and customer expectations need to reach the technician without being reconstructed.'],
      ['The owner still catches exceptions', 'Pricing, difficult customers, unusual jobs and schedule tradeoffs often return to the person with the most context.'],
    ],
    tools: [
      tool('contact', 'Missed Call & Booking Check', 'See where new service calls, reschedules and callbacks are being delayed or lost.', 'Leave with one customer-contact handoff to fix first.', 'Use it when voicemail and callbacks are carrying too much of the booking process.'),
      tool('workflow', 'Office-to-Field Workflow Review', 'Map how a service request moves from first contact through dispatch and completion.', 'Separate a process problem from an integration or software problem.', 'Use it before replacing scheduling, dispatch or customer-management software.'),
      tool('founder', 'Owner Approval Bottleneck Review', 'Find the questions and exceptions that repeatedly come back to the owner.', 'Turn recurring judgment into rules, examples and clear escalation points.', 'Use it when the team can do the work but still waits for one person.'),
      tool('fit', 'AI Fit Check for Plumbing Work', 'Test one proposed AI use against repetition, sensitivity, consequence and human control.', 'Learn whether to test it, reshape it or keep it human.', 'Use it before giving customer or job information to a new AI tool.'),
      tool('website', 'Service Website Message Check', 'Check whether a customer can quickly understand services, service area and the next step.', 'Find the message gap most likely to create a poor-fit call or abandoned visit.', 'Use it when the website gets traffic but customers still call for basic clarity.'),
    ],
    boundaryTitle: 'Keep diagnosis, safety and service commitments with qualified people.',
    boundaryCopy: 'AI can support approved office work. It should not diagnose plumbing conditions, decide whether a property is safe, promise arrival times or commit the business to final pricing.',
    boundaries: ['Define which situations immediately reach a person.', 'Collect only information the team is prepared to receive and protect.', 'Give every automated handoff a named human owner.'],
    conversion: '/voice-agent/home-services/', conversionLabel: 'Voice Agent for Home Services',
  },
  {
    slug: 'construction', context: 'construction', name: 'Construction', title: 'Free AI Tools for Construction Companies | oobCREATIVE',
    heroAlt: 'Construction lead reviewing plans on a jobsite with an illustrated AI assistant',
    description: 'Five free AI and workflow tools for contractors and construction companies covering lead response, estimate follow-up, field-to-office work and owner knowledge.',
    eyebrow: 'Free tools for contractors', h1: 'AI tools for construction should respect work that happens beyond the office.',
    lead: 'Review lead response, estimate follow-up, field-to-office information and owner-dependent decisions with five free tools built around recognizable construction work.',
    recognition: 'Construction leads arrive while people are on site. Estimates wait for details, project updates move through texts and calls, and decisions often return to the person who remembers the whole job. The opportunity is usually not a dramatic technology overhaul. It is a better first response, a cleaner handoff or a reusable piece of judgment.',
    realities: [
      ['New work competes with active work', 'Calls and inquiries need acknowledgment even when the team is focused on a current job.'],
      ['Estimates depend on follow-through', 'Site details, scope questions, approvals and proposal follow-up can stall across several people and systems.'],
      ['Field context has to travel', 'Changes, photos, schedules and customer expectations lose value when the office receives only part of the story.'],
      ['Experience lives with key people', 'Unusual conditions and relationship history make some decisions human while recurring preparation can become transferable.'],
    ],
    tools: [
      tool('contact', 'Lead & Estimate Follow-Up Review', 'Review what happens after a project inquiry, missed call or delivered estimate.', 'Identify the first response or follow-up gap worth fixing.', 'Use it when opportunities rely on someone remembering to call back.'),
      tool('workflow', 'Field-to-Office Workflow Review', 'Map one flow of project information from trigger through completion.', 'Find duplicate entry, unclear ownership and failed handoffs.', 'Use it before connecting or replacing project systems.'),
      tool('founder', 'Contractor Knowledge Bottleneck Review', 'Separate decisions that need the owner from context the team could reuse.', 'Create a practical first knowledge-transfer asset.', 'Use it when approvals, proposals or customer responses keep returning to one person.'),
      tool('fit', 'AI Fit Check for Construction Work', 'Evaluate one use such as call summaries, proposal preparation or project updates.', 'Set a safe role for AI without handing it site or contract judgment.', 'Use it before a promising demo becomes a company-wide tool.'),
      tool('website', 'Project Fit & Website Message Check', 'Check whether the site helps the right customer understand project fit and next steps.', 'Find missing information that creates poor-fit inquiries.', 'Use it before adding more traffic to an unclear offer.'),
    ],
    boundaryTitle: 'Automation can carry context; it cannot own the job.',
    boundaryCopy: 'Project commitments, estimates, contracts, change orders, safety and field judgment remain with qualified people. The system should make those decisions easier to prepare and hand off, not conceal who is responsible.',
    boundaries: ['Keep jobsite and safety decisions outside generic AI tools.', 'Confirm information before it reaches customers, contracts or schedules.', 'Preserve a visible path for exceptions and changed conditions.'],
    conversion: '/voice-agent/construction/', conversionLabel: 'Voice Agent for Construction',
  },
  {
    slug: 'home-services', context: 'home-services', name: 'Home Services', title: 'Free AI Tools for Home Service Businesses | oobCREATIVE',
    heroAlt: 'HVAC technician servicing an outdoor unit with an illustrated AI assistant',
    description: 'Five free AI and workflow tools for HVAC, electrical, plumbing and other home-service businesses managing calls, booking, dispatch and customer expectations.',
    eyebrow: 'Free tools for home-service teams', h1: 'AI tools for home services should make the next handoff easier, not make the customer work harder.',
    lead: 'Use five free tools to review call coverage, booking, dispatch, customer communication and the human limits around automation.',
    recognition: 'Home-service businesses receive calls when technicians are driving or inside a customer’s home. The person answering needs enough detail to book, route or promise a callback without diagnosing the problem. Behind that conversation, the office and field need one reliable version of what the customer expects.',
    realities: [
      ['Response time shapes trust', 'A clear acknowledgment and next step can matter before the business is ready to make a service commitment.'],
      ['Booking has exceptions', 'Service area, job type, schedule rules and existing-customer needs rarely fit one generic calendar link.'],
      ['Dispatch needs usable context', 'The field needs the address, access notes, customer description and expectations without searching several channels.'],
      ['Technical judgment stays human', 'The first conversation can gather information but should not diagnose equipment or determine safety.'],
    ],
    tools: [
      tool('contact', 'Call Coverage & Booking Check', 'Review missed calls, new requests, reschedules and after-hours contact.', 'Choose one customer-contact gap to repair.', 'Use it when the office cannot reliably answer every service call.'),
      tool('workflow', 'Booking-to-Dispatch Workflow Review', 'Map how a customer request becomes a scheduled and prepared visit.', 'Find unclear ownership and repeated information entry.', 'Use it before adding another dispatch or automation tool.'),
      tool('founder', 'Service Owner Bottleneck Review', 'Find recurring approvals and exceptions that interrupt the owner.', 'Capture decision rules without lowering service standards.', 'Use it when routine choices still wait for one person.'),
      tool('fit', 'AI Fit Check for Service Work', 'Evaluate one customer, office or field-support use.', 'Define what AI may prepare and what a person must approve.', 'Use it before automating customer-facing work.'),
      tool('website', 'Service Area & Website Clarity Check', 'Check whether services, locations and the next step are clear.', 'Reduce basic clarification calls and poor-fit inquiries.', 'Use it when customers reach the business without understanding fit.'),
    ],
    boundaryTitle: 'A helpful system knows when the technician needs to decide.',
    boundaryCopy: 'Routine intake and scheduling support can move faster. Diagnosis, safety, final pricing, arrival promises and difficult customer situations require the people with authority and field knowledge.',
    boundaries: ['State the limits in customer-facing language.', 'Route urgent or uncertain situations through approved human procedures.', 'Do not collect sensitive information simply because a form or agent can ask for it.'],
    conversion: '/voice-agent/home-services/', conversionLabel: 'Voice Agent for Home Services',
  },
  {
    slug: 'property-management', context: 'property-management', name: 'Property Management', title: 'Free AI Tools for Property Managers | oobCREATIVE',
    heroAlt: 'Property manager coordinating a kitchen repair with a plumber and illustrated AI assistant',
    description: 'Five free AI and workflow tools for property managers handling leasing inquiries, maintenance requests, routing, scheduling and resident communication.',
    eyebrow: 'Free tools for property managers', h1: 'AI tools for property management should separate the request before they accelerate it.',
    lead: 'Review leasing, maintenance, resident and vendor handoffs with five free tools that keep urgency, privacy and property decisions visible.',
    recognition: 'Residents, prospects, owners and vendors may all use the same number or inbox. A maintenance description needs a different path from a showing request, and neither should disappear into an unowned queue. Useful automation begins by clarifying the caller, property, request and responsible person.',
    realities: [
      ['One channel carries different relationships', 'The system needs to recognize who is contacting the office without exposing information across roles.'],
      ['Maintenance requests need ownership', 'Capturing a request is not the same as deciding urgency, safety, access or repair responsibility.'],
      ['Leasing questions repeat with variation', 'Approved property details can be consistent while eligibility and fair-housing decisions remain human.'],
      ['Escalation cannot be invisible', 'Residents and owners need to know what happens next when routine routing is not enough.'],
    ],
    tools: [
      tool('contact', 'Leasing & Maintenance Request Review', 'Review the first handoff for resident, prospect, owner and vendor contact.', 'Identify where requests are delayed, mixed or lost.', 'Use it when several caller types share one office workflow.'),
      tool('workflow', 'Property Request Routing Review', 'Map one request from intake to the responsible person and completed response.', 'Clarify routing, status and exception ownership.', 'Use it before automating maintenance or leasing messages.'),
      tool('fit', 'AI Fit Check for Property Work', 'Evaluate one proposed use against privacy, consequence and review.', 'Decide whether the task is ready for a bounded test.', 'Use it before AI touches resident or property information.'),
      tool('review', 'Human Review Check for Resident Communication', 'Check sources, fairness, ownership, disclosure and correction before use.', 'Make accountability visible for AI-assisted communication.', 'Use it before a message or process affects a resident decision.'),
      tool('website', 'Leasing Website Clarity Check', 'Review whether property information and next steps are understandable.', 'Find missing details that create repetitive inquiries.', 'Use it before adding more automated responses.'),
    ],
    boundaryTitle: 'Routing a request is different from making a property decision.',
    boundaryCopy: 'AI may collect approved details and move a request. Safety, emergency classification, fair-housing decisions, private account matters, lease disputes and repair responsibility need established human processes.',
    boundaries: ['Use role-appropriate access and information boundaries.', 'Name who owns every resident-facing exception.', 'Give people a clear way to reach a person when the standard path fails.'],
    conversion: '/voice-agent/property-management/', conversionLabel: 'Voice Agent for Property Management',
  },
  {
    slug: 'legal', context: 'legal', name: 'Law Firms', title: 'Free AI Tools for Law Firms | oobCREATIVE',
    heroAlt: 'Attorney reviewing client documents with an illustrated AI assistant handling a call',
    description: 'Five free AI and workflow tools for law firms reviewing new-client intake, scheduling, administrative handoffs and responsible use of AI.',
    eyebrow: 'Free tools for law firms', h1: 'AI tools for law firms should make responsibility clearer before they make work faster.',
    lead: 'Use five free tools to examine intake, routing, administrative work and human review without treating professional judgment as an automation task.',
    recognition: 'A prospective client often wants an immediate answer, but the firm must preserve confidentiality, conflicts procedures, deadlines and the boundary between information and legal advice. Administrative steps may be structured; professional conclusions are not a generic workflow shortcut.',
    realities: [
      ['Intake is not case evaluation', 'Basic facts can be gathered without implying representation, merit or conflict clearance.'],
      ['Consequences change the standard', 'A plausible but wrong response can affect rights, deadlines, trust and professional responsibility.'],
      ['Confidentiality starts early', 'The firm must decide what may be collected, where it goes and who is permitted to review it.'],
      ['Administrative consistency still helps', 'Scheduling, routing, document preparation and follow-up can improve when the approved boundaries are explicit.'],
    ],
    tools: [
      tool('contact', 'New Client Intake & Call Routing Review', 'Review the first contact without confusing intake with legal advice.', 'Identify one administrative handoff to improve.', 'Use it when prospective-client calls interrupt work or arrive after hours.'),
      tool('fit', 'AI Fit Check for Legal Work', 'Evaluate one proposed use against sensitivity, consequence and reviewer authority.', 'Learn whether to test, constrain or reject the use.', 'Use it before confidential or consequential information enters an AI tool.'),
      tool('review', 'Professional Human Review Checklist', 'Check facts, sources, ownership, disclosure and correction before anyone relies on AI-assisted work.', 'Create a visible pause when safeguards are incomplete.', 'Use it for a defined piece of work, not as blanket approval of a platform.'),
      tool('workflow', 'Administrative Legal Workflow Review', 'Map scheduling, document preparation or follow-up from trigger to completion.', 'Separate process repair from inappropriate automation.', 'Use it when staff repeat work across email, calendar and case systems.'),
      tool('website', 'Practice Area & Intake Message Check', 'Check whether visitors understand services, fit and the next step.', 'Find ambiguity that sends the wrong matters into intake.', 'Use it before increasing traffic or automating responses.'),
    ],
    boundaryTitle: 'Professional judgment is not an efficiency problem.',
    boundaryCopy: 'These tools can help examine administrative work. They do not provide legal advice, evaluate a claim, clear conflicts, calculate deadlines or approve confidentiality and compliance practices.',
    boundaries: ['Set intake limits before selecting software.', 'Require qualified review for consequential output.', 'Preserve withdrawal, correction and human escalation paths.'],
    conversion: '/voice-agent/legal/', conversionLabel: 'Voice Agent for Law Firms',
  },
  {
    slug: 'healthcare', context: 'healthcare', name: 'Healthcare Practices', title: 'Free AI Tools for Healthcare Practices | oobCREATIVE',
    heroAlt: 'Doctor speaking with a patient while an illustrated AI assistant supports the front desk',
    description: 'Five free AI and workflow tools for healthcare practices reviewing scheduling, administrative communication, privacy, human review and responsible AI fit.',
    eyebrow: 'Free tools for healthcare practices', h1: 'AI tools for healthcare should protect the boundary between office help and clinical care.',
    lead: 'Use five free tools to review appointment requests, administrative communication and AI responsibilities while keeping clinical judgment and protected information within approved processes.',
    recognition: 'Patients need a dependable next step, not an impressive automated conversation. Hours, directions, scheduling and approved preparation information may be routine. Symptoms, urgency, treatment, records and individual care are not. The workflow must make that boundary obvious to patients and staff.',
    realities: [
      ['Administrative and clinical needs arrive together', 'The first interaction must recognize when a routine path is no longer appropriate.'],
      ['Privacy is an implementation condition', 'A repetitive task is not automatically suitable for protected or sensitive information.'],
      ['Scheduling includes care rules', 'Availability alone may not determine appointment type, timing or qualified provider.'],
      ['Uncertainty needs a person', 'The system should never sound more certain than the approved information allows.'],
    ],
    tools: [
      tool('contact', 'Patient Inquiry & Scheduling Review', 'Review the administrative path for calls, appointment requests and callbacks.', 'Find the first nonclinical handoff worth improving.', 'Use it when routine contact competes with patient-facing staff time.'),
      tool('fit', 'AI Fit Check for Healthcare Administration', 'Evaluate one use against sensitivity, consequence, ownership and reversibility.', 'Learn whether the work is testable or should remain human.', 'Use it before choosing a tool or sharing practice information.'),
      tool('review', 'Human Review Checklist for Patient Communication', 'Check sources, facts, dignity, ownership, disclosure and correction.', 'Pause work when a critical safeguard is missing.', 'Use it before AI-assisted communication reaches patients.'),
      tool('workflow', 'Administrative Handoff Review', 'Map one nonclinical workflow from request to completed response.', 'Clarify staff ownership without automating clinical decisions.', 'Use it when scheduling or office requests cross several systems.'),
      tool('website', 'Patient Website Clarity Check', 'Review whether services, locations and administrative next steps are clear.', 'Find message gaps that create avoidable uncertainty.', 'Use it before adding a chatbot or automated response.'),
    ],
    boundaryTitle: 'A repetitive healthcare task can still carry sensitive consequences.',
    boundaryCopy: 'These tools do not determine clinical appropriateness, privacy compliance or emergency procedures. Diagnosis, triage, treatment guidance and protected-information workflows require qualified review and approved systems.',
    boundaries: ['Do not put protected information into an unapproved tool.', 'Keep clinical questions and urgent concerns with established human procedures.', 'Require named ownership for content, access, correction and escalation.'],
    conversion: '/voice-agent/healthcare/', conversionLabel: 'Voice Agent for Healthcare',
  },
  {
    slug: 'financial-services', context: 'financial-services', name: 'Financial Services', title: 'Free AI Tools for Financial Service Firms | oobCREATIVE',
    heroAlt: 'Financial professional meeting with a client beside an illustrated AI assistant',
    description: 'Five free AI and workflow tools for financial service firms reviewing client inquiry, scheduling, administrative follow-up and responsible AI use.',
    eyebrow: 'Free tools for financial-service firms', h1: 'AI tools for financial services should preserve the person who owns the answer.',
    lead: 'Use five free tools to examine client contact, administrative work and AI review without handing consequential financial communication to an unowned system.',
    recognition: 'Clients and prospects may need scheduling, document-delivery directions or the right person on the team. Routine preparation can help, but account actions, advice, private information and consequential communication need approved controls and qualified human responsibility.',
    realities: [
      ['Routine questions border consequential ones', 'A conversation can move quickly from office information into advice or account-specific requests.'],
      ['Private information needs an approved path', 'Convenient intake does not justify collecting credentials or sensitive financial data.'],
      ['Prepared work still needs ownership', 'Drafting and summarizing can support a professional without becoming the final decision.'],
      ['Correction must be possible', 'The firm needs to know who can stop, revise and explain an AI-assisted output.'],
    ],
    tools: [
      tool('contact', 'Client Inquiry & Scheduling Review', 'Review how prospect and client calls become appointments, messages or secure next steps.', 'Identify the first contact handoff worth fixing.', 'Use it when routine calls interrupt work or reach the wrong person.'),
      tool('fit', 'AI Fit Check for Financial Work', 'Evaluate one proposed use against privacy, consequence and human review.', 'Decide whether the task is ready for a bounded test.', 'Use it before account or client information reaches a new tool.'),
      tool('review', 'Human Accountability Checklist', 'Check facts, sources, ownership, disclosure and correction for AI-assisted work.', 'Reveal the safeguards that need attention before use.', 'Use it when a client or colleague may rely on the output.'),
      tool('workflow', 'Client Service Workflow Review', 'Map one administrative request from contact through completion.', 'Separate a routing problem from a system or automation need.', 'Use it before connecting inboxes, calendars and client systems.'),
      tool('website', 'Service & Client Fit Message Check', 'Review whether services, audience and next steps are clear.', 'Find ambiguity that creates poor-fit inquiries.', 'Use it before adding automated intake or more traffic.'),
    ],
    boundaryTitle: 'Preparation can be assisted; advice and account decisions remain accountable.',
    boundaryCopy: 'These tools do not approve regulatory, privacy or security practices. Advice, transactions, credentials, account-specific information and consequential financial communication remain inside qualified human and approved system controls.',
    boundaries: ['Define what is administrative before automating it.', 'Keep sensitive data in approved channels.', 'Name the person who reviews, corrects and owns the final communication.'],
    conversion: '/voice-agent/financial-services/', conversionLabel: 'Voice Agent for Financial Services',
  },
];

const esc = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const linkFor = (item, context) => `${engines[item.engine]}?industry=${context}&source=industry-tools`;

function renderPage(industry) {
  const canonical = `${origin}/tools/${industry.slug}/`;
  const itemList = industry.tools.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, url: `${origin}${linkFor(item, industry.context)}` }));
  const schema = JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: industry.title.replace(' | oobCREATIVE', ''), description: industry.description, url: canonical, mainEntity: { '@type': 'ItemList', numberOfItems: 5, itemListElement: itemList } });
  const cards = industry.tools.map((item, index) => `<article class="industry-tool-card"><p class="industry-tool-card__number" aria-hidden="true">0${index + 1}</p><div><p class="meta">${esc(item.situation)}</p><h3>${esc(item.name)}</h3><p>${esc(item.benefit)}</p><p class="industry-tool-card__now"><strong>Use it now when:</strong> ${esc(item.now)}</p><a class="button button--blue" href="${linkFor(item, industry.context)}">Start ${esc(item.name)}</a></div></article>`).join('\n');
  const realities = industry.realities.map(([title, copy]) => `<article><h3>${esc(title)}</h3><p>${esc(copy)}</p></article>`).join('\n');
  const boundaries = industry.boundaries.map((item) => `<li>${esc(item)}</li>`).join('');
  const related = industries.filter((item) => item.slug !== industry.slug).slice(0, 3).map((item) => `<a href="/tools/${item.slug}/">AI tools for ${esc(item.name)}</a>`).join('');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${esc(industry.description)}"><link rel="canonical" href="${canonical}"><title>${esc(industry.title)}</title><meta property="og:title" content="${esc(industry.title)}"><meta property="og:description" content="${esc(industry.description)}"><meta property="og:url" content="${canonical}"><meta property="og:type" content="website"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/content-pages.css"><link rel="stylesheet" href="/industry-tools.css"><script type="application/ld+json">${schema}</script></head>
<body class="content-page industry-page"><a class="skip-link" href="#main-content">Skip to content</a><header class="site-header"><div class="site-shell header-inner"><a class="mark" href="/" aria-label="oobCREATIVE home"><img src="/branding/Mark.svg" alt="" width="64" height="44"></a><nav class="desktop-nav" aria-label="Primary navigation"><a href="/free-tools/">Resources</a><a href="/about/">About</a></nav><details class="mobile-nav"><summary aria-label="Open navigation"><span></span><span></span><span></span></summary><nav aria-label="Mobile navigation"><a href="/free-tools/">Resources</a><a href="/about/">About</a></nav></details></div></header>
<main id="main-content"><div class="site-shell breadcrumbs"><nav aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/free-tools/">Resources</a></li><li aria-current="page">${esc(industry.name)}</li></ol></nav></div>
<section class="industry-hero"><div class="site-shell industry-hero__inner"><div><p class="eyebrow">${esc(industry.eyebrow)}</p><h1>${esc(industry.h1)}</h1><p class="lead">${esc(industry.lead)}</p><a class="button button--blue" href="#tool-pack">See the five-tool pack</a></div><figure class="industry-hero__image"><img src="/images/industry-heroes/${industry.context}.webp" alt="${esc(industry.heroAlt)}" width="800" height="620"></figure></div></section>
<section class="industry-recognition"><div class="site-shell industry-recognition__intro"><p class="eyebrow">Start with the actual work</p><h2>The useful opportunity is usually hiding in a handoff.</h2><p>${esc(industry.recognition)}</p></div><div class="site-shell industry-realities">${realities}</div></section>
<section id="tool-pack" class="industry-pack content-section--blue"><div class="site-shell section-heading-row"><div><p class="eyebrow">Curated free tool pack</p><h2>Five useful places to look before buying more software.</h2></div><p class="section-side-note">Each tool runs in your browser. Use the result even if you never contact oobCREATIVE.</p></div><div class="site-shell industry-tool-list">${cards}</div></section>
<section class="industry-boundary"><div class="site-shell industry-boundary__inner"><div><p class="eyebrow">Keep humans human</p><h2>${esc(industry.boundaryTitle)}</h2><p>${esc(industry.boundaryCopy)}</p></div><ul>${boundaries}</ul></div></section>
<section class="industry-next content-section--soft"><div class="site-shell industry-next__inner"><div><p class="eyebrow">After a useful result</p><h2>The next step should follow from what the tool finds.</h2><p>If call coverage is the real problem, the result may introduce the ${esc(industry.conversionLabel)}. A workflow, message or responsibility problem will point somewhere else. The free answer comes first.</p></div><div><p class="meta">Related industry tool packs</p><nav aria-label="Related industry tool packs">${related}</nav><a class="text-link" href="/free-tools/">See all free resources <span aria-hidden="true">→</span></a></div></div></section>
</main><footer><div class="site-shell footer-main"><p><a href="/free-tools/">Free resources</a></p></div></footer></body></html>`;
}

for (const industry of industries) {
  const pageDir = join(root, 'tools', industry.slug);
  mkdirSync(pageDir, { recursive: true });
  writeFileSync(join(pageDir, 'index.html'), renderPage(industry));
}

console.log(`Generated ${industries.length} industry acquisition pages.`);
