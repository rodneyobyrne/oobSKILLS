(function (root, factory) {
  const engine = factory();
  if (typeof module === 'object' && module.exports) module.exports = engine;
  else root.OobCustomerFlowEngine = engine;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function architectureFor(input) {
    const existingFitsField = input.relationshipModel === 'field' && input.existingSystem === 'operational';
    const existingFitsProfessional = input.relationshipModel === 'professional' && input.existingSystem === 'crm';
    const existingFitsAppointment = input.relationshipModel === 'appointment' && input.existingSystem === 'vertical';
    const existingFitsTransactional = input.relationshipModel === 'transactional' && input.existingSystem === 'pos';
    const currentSystemUsable = input.recordQuality === 'strong' || input.recordQuality === 'mostly';

    if ((existingFitsField || existingFitsProfessional || existingFitsAppointment || existingFitsTransactional) && currentSystemUsable) {
      return 'strengthen-existing';
    }

    if (input.relationshipModel === 'appointment') return 'vertical-first';
    if (input.relationshipModel === 'transactional') return 'pos-first';
    if (input.relationshipModel === 'field') return 'job-operations';
    if (input.relationshipModel === 'professional') return 'relationship-crm';
    return 'audit-mixed';
  }

  function readinessFor(input) {
    if (input.accessReadiness === 'hard') return 'access-first';
    if (input.recordQuality === 'weak' || input.recordQuality === 'unknown') return 'clean-first';
    if (input.sourceOwnership === 'unclear' || input.existingSystem === 'scattered' || input.existingSystem === 'none') return 'ownership-first';
    return 'ready';
  }

  function architectureDetails(key, input) {
    const details = {
      'strengthen-existing': {
        verdict: 'Keep the system. Fix the connections.',
        direction: 'Your current operating model already has a plausible primary customer system. Replacing it would create unnecessary migration risk unless the review uncovers a specific capability gap.',
        system: 'Existing primary customer / operating platform',
        example: 'Keep the platform that already owns the customer relationship, then improve capture, follow-up and handoffs around it.'
      },
      'vertical-first': {
        verdict: 'Keep the vertical platform at the center.',
        direction: 'Appointments and specialized service records are usually better anchored in the platform designed for that operating context. Add communication around it before adding a second CRM.',
        system: 'Vertical scheduling / practice / service platform',
        example: 'Use the existing or selected vertical platform as the system of record; connect website, phone, reminders and reporting around it.'
      },
      'pos-first': {
        verdict: 'Keep the customer transaction system at the center.',
        direction: 'The relationship is primarily organized around purchases, orders or repeat transactions. A separate CRM may add complexity before it adds value.',
        system: 'POS / commerce customer platform',
        example: 'Square or another suitable POS/customer platform may already be enough if it reliably owns customer and purchase history.'
      },
      'job-operations': {
        verdict: 'Move job-based operations toward one operational source of truth.',
        direction: 'The business is organized around jobs, properties, crews, estimates, schedules or repeat field service. Customer identity and work status should live together in a job-oriented operating platform rather than across Sheets, inboxes and accounting software.',
        system: 'Field-service / job-management platform',
        example: 'Jobber is one candidate; another field-service platform may fit better depending on dispatch, estimating, inventory, payments and reporting needs.'
      },
      'relationship-crm': {
        verdict: 'Use a relationship CRM as the primary customer record.',
        direction: 'The work is organized around people, companies, conversations, opportunities, proposals and ongoing relationships rather than jobs at a property.',
        system: 'Relationship CRM',
        example: 'HubSpot is one candidate; another CRM may fit better depending on sales process, email, reporting and integration requirements.'
      },
      'audit-mixed': {
        verdict: 'Audit the customer flow before choosing another platform.',
        direction: 'The business mixes operating models or the dominant customer relationship is not yet clear. Choosing software first could simply create another silo.',
        system: 'To be selected after the workflow audit',
        example: 'Choose the platform around the dominant operational object: job, appointment, relationship, order or another vertical record.'
      }
    };

    const detail = details[key];
    if (key === 'strengthen-existing' && input.existingSystem === 'vertical') {
      detail.system = 'Existing vertical platform';
    } else if (key === 'strengthen-existing' && input.existingSystem === 'pos') {
      detail.system = 'Existing POS / commerce platform';
    } else if (key === 'strengthen-existing' && input.existingSystem === 'crm') {
      detail.system = 'Existing CRM';
    } else if (key === 'strengthen-existing' && input.existingSystem === 'operational') {
      detail.system = 'Existing field-service / operating platform';
    }
    return detail;
  }

  function buildPriorities(input, architectureKey) {
    const priorities = [];

    if (input.accessReadiness === 'hard') priorities.push('Secure administrator access, exports and ownership of the current systems before planning a migration or automation.');
    if (input.recordQuality === 'weak' || input.recordQuality === 'unknown') priorities.push('Clean duplicates, inconsistent fields and obsolete records before importing them into a new system.');
    if (input.sourceOwnership !== 'clear') priorities.push('Name one owner for customer identity and one authoritative place where staff update it.');
    if (input.firstCapture !== 'primary') priorities.push('Create one defined capture path for new inquiries instead of letting phone, website, email and text create separate records.');
    if (input.retyping === 'frequent') priorities.push('Remove the highest-volume retyping handoff after the source of truth is established.');
    if (input.followup === 'missed') priorities.push('Create a visible follow-up responsibility and trigger so a customer does not depend on memory or an inbox.');
    if (input.conversationHistory !== 'primary') priorities.push('Bring useful call, email and text history back to the customer record or a linked communication history.');
    if (input.sheetsRole === 'central' || input.sheetsRole === 'operational') priorities.push('Move operational customer updates out of Google Sheets; keep Sheets for reporting, exports or temporary analysis.');
    if (input.integration === 'manual' || input.integration === 'none') priorities.push('Connect the website and phone workflow only after the primary record and ownership rules are clear.');
    if (architectureKey === 'audit-mixed') priorities.push('Map one real customer from first contact through completion and payment, then choose the system around the step that actually organizes the work.');

    if (!priorities.length) priorities.push('Document the current ownership rules and improve the single handoff creating the most avoidable customer or staff friction.');
    return priorities.slice(0, 5);
  }

  function buildWarnings(input) {
    const warnings = [];
    if (input.sensitiveData === 'yes') warnings.push('Do not move sensitive or regulated records into a general-purpose CRM or automation path until privacy, permissions and vendor suitability are confirmed. Treat this as a platform requirement, not a reason to ignore the business operating model.');
    if (input.willingness === 'no') warnings.push('A new platform will not solve the problem if the team is not prepared to use one authoritative record.');
    if (input.existingSystem === 'scattered') warnings.push('Several systems currently appear to compete as the customer record. Integration alone can make conflicting records move faster.');
    if (input.sheetsRole === 'central') warnings.push('Google Sheets is currently acting as an operational database. Migration should include field mapping and ownership rules, not just a CSV import.');
    if (input.accountingAsCrm === 'yes') warnings.push('Accounting software should remain authoritative for accounting, but it should not be the default owner of operational customer status unless the business truly operates there.');
    return warnings;
  }

  function buildFlow(input, detail) {
    const intake = input.primaryChannel === 'phone'
      ? 'Phone'
      : input.primaryChannel === 'website'
        ? 'Website / form'
        : input.primaryChannel === 'email'
          ? 'Email'
          : input.primaryChannel === 'text'
            ? 'Text'
            : 'Multiple customer channels';

    const workObject = input.relationshipModel === 'field'
      ? 'Request / quote / job'
      : input.relationshipModel === 'professional'
        ? 'Inquiry / opportunity / proposal'
        : input.relationshipModel === 'appointment'
          ? 'Appointment / service record'
          : input.relationshipModel === 'transactional'
            ? 'Order / purchase / customer history'
            : 'Defined operating record';

    return [
      { label: 'Customer enters', value: intake },
      { label: 'Customer identified', value: detail.system },
      { label: 'Work organized as', value: workObject },
      { label: 'Customer updated from', value: detail.system },
      { label: 'Accounting owned by', value: 'Accounting platform' },
      { label: 'Analysis / exports', value: 'Google Sheets when useful—not as a competing customer record' }
    ];
  }

  function evaluate(input) {
    const architectureKey = architectureFor(input);
    const readiness = readinessFor(input);
    const detail = architectureDetails(architectureKey, input);
    const priorities = buildPriorities(input, architectureKey);
    const warnings = buildWarnings(input);

    const readinessCopy = {
      'access-first': {
        label: 'Prepare access first',
        explanation: 'The architecture can be selected, but implementation should not begin until the business controls the logins, exports and administrative access required to understand the current records.'
      },
      'clean-first': {
        label: 'Clean the records before migration',
        explanation: 'The next platform should not inherit duplicate, inconsistent or poorly understood data. Clean and map the information before moving it.'
      },
      'ownership-first': {
        label: 'Define ownership before automation',
        explanation: 'The most important decision is where customer information becomes authoritative. Automation should follow that decision, not substitute for it.'
      },
      ready: {
        label: 'Ready for a bounded systems review',
        explanation: 'The current information is stable enough to map the flow, confirm platform fit and improve one or two high-value connections without redesigning everything at once.'
      }
    }[readiness];

    return {
      architectureKey,
      readiness,
      verdict: detail.verdict,
      direction: detail.direction,
      primarySystem: detail.system,
      platformExample: detail.example,
      readinessLabel: readinessCopy.label,
      readinessExplanation: readinessCopy.explanation,
      priorities,
      warnings,
      flow: buildFlow(input, detail)
    };
  }

  return { evaluate };
});