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
    title: "Overview & Ownership",
    subtitle: "The quick snapshot",
    free: true,
    aiPrompt:
      "Extract: SOP title, category (Operations/Client Experience/Marketing/Finance/Team), who owns this process, who executes it, and frequency.",
    fields: [
      {
        key: "sopTitle",
        label: "SOP Title",
        type: "text",
        placeholder: "e.g., Client Onboarding Process",
      },
      {
        key: "category",
        label: "Category",
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
        label: "Owner (Accountable)",
        type: "text",
        placeholder: "Role or name of the person accountable",
      },
      {
        key: "executor",
        label: "Executor (Does the Work)",
        type: "text",
        placeholder: "Who performs this process?",
      },
      {
        key: "frequency",
        label: "Frequency",
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
        label: "Status",
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
    title: "Why This Matters",
    subtitle: "The business case for this process",
    free: true,
    aiPrompt:
      "Extract: what problem this process solves, the desired outcome, and what goes wrong if skipped.",
    fields: [
      {
        key: "problemSolved",
        label: "What problem does this solve?",
        type: "textarea",
        placeholder:
          "Describe the pain point or gap this SOP addresses...",
      },
      {
        key: "desiredOutcome",
        label: "Desired outcome when done well",
        type: "textarea",
        placeholder: "What does a great result look like?",
      },
      {
        key: "riskOfSkipping",
        label: "What breaks if we skip this?",
        type: "textarea",
        placeholder:
          "The cost, risk, or consequence of not following this process...",
      },
    ],
  },

  triggers: {
    id: "triggers",
    num: 3,
    title: "Triggers & Boundaries",
    subtitle: "When it starts, when it ends",
    free: true,
    aiPrompt:
      "Extract: what triggers this process, what marks completion, prerequisites, and downstream dependencies.",
    fields: [
      {
        key: "trigger",
        label: "What triggers this SOP?",
        type: "textarea",
        placeholder:
          "e.g., New client signs contract, order is placed...",
      },
      {
        key: "completion",
        label: "What signals completion?",
        type: "textarea",
        placeholder: "How do you know this process is done?",
      },
      {
        key: "prerequisites",
        label: "What needs to happen first?",
        type: "textarea",
        placeholder:
          "Dependencies or prerequisites before starting...",
      },
      {
        key: "downstream",
        label: "What depends on this being done?",
        type: "textarea",
        placeholder:
          "Other processes that rely on this being completed correctly...",
      },
    ],
  },

  bigPicture: {
    id: "bigPicture",
    num: 4,
    title: "The Big Picture",
    subtitle: "The 30-second overview",
    free: true,
    aiPrompt:
      "Extract: the 5-7 major phases of this process as a high-level numbered flow.",
    fields: [
      {
        key: "flowSteps",
        label: "High-level flow (5–7 major phases)",
        type: "steplist",
        placeholder: "Describe this phase...",
        maxSteps: 7,
      },
    ],
  },

  detailedSteps: {
    id: "detailedSteps",
    num: 5,
    title: "Detailed Steps",
    subtitle: "The full how-to",
    free: true,
    aiPrompt:
      "Extract: every step with what happens, tools/systems used, and time estimates.",
    fields: [
      {
        key: "steps",
        label: "Step-by-step execution",
        type: "detailedsteps",
      },
    ],
  },

  decisions: {
    id: "decisions",
    num: 6,
    title: "Decisions & Escalation",
    subtitle: "Where judgment calls live",
    free: false,
    aiPrompt:
      "Extract: decisions that can be made independently, those needing approval, what to do if info is missing, and escalation contacts.",
    fields: [
      {
        key: "independentDecisions",
        label: "Decisions that can be made independently",
        type: "textarea",
        placeholder: "What can the executor decide on their own?",
      },
      {
        key: "approvalRequired",
        label: "Decisions that need approval",
        type: "textarea",
        placeholder: "What needs sign-off, and from whom?",
      },
      {
        key: "missingInfo",
        label: "If information is missing...",
        type: "textarea",
        placeholder: "What should the executor do?",
      },
      {
        key: "escalationContact",
        label: "Escalation contact",
        type: "text",
        placeholder: "Who to contact if something goes wrong",
      },
    ],
  },

  doneRight: {
    id: "doneRight",
    num: 7,
    title: "Done Right Checklist",
    subtitle: "How you know it's complete",
    free: false,
    aiPrompt:
      "Extract: definition of done, quality checklist items, and common mistakes to avoid.",
    fields: [
      {
        key: "completionCriteria",
        label: "Definition of done",
        type: "textarea",
        placeholder: "This SOP is complete when...",
      },
      {
        key: "qualityChecklist",
        label: "Quality checklist",
        type: "bulletlist",
        placeholder: "Add a quality checkpoint...",
      },
      {
        key: "commonMistakes",
        label: "Common mistakes to avoid",
        type: "bulletlist",
        placeholder: "Add a common pitfall...",
      },
    ],
  },

  aiAutomation: {
    id: "aiAutomation",
    num: 8,
    title: "AI & Automation",
    subtitle: "Where technology supports the process",
    free: false,
    aiPrompt:
      "Extract: where AI or automation could support this, guardrails, human review points, and connected tools.",
    fields: [
      {
        key: "aiUsage",
        label: "Where AI or automation supports this process",
        type: "textarea",
        placeholder:
          "e.g., AI drafts initial copy, Zapier sends notifications...",
      },
      {
        key: "aiGuardrails",
        label: "What AI should never handle here",
        type: "textarea",
        placeholder: "Critical boundaries for automated tools...",
      },
      {
        key: "humanReview",
        label: "Where human review is required",
        type: "textarea",
        placeholder: "Checkpoints that need a real person...",
      },
      {
        key: "connectedTools",
        label: "Connected tools & automations",
        type: "text",
        placeholder:
          "e.g., Zapier, ChatGPT, Slack bot, Airtable automation...",
      },
    ],
  },

  evolution: {
    id: "evolution",
    num: 9,
    title: "Tracking & Evolution",
    subtitle: "Keeping it alive",
    free: false,
    aiPrompt:
      "Extract: metrics to monitor, who reviews, how feedback is logged, and revision triggers.",
    fields: [
      {
        key: "metrics",
        label: "Metrics or signals to monitor",
        type: "textarea",
        placeholder:
          "How do you know this process is working well?",
      },
      {
        key: "reviewer",
        label: "Who reviews performance?",
        type: "text",
        placeholder: "Role responsible for reviewing this SOP",
      },
      {
        key: "feedbackProcess",
        label: "How issues or feedback get logged",
        type: "text",
        placeholder:
          "e.g., Slack channel, Airtable form, shared doc...",
      },
      {
        key: "revisionTriggers",
        label: "What would trigger a revision?",
        type: "textarea",
        placeholder:
          "e.g., tool change, team change, recurring problems...",
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

/**
 * Get only free sections
 */
export const getFreeSections = () =>
  SECTION_ORDER.filter((key) => SECTIONS[key].free);

/**
 * Get only pro sections
 */
export const getProSections = () =>
  SECTION_ORDER.filter((key) => !SECTIONS[key].free);
