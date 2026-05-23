/**
 * Shine Bright SOP Framework — Section Definitions
 *
 * This is the core data structure that defines all 9 sections of the
 * Shine Bright SOP Framework, their fields, types, and tier access.
 *
 * Original work of Shine Bright Virtual / Shine Designs LLC.
 */

export const SECTIONS = {
  overview: {
    id: "overview",
    num: 1,
    title: "Overview",
    subtitle: "Let's start with the basics — what is this process and who's involved?",
    basic: true,
    aiPrompt:
      "Extract: SOP title, category (Operations/Client Experience/Marketing/Finance/Team), who owns this process, who executes it, and frequency.",
    fields: [
      {
        key: "sopTitle",
        label: "What do you call this process?",
        type: "text",
        placeholder: "e.g., Client Onboarding, Weekly Invoicing, Content Publishing",
      },
      {
        key: "category",
        label: "What area of the business is it for?",
        type: "select",
        options: [
          "Operations",
          "Client Experience",
          "Marketing",
          "Finance",
          "Team",
        ],
      },
      {
        key: "owner",
        label: "Who's responsible for making sure this gets done?",
        type: "text",
        placeholder: "e.g., Jess, Operations Manager — the person who owns it, even if they don't do the work",
      },
      {
        key: "executor",
        label: "Who actually does the work?",
        type: "text",
        placeholder: "e.g., VA, Team Lead, Me",
      },
      {
        key: "frequency",
        label: "How often does this need to happen?",
        type: "select",
        options: [
          "One-time",
          "Daily",
          "Weekly",
          "Bi-weekly",
          "Monthly",
          "Quarterly",
          "Annually",
          "Triggered by event",
        ],
      },
      {
        key: "status",
        label: "Where is this SOP at?",
        type: "select",
        options: ["Draft", "Active", "Needs Review", "Archived"],
      },
      { key: "versionDate", label: "Version Date", type: "date" },
      { key: "nextReview", label: "Next Review Date", type: "date" },
    ],
  },

  whyItMatters: {
    id: "whyItMatters",
    num: 2,
    title: "Why It Matters",
    subtitle: "Help whoever's reading this understand why this process exists.",
    basic: true,
    aiPrompt:
      "Extract: what problem this process solves, the desired outcome, and what goes wrong if skipped.",
    fields: [
      {
        key: "problemSolved",
        label: "Why does this process exist? Was there something that happened that made you create it?",
        type: "textarea",
        placeholder:
          "e.g., We kept dropping the ball on client handoffs when someone was out sick — so we documented it.",
      },
      {
        key: "desiredOutcome",
        label: "When this goes well, what does that look like?",
        type: "textarea",
        placeholder: "What's the ideal outcome when everything goes smoothly?",
      },
      {
        key: "riskOfSkipping",
        label: "What happens if someone skips this?",
        type: "textarea",
        placeholder:
          "The real impact — on clients, the team, or the business — of not following this...",
      },
    ],
  },

  triggers: {
    id: "triggers",
    num: 3,
    title: "When & How It Runs",
    subtitle: "What starts this process, and how do you know when it's done?",
    basic: true,
    aiPrompt:
      "Extract: what triggers this process, what marks completion, prerequisites, and downstream dependencies.",
    fields: [
      {
        key: "trigger",
        label: "What usually starts this process?",
        type: "textarea",
        placeholder:
          "e.g., A new client signs their contract, an order comes in, the first of the month arrives...",
      },
      {
        key: "completion",
        label: "How do you know it's properly finished?",
        type: "textarea",
        placeholder: "The clear signal that this process is fully wrapped up",
      },
      {
        key: "prerequisites",
        label: "Is there anything that needs to be sorted out before you can start?",
        type: "textarea",
        placeholder:
          "Anything that has to be in place before this process can begin...",
      },
      {
        key: "downstream",
        label: "What else in the business relies on this being done?",
        type: "textarea",
        placeholder:
          "Other processes or people that depend on this being finished correctly...",
      },
    ],
  },

  bigPicture: {
    id: "bigPicture",
    num: 4,
    title: "The Overview",
    subtitle: "Just the big chunks — we'll get into the detail in the next section.",
    basic: true,
    aiPrompt:
      "Extract: the 5-7 major phases of this process as a high-level numbered flow.",
    fields: [
      {
        key: "flowSteps",
        label: "Walk me through the main steps — just the big chunks, not the detail yet",
        type: "steplist",
        placeholder: "Describe this phase in a sentence...",
        maxSteps: 7,
      },
    ],
  },

  detailedSteps: {
    id: "detailedSteps",
    num: 5,
    title: "Step by Step",
    subtitle: "Now walk me through the whole thing, step by step.",
    basic: true,
    aiPrompt:
      "Extract: every step with what happens, tools/systems used, and time estimates.",
    fields: [
      {
        key: "steps",
        label: "Let's go through each step — what exactly happens, what tools are involved, and roughly how long it takes",
        type: "detailedsteps",
      },
    ],
  },

  decisions: {
    id: "decisions",
    num: 6,
    title: "Decisions",
    subtitle: "Where the judgment calls live — so nobody's left guessing.",
    basic: false,
    aiPrompt:
      "Extract: decisions that can be made independently, those needing approval, what to do if info is missing, and escalation contacts.",
    fields: [
      {
        key: "independentDecisions",
        label: "What decisions can the person doing this handle on their own?",
        type: "textarea",
        placeholder: "Things they can sort out without checking in with anyone...",
      },
      {
        key: "approvalRequired",
        label: "What needs to come to the person in charge of this first?",
        type: "textarea",
        placeholder: "Decisions that need a sign-off before moving forward...",
      },
      {
        key: "missingInfo",
        label: "What should they do if they're stuck or something's missing?",
        type: "textarea",
        placeholder: "What's the move when they hit a wall or something doesn't add up?",
      },
      {
        key: "escalationContact",
        label: "Who do they come to if something goes wrong?",
        type: "text",
        placeholder: "The person to reach out to when things go sideways",
      },
    ],
  },

  doneRight: {
    id: "doneRight",
    num: 7,
    title: "Getting It Right",
    subtitle: "How you know it's actually finished — not just technically done.",
    basic: false,
    aiPrompt:
      "Extract: definition of done, quality checklist items, and common mistakes to avoid.",
    fields: [
      {
        key: "completionCriteria",
        label: "How do you know this was done properly, not just done?",
        type: "textarea",
        placeholder: "Be specific — what does truly done look like?",
      },
      {
        key: "qualityChecklist",
        label: "Are there certain checkpoints you'd want someone to hit?",
        type: "bulletlist",
        placeholder: "e.g., Confirmation email sent, file saved to the right folder, client notified...",
      },
      {
        key: "commonMistakes",
        label: "If this goes wrong, what are usually the reasons?",
        type: "bulletlist",
        placeholder: "The things that tend to trip people up...",
      },
    ],
  },

  aiAutomation: {
    id: "aiAutomation",
    num: 8,
    title: "Tools & Automation",
    subtitle: "Where technology supports this process — and where it shouldn't.",
    basic: false,
    aiPrompt:
      "Extract: where AI or automation could support this, guardrails, human review points, and connected tools.",
    fields: [
      {
        key: "aiUsage",
        label: "Where does AI or automation already help with this, if at all?",
        type: "textarea",
        placeholder:
          "e.g., AI drafts the initial copy, Zapier sends the notification...",
      },
      {
        key: "aiGuardrails",
        label: "What should never be left to a tool — and where do you need a real person involved?",
        type: "textarea",
        placeholder: "The parts that need a human eye, judgment, or sign-off...",
      },
      {
        key: "connectedTools",
        label: "What tools or automations are connected to this?",
        type: "text",
        placeholder:
          "e.g., Zapier, ChatGPT, Slack, Airtable, ClickUp...",
      },
    ],
  },

  evolution: {
    id: "evolution",
    num: 9,
    title: "Keeping It Current",
    subtitle: "How this SOP stays alive and useful over time.",
    basic: false,
    aiPrompt:
      "Extract: metrics to monitor, who reviews, how feedback is logged, and revision triggers.",
    fields: [
      {
        key: "metrics",
        label: "How do you know this process is still working well?",
        type: "textarea",
        placeholder:
          "What would you notice if something was off?",
      },
      {
        key: "reviewer",
        label: "Who keeps an eye on it?",
        type: "text",
        placeholder: "The person responsible for reviewing this over time",
      },
      {
        key: "feedbackProcess",
        label: "How do people flag if something's off?",
        type: "text",
        placeholder:
          "e.g., Slack channel, Airtable form, shared doc, just tell me directly...",
      },
      {
        key: "revisionTriggers",
        label: "What would make you want to update this?",
        type: "textarea",
        placeholder:
          "e.g., a tool change, someone new joins the team, something keeps going wrong...",
      },
      {
        key: "reviewFrequency",
        label: "How often do you want to review this and make sure it's still up to date?",
        type: "select",
        options: ["Monthly", "Quarterly", "Every 6 months", "Annually", "Only when something changes"],
      },
    ],
  },
};

/**
 * Section display order
 */
export const SECTION_ORDER = [
  "overview",
  "whyItMatters",
  "triggers",
  "bigPicture",
  "detailedSteps",
  "decisions",
  "doneRight",
  "aiAutomation",
  "evolution",
];

export const getBasicSections = () =>
  SECTION_ORDER.filter((key) => SECTIONS[key].basic);

export const getDetailedSections = () => SECTION_ORDER;

export const getSectionsForType = (sopType) =>
  sopType === "detailed" ? SECTION_ORDER : getBasicSections();
