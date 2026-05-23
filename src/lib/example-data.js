export const EXAMPLE_BRAND = {
  logo: null,
  logoName: "",
  primaryColor: "#2D3526",
  accentColor: "#C49A3C",
  businessName: "Bloom & Co. Studio",
  createdBy: "Sarah Bloom",
};

export const EXAMPLE_DATA = {
  overview: {
    sopTitle: "New Client Onboarding",
    category: "Client Experience",
    owner: "Sarah",
    executor: "VA",
    frequency: "Triggered by event",
    versionDate: "2026-05-01",
    nextReview: "2026-11-01",
  },

  whyItMatters: {
    problemSolved:
      "Before we had this process, new clients would fall through the cracks — welcome emails would go out late, folders wouldn't get set up, and sometimes clients would show up to their first call without any of the prep materials. It felt chaotic and unprofessional for a studio that prides itself on client experience.",
    desiredOutcome:
      "Every new client gets a warm, organised welcome within 24 hours of signing. Their folders are ready, their first call is booked, and they feel genuinely taken care of from day one.",
    riskOfSkipping:
      "Clients notice when things feel rushed or disjointed right at the start. First impressions set the tone for the whole working relationship — if onboarding feels scattered, it shakes their confidence in us before the work has even begun.",
  },

  triggers: {
    trigger:
      "A new client signs their contract and pays their deposit. We get an automated notification from HoneyBook when both are complete.",
    completion:
      "The client has received their welcome email, their project folder is fully set up in Google Drive, their intake form is submitted, and their first call is confirmed on the calendar.",
    prerequisites:
      "The proposal and contract need to be fully signed and the deposit collected before we start. We also need their contact details and project brief in HoneyBook.",
    downstream:
      "Project kick-off can't happen until onboarding is done. The project management setup in ClickUp and the first deliverable timeline both depend on the intake form being completed.",
  },

  bigPicture: {
    flowSteps: [
      "Confirm contract and deposit",
      "Set up client folder in Google Drive",
      "Send welcome email with intake form",
      "Set up project in ClickUp",
      "Book kick-off call",
      "Run kick-off call",
    ],
  },

  detailedSteps: {
    steps: [
      {
        what: "Check HoneyBook for the signed contract and deposit confirmation. If both are marked complete, move the lead to the 'Active Client' pipeline stage.",
        tools: "HoneyBook",
        time: "5 min",
      },
      {
        what: "Duplicate the 'Client Template' folder in Google Drive and rename it with the client name and project year. Move it into the correct service folder. Share with the client and give them comment access to the shared deliverables subfolder only.",
        tools: "Google Drive",
        time: "10 min",
      },
      {
        what: "Send the welcome email using the template in HoneyBook. Personalise the first two lines with the client's name and what they've booked. Attach the intake form link. BCC the studio inbox.",
        tools: "HoneyBook, Gmail",
        time: "10 min",
      },
      {
        what: "Create a new project in ClickUp using the onboarding template for the relevant service. Set the start date to today and the target completion date based on the project scope. Assign yourself and any team members.",
        tools: "ClickUp",
        time: "10 min",
      },
      {
        what: "Send the Calendly scheduling link to the client via email so they can pick their kick-off call time. Once they book, add any prep notes to the calendar event.",
        tools: "Calendly, Google Calendar",
        time: "5 min",
      },
      {
        what: "Run the kick-off call using the call guide doc in the client's Google Drive folder. Take notes directly in the doc. Record the call if the client has consented. Send a follow-up summary within 2 hours.",
        tools: "Zoom, Google Docs",
        time: "60 min",
      },
    ],
  },

  decisions: {
    independentDecisions:
      "The VA can decide on folder naming, ClickUp task assignments within the project, and send the welcome email without checking in. If the client hasn't completed their intake form within 3 days, send one gentle follow-up independently.",
    approvalRequired:
      "Any changes to the project scope, timeline, or deliverables discussed on the kick-off call need to come to Sarah before being confirmed with the client. If the deposit hasn't cleared, hold off on the full setup until Sarah gives the go-ahead.",
    missingInfo:
      "If the contract is signed but deposit hasn't come through yet, flag it to Sarah and hold off on sending the welcome email. If the client's brief is missing key details, note it and raise it on the kick-off call rather than delaying the setup.",
    escalationContact: "Sarah — via Slack or text if urgent",
  },

  doneRight: {
    qualityChecklist: [
      "Contract signed and deposit confirmed in HoneyBook",
      "Client folder set up and shared with correct permissions",
      "Welcome email sent and personalised",
      "Intake form link included in welcome email",
      "ClickUp project created with correct template",
      "Kick-off call booked and confirmed",
      "Call summary sent within 2 hours of kick-off",
    ],
  },

  aiAutomation: {
    hasAutomation: true,
    aiUsage:
      "HoneyBook sends an automated notification when a contract is signed and deposit paid. Calendly handles scheduling and sends reminders automatically. We use a ChatGPT-drafted template for the kick-off call summary, which the VA reviews and personalises before sending.",
    aiGuardrails:
      "The welcome email must always be personalised — never sent as a straight template copy. The kick-off summary needs a human read-through before it goes to the client. Nothing client-facing should be sent without a final check.",
    connectedTools: "HoneyBook, Calendly, ClickUp, ChatGPT, Google Drive",
  },

  evolution: {
    metrics:
      "We track how long onboarding takes end-to-end (target: under 24 hours), whether clients show up to their kick-off call prepared, and whether any steps get flagged as missed in ClickUp. If clients are coming to the call without filling in the intake form, something's off.",
    reviewer: "Sarah",
    feedbackProcess:
      "VA flags anything that feels unclear or outdated in our weekly Slack check-in. Clients can flag issues directly via email — Sarah monitors this.",
    revisionTriggers:
      "A tool change (e.g., switching from HoneyBook to a different CRM), a new service type being added, or two or more clients in a row having a confusing onboarding experience.",
    reviewFrequency: "Every 6 months",
  },
};
