#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, '..');
const phoneDisplay = '970-404-8398';
const phoneHref = '9704048398';

const industries = [
  {
    slug: 'construction',
    name: 'Construction',
    audience: 'contractors and construction companies',
    title: 'AI Receptionist for Construction Companies | oobCREATIVE',
    description: 'An AI receptionist for construction companies that answers routine calls, captures project details and routes customers, vendors and active-job questions to the right person.',
    eyebrow: 'AI receptionist for construction companies',
    headline: 'Keep working. Your calls are still getting answered.',
    lead: 'When the person who knows the answer is on a jobsite, driving or coordinating a crew, callers should not have to start over with voicemail.',
    visualLabel: 'Construction jobsite or contractor office image',
    situationsHeading: 'One phone number can carry several kinds of construction calls.',
    situationsIntro: 'The agent begins by understanding why someone called, then stays inside the information and next steps your company has approved.',
    situations: [
      ['New project inquiries', 'Capture the project type, location, timing and the best way to continue the conversation.'],
      ['Current customers', 'Identify the project and reason for calling, then notify or route the appropriate person.'],
      ['Vendors and subcontractors', 'Collect the company, job and request without sending every call through the owner.'],
      ['Service-area questions', 'Answer from the locations, project types and basic company information you approve.'],
    ],
    handles: [
      'Approved service and project-type questions',
      'Caller name, contact information and reason for calling',
      'Project location, timing and basic fit details',
      'Appointment requests or callbacks when configured',
      'Summaries delivered to the right person',
    ],
    boundaries: [
      'Quoting project costs or making estimates',
      'Promising availability, timelines or acceptance of work',
      'Interpreting contracts, change orders or payment disputes',
      'Making technical, site-safety or emergency judgments',
    ],
    faq: [
      ['Do we have to replace our business phone number?', 'Usually not. Calls can often be forwarded from the number customers already know to a separate agent line. We confirm the phone setup before anything changes.'],
      ['Can it tell someone what a project will cost?', 'No. The agent can collect the information your estimator needs, but pricing and project commitments stay with your team.'],
      ['What if a caller has a problem on an active job?', 'The agent identifies the project and the reason for the call, then follows the notification or handoff path you approve. It does not make field or safety decisions.'],
    ],
  },
  {
    slug: 'home-services',
    name: 'Home Services',
    audience: 'home-service businesses',
    title: 'AI Receptionist for Home Service Businesses | oobCREATIVE',
    description: 'An AI receptionist for HVAC, plumbing, electrical and other home-service businesses that captures service needs, answers approved questions and helps callers reach the next step.',
    eyebrow: 'AI receptionist for home services',
    headline: 'Answer the next service call while you finish this one.',
    lead: 'Customers often call when your team is driving, working in a home or helping someone else. The agent can collect what happened and move routine requests forward without pretending to be the technician.',
    visualLabel: 'Home-service technician or dispatch office image',
    situationsHeading: 'A useful first conversation gives the office something to act on.',
    situationsIntro: 'The agent gathers the practical details your team needs while keeping diagnosis, urgency and service commitments with a qualified person.',
    situations: [
      ['New service requests', 'Collect the issue, property location, contact details and preferred next step.'],
      ['Existing appointments', 'Identify the customer and appointment so the office can respond with context.'],
      ['Service-area questions', 'Answer from the locations, hours and services your business has approved.'],
      ['After-hours calls', 'Capture routine needs and follow your defined instructions for situations requiring a person.'],
    ],
    handles: [
      'Approved service, location and business-hour questions',
      'Customer contact and property information',
      'A plain-language description of the service need',
      'Scheduling requests when a calendar is connected',
      'Call summaries and team notifications',
    ],
    boundaries: [
      'Diagnosing equipment, wiring, plumbing or building conditions',
      'Deciding whether a situation is safe or an emergency',
      'Promising arrival times, availability or final pricing',
      'Handling disputes that need human judgment',
    ],
    faq: [
      ['Can it schedule service?', 'The Connected plan can use one approved calendar or scheduling connection. Your availability rules determine what can be booked.'],
      ['Will it try to diagnose the problem?', 'No. It records the customer’s description and follows your approved questions. Technical judgment remains with your team.'],
      ['What happens with an urgent call?', 'You define the language and routing for urgent situations. The agent should never substitute for emergency services or a qualified professional’s judgment.'],
    ],
  },
  {
    slug: 'property-management',
    name: 'Property Management',
    audience: 'property managers',
    title: 'AI Receptionist for Property Management | oobCREATIVE',
    description: 'An AI receptionist for property management teams that separates resident, leasing, owner and vendor calls, captures useful details and follows approved handoff rules.',
    eyebrow: 'AI receptionist for property management',
    headline: 'Sort the call before it becomes another interruption.',
    lead: 'Residents, prospects, owners and vendors may all call the same office number. The agent can establish who needs what and deliver a useful handoff without making property or policy decisions.',
    visualLabel: 'Property management office or multifamily property image',
    situationsHeading: 'Different callers need different paths through the same office.',
    situationsIntro: 'The agent separates routine questions from matters that need a property manager, leasing professional or maintenance contact.',
    situations: [
      ['Resident requests', 'Capture the property, unit, contact information and a clear description of the request.'],
      ['Leasing inquiries', 'Answer approved property questions and collect move timing, household needs and contact details.'],
      ['Owner questions', 'Identify the property and request, then route it to the responsible person.'],
      ['Vendor coordination', 'Collect the company, property and purpose of the call before notifying the team.'],
    ],
    handles: [
      'Approved office, property and leasing information',
      'Caller type, property and reason for calling',
      'Maintenance-request intake within defined limits',
      'Tour or conversation scheduling when configured',
      'Different notification paths for residents, prospects and vendors',
    ],
    boundaries: [
      'Determining whether a condition is safe or an emergency',
      'Making leasing, eligibility or fair-housing decisions',
      'Discussing private account details without an approved secure process',
      'Resolving payment, lease or resident disputes',
    ],
    faq: [
      ['Can it tell resident calls from leasing calls?', 'Yes. The conversation can begin by identifying the caller and property, then follow a different approved path for each need.'],
      ['Can it take maintenance requests?', 'It can capture and deliver a structured request. Emergency classification, private account information and repair decisions require clearly defined human procedures.'],
      ['Does it replace our property-management software?', 'No. It can support the first conversation and connect with selected workflows when useful; it does not require replacing systems that already work.'],
    ],
  },
  {
    slug: 'legal',
    name: 'Legal',
    audience: 'law firms and legal practices',
    title: 'AI Receptionist for Law Firms | oobCREATIVE',
    description: 'An AI receptionist for law firms that answers approved office questions, captures prospective-client information and schedules conversations while preserving attorney judgment.',
    eyebrow: 'AI receptionist for law firms',
    headline: 'Let routine calls move forward without turning intake into legal advice.',
    lead: 'A prospective client may need a prompt, calm first response. The agent can collect basic information and explain the next step while leaving conflicts, deadlines and legal judgment to the firm.',
    visualLabel: 'Law office reception or attorney workspace image',
    situationsHeading: 'The first call should create clarity without creating a legal conclusion.',
    situationsIntro: 'The agent handles approved office information and structured intake, then returns matters requiring professional judgment to the firm.',
    situations: [
      ['Prospective-client calls', 'Collect basic contact information, matter type and the reason the person is seeking help.'],
      ['Current-client messages', 'Identify the caller and matter context, then notify the approved team member.'],
      ['Practice-area questions', 'Explain the categories of work the firm has approved without assessing the caller’s case.'],
      ['Consultation requests', 'Offer approved scheduling options without implying representation or acceptance.'],
    ],
    handles: [
      'Approved office, location and practice-area information',
      'Basic prospective-client intake',
      'Consultation scheduling when configured',
      'Messages and summaries routed to the firm',
      'English and Spanish conversations',
    ],
    boundaries: [
      'Giving legal advice or evaluating a claim',
      'Confirming representation or completing conflict clearance',
      'Calculating or interpreting deadlines',
      'Discussing confidential matter details outside an approved process',
    ],
    faq: [
      ['Does a call create an attorney-client relationship?', 'No. The agent should clearly explain that the conversation does not establish representation and that the firm must review the matter.'],
      ['Can it screen a potential case?', 'It can ask the firm’s approved intake questions. It cannot evaluate legal merit, conflicts, deadlines or whether the firm will accept the matter.'],
      ['How is sensitive information handled?', 'The intake scope, recording choices, retention and handoff process must be reviewed for the firm’s confidentiality and professional obligations before launch.'],
    ],
  },
  {
    slug: 'healthcare',
    name: 'Healthcare',
    audience: 'healthcare practices',
    title: 'AI Receptionist for Healthcare Practices | oobCREATIVE',
    description: 'An AI receptionist for healthcare practices that answers approved office questions, supports scheduling and routes patient calls while keeping clinical matters with qualified people.',
    eyebrow: 'AI receptionist for healthcare practices',
    headline: 'Help patients reach the right next step without putting clinical judgment in the call.',
    lead: 'Patients need clear office information and a dependable handoff. The agent can support routine conversations, but care decisions, urgent symptoms and sensitive records remain human responsibilities.',
    visualLabel: 'Healthcare reception or medical office image',
    situationsHeading: 'Routine office help and clinical care need a visible boundary.',
    situationsIntro: 'The agent is configured around administrative responsibilities and the practice’s approved privacy, scheduling and escalation procedures.',
    situations: [
      ['New-patient questions', 'Explain approved services, locations and next steps without assessing clinical fit.'],
      ['Appointment requests', 'Offer approved scheduling options or collect a callback request.'],
      ['Existing-patient calls', 'Identify the administrative need and route the caller through the practice’s approved process.'],
      ['Office information', 'Answer approved questions about hours, directions and preparation instructions.'],
    ],
    handles: [
      'Approved administrative and office information',
      'Scheduling or callback requests when configured',
      'Basic routing by caller need',
      'Language approved by the practice',
      'Human handoff for sensitive or uncertain situations',
    ],
    boundaries: [
      'Diagnosing, triaging or giving medical advice',
      'Interpreting symptoms, test results or treatment instructions',
      'Collecting protected information without an approved compliant workflow',
      'Substituting for emergency services or a clinical professional',
    ],
    faq: [
      ['Is the agent appropriate for every patient conversation?', 'No. Its role should be limited to approved administrative tasks. Clinical, urgent and sensitive conversations need a qualified person or the practice’s established emergency instructions.'],
      ['Can it connect to our schedule?', 'The Connected plan can support one scheduling connection when the system, privacy requirements and booking rules are suitable.'],
      ['What about patient privacy?', 'Privacy, recording, vendors, information collection and handoff requirements must be reviewed for the practice before launch. The standard setup does not assume every healthcare workflow is appropriate.'],
    ],
  },
  {
    slug: 'financial-services',
    name: 'Financial Services',
    audience: 'financial-service firms',
    title: 'AI Receptionist for Financial Service Firms | oobCREATIVE',
    description: 'An AI receptionist for accounting, advisory and financial-service firms that handles approved office questions, captures caller needs and schedules conversations without giving financial advice.',
    eyebrow: 'AI receptionist for financial services',
    headline: 'Make the first conversation useful without handing judgment to the agent.',
    lead: 'Clients and prospects may need scheduling, document-delivery directions or the right member of the team. The agent can clarify the request while leaving advice, account actions and private details inside approved human processes.',
    visualLabel: 'Financial services office or client meeting image',
    situationsHeading: 'A well-routed call protects both the client’s time and the firm’s responsibility.',
    situationsIntro: 'The agent handles routine office information and intake while avoiding advice, account decisions and unapproved collection of private financial information.',
    situations: [
      ['Prospective-client inquiries', 'Collect contact details, the general service need and the requested next step.'],
      ['Appointment requests', 'Schedule from approved availability or capture a callback request.'],
      ['Current-client messages', 'Identify the caller and general purpose, then notify the appropriate person.'],
      ['Routine office questions', 'Answer approved questions about services, hours, locations and document-delivery methods.'],
    ],
    handles: [
      'Approved service and office information',
      'General caller needs and contact details',
      'Scheduling requests when configured',
      'Instructions for approved secure communication channels',
      'Summaries and routing to the right team member',
    ],
    boundaries: [
      'Providing tax, investment, lending or financial advice',
      'Making transactions or account changes',
      'Collecting credentials or sensitive financial data in an ordinary call',
      'Resolving billing, account or compliance disputes',
    ],
    faq: [
      ['Can it answer questions about a client’s account?', 'Not through the standard setup. Account-specific information and actions require an approved identity, security and compliance process.'],
      ['Can it give general financial guidance?', 'No. The agent stays with approved office information and intake. Advice and recommendations remain with a qualified person.'],
      ['Can it help during busy filing or renewal periods?', 'It can answer approved routine questions, capture what callers need and organize callbacks. Scope and usage should be matched to expected call volume.'],
    ],
  },
];

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const listItems = (items) => items.map((item) => `<li>${escapeHtml(item)}</li>`).join('\n                ');

function renderPage(industry) {
  const situationCards = industry.situations.map(([title, copy]) => `
          <article class="situation-card">
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(copy)}</p>
          </article>`).join('');

  const faqItems = industry.faq.map(([question, answer]) => `
          <details>
            <summary>${escapeHtml(question)}</summary>
            <p>${escapeHtml(answer)}</p>
          </details>`).join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(industry.description)}">
  <link rel="canonical" href="https://skills.oobcreative.com/voice-agent/${industry.slug}/">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(industry.title)}">
  <meta property="og:description" content="${escapeHtml(industry.description)}">
  <meta property="og:url" content="https://skills.oobcreative.com/voice-agent/${industry.slug}/">
  <title>${escapeHtml(industry.title)}</title>
  <link rel="icon" href="/branding/Mark-black.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/voice-agent/industry.css?v=20260908">
  <link rel="stylesheet" href="/voice-agent/voice-samples.css?v=20260910">
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to content</a>

  <header class="brandbar">
    <div class="shell brandbar__inner">
      <a class="brand" href="/voice-agent/" aria-label="oobCREATIVE voice agent overview">
        <img src="/branding/oob_horiz-flat-lite.png" alt="oobCREATIVE" width="594" height="138">
      </a>
      <a class="button" href="tel:${phoneHref}">Call the live agent</a>
    </div>
  </header>

  <main id="main-content">
    <section class="hero">
      <div class="hero__grid">
        <figure class="visual-slot" role="img" aria-label="${escapeHtml(industry.visualLabel)}">
          <span>Image area</span>
          <strong>${escapeHtml(industry.name)}</strong>
        </figure>
        <div class="hero__copy">
          <p class="eyebrow">${escapeHtml(industry.eyebrow)}</p>
          <h1>${escapeHtml(industry.headline)}</h1>
          <p class="hero__lead">${escapeHtml(industry.lead)}</p>
          <div class="hero__actions">
            <a class="button button--blue" href="tel:${phoneHref}">Call the AI voice agent</a>
            <a class="phone-number" href="tel:${phoneHref}">${phoneDisplay}</a>
          </div>
          <p class="hero__note">Try the live oobCREATIVE agent. Ask how it would handle a call for ${escapeHtml(industry.audience)}, request time with Rodney or another human on his team, or switch to Spanish.</p>
          <p class="hero__price">Plans start at $495 setup + $149/month · 250 minutes included</p>
        </div>
      </div>
    </section>

    <section class="situations">
      <div class="shell">
        <div class="section-head">
          <div>
            <p class="eyebrow">The calls behind the technology</p>
            <h2>${escapeHtml(industry.situationsHeading)}</h2>
          </div>
          <p>${escapeHtml(industry.situationsIntro)}</p>
        </div>
        <div class="situation-grid">${situationCards}
        </div>
      </div>
    </section>

    <section class="responsibility">
      <div class="shell responsibility__grid">
        <div class="responsibility__intro">
          <p class="eyebrow">A job with boundaries</p>
          <h2>Let the agent handle the repeatable part. Keep judgment with people.</h2>
          <p>Its job is not to sound human enough to take over. Its job is to be clear, useful and honest about when your team needs to step in.</p>
        </div>
        <div class="boundary-card boundary-card--handles">
          <h3>The agent can handle</h3>
          <ul>
            ${listItems(industry.handles)}
          </ul>
        </div>
        <div class="boundary-card boundary-card--human">
          <h3>A person handles</h3>
          <ul>
            ${listItems(industry.boundaries)}
          </ul>
        </div>
      </div>
    </section>

    <section class="plans" id="plans">
      <div class="shell">
        <div class="section-head section-head--plans">
          <div>
            <p class="eyebrow">Simple pricing</p>
            <h2>Start with answering. Connect the next step when it helps.</h2>
          </div>
          <p>Setup uses the business information, responsibilities and boundaries you approve. Deeper customer research, custom workflows and substantial integrations are scoped separately before work begins.</p>
        </div>
        <div class="plan-grid">
          <article class="plan">
            <p class="plan__label">Base</p>
            <h3>Answer + Deliver</h3>
            <div class="price-lockup"><span>$495 setup</span><strong>$149 <small>/ month</small></strong></div>
            <p class="usage">250 minutes included / month</p>
            <p>For a business that needs useful call handling without rebuilding everything else.</p>
            <ul>
              <li>24/7 AI call answering</li>
              <li>One AI voice line</li>
              <li>Approved questions and answers</li>
              <li>Caller details and call summaries</li>
              <li>English and Spanish conversations</li>
              <li>Routine answer updates and tuning</li>
            </ul>
            <a class="button plan__cta" href="tel:${phoneHref}">Start with Base</a>
          </article>
          <article class="plan plan--connected">
            <p class="plan__label">Connected</p>
            <h3>Answer + Schedule</h3>
            <div class="price-lockup"><span>$795 setup</span><strong>$299 <small>/ month</small></strong></div>
            <p class="usage">500 minutes included / month</p>
            <p>For businesses ready to move an approved call into the next practical step.</p>
            <ul>
              <li>Everything in Base</li>
              <li>One calendar or scheduling connection</li>
              <li>Booking from approved availability</li>
              <li>Caller-specific routing</li>
              <li>Notifications and human handoffs</li>
              <li>Workflow testing before launch</li>
            </ul>
            <a class="button button--blue plan__cta" href="tel:${phoneHref}">Choose Connected</a>
          </article>
          <article class="plan plan--partner">
            <p class="plan__label">Partner</p>
            <h3>Bring It On.</h3>
            <div class="price-lockup"><span>Starting at $1,500 setup</span><strong>$600+ <small>/ month</small></strong></div>
            <p class="usage">Usage + integrations scoped to the problem</p>
            <p>For customer-contact work that does not fit neatly into a package.</p>
            <ul>
              <li>Voice, scheduling and contact systems</li>
              <li>CRM and workflow connections when useful</li>
              <li>Multi-step or higher-volume calls</li>
              <li>Communication and workflow problem-solving</li>
              <li>Ongoing refinement as the business changes</li>
            </ul>
            <a class="button button--paper plan__cta" href="tel:${phoneHref}">Start the conversation</a>
          </article>
        </div>
        <p class="fineprint"><strong>Additional usage:</strong> $0.25/minute beyond the included allowance. Paid third-party apps, unusual carrier charges, deeper research, new workflows and substantial scope changes are discussed and quoted before they are added.</p>
      </div>
    </section>

    <section class="setup">
      <div class="shell setup__grid">
        <div>
          <p class="eyebrow">Built around your business</p>
          <h2>The agent gets a defined job before it answers a customer.</h2>
        </div>
        <ol>
          <li><strong>Organize the source.</strong><span>We collect the services, questions, answers, language and limits the agent needs.</span></li>
          <li><strong>Test real conversations.</strong><span>You hear expected and difficult calls before customers rely on the system.</span></li>
          <li><strong>Launch with a handoff.</strong><span>The agent answers within its role and sends the conversation to the right person.</span></li>
        </ol>
      </div>
    </section>

    <section class="faq">
      <div class="shell faq__grid">
        <div>
          <p class="eyebrow">Questions worth answering</p>
          <h2>Useful technology should make its limits clear.</h2>
        </div>
        <div class="faq__items">${faqItems}
        </div>
      </div>
    </section>

    <section class="proof">
      <div class="shell proof__grid">
        <figure class="visual-slot visual-slot--small" role="img" aria-label="Industry-specific call-to-action illustration area">
          <span>Illustration area</span>
          <strong>${escapeHtml(industry.name)}</strong>
        </figure>
        <div class="proof__copy">
          <p class="eyebrow">Call it before you buy it</p>
          <h2>Hear how the agent handles a conversation.</h2>
          <p>Ask it about oobCREATIVE, describe a call from your business or have it schedule time for you to talk with Rodney or another human on his team.</p>
          <div class="proof__actions">
            <a class="button button--blue" href="tel:${phoneHref}">Call ${phoneDisplay}</a>
            <span>También habla español bastante bien.</span>
          </div>
          <a class="voice-samples-compact" href="/voice-agent/#voice-samples">Hear all 11 English and Spanish voice samples</a>
        </div>
      </div>
    </section>
  </main>

  <footer>
    <div class="shell footer__inner">
      <img src="/branding/oob_horiz-flat-lite.png" alt="oobCREATIVE" width="594" height="138" loading="lazy" decoding="async">
      <span>Go Deeper, Not Louder. · Roaring Fork Valley, Colorado</span>
      <a href="/privacy-policy/">Privacy Policy</a>
    </div>
  </footer>
</body>
</html>
`;
}

for (const industry of industries) {
  const outputDirectory = resolve(repositoryRoot, 'voice-agent', industry.slug);
  mkdirSync(outputDirectory, { recursive: true });
  writeFileSync(resolve(outputDirectory, 'index.html'), renderPage(industry));
}

console.log(`Generated ${industries.length} voice-agent industry pages.`);
