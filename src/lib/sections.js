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
    subtitle: "The quick snapshot — what's it called and who owns it?",
    basic: true,
    aiPrompt:
      "Extract: SOP title, category (Operations/Client Experience/Marketing/Finance/Team), who owns this process, who executes it, and frequency.",
    fields: [
      {
        key: "sopTitle",
        label: "What's this SOP called?",
        type: "text",
        placeholder: "e.g., Client Onboarding Process",
      },
      {
        key: "category",
        label: "What category does it fall under?",
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
        label: "Who's accountable for this? (even if they don't do the work)",
        type: "text",
        placeholder: "e.g., Jess, Operations Manager",
      },
      {
        key: "executor",
        label: "Who actually does this process?",
        type: "text",
        placeholder: "e.g., VA, Team Lead, You",
      },
      {
        key: "frequency",
        label: "How often does this happen?",
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
    subtitle: "What problem does this solve — and what breaks if you skip it?",
    basic: true,
    aiPrompt:
      "Extract: what problem this process solves, the desired outcome, and what goes wrong if skipped.",
    fields: [
      {
        key: "problemSolved",
        label: "What problem does this solve?",
        type: "textarea",
        placeholder:
          "What was falling through the cracks before this process existed?",
      },
      {
        key: "desiredOutcome",
        label: "What does a great result look like?",
        type: "textarea",
        placeholder: "When this goes perfectly, what happens?",
      },
      {
        key: "riskOfSkipping",
        label: "What breaks if you skip this?",
        type: "textarea",
        placeholder:
          "The real cost — time, money, client trust — of not following this...",
      },
    ],
  },

  triggers: {
    id: "triggers",
    num: 3,
    title: "Triggers & Boundaries",
    subtitle: "What kicks this off — and how do you know you're done?",
    basic: true,
    aiPrompt:
      "Extract: what triggers this process, what marks completion, prerequisites, and downstream dependencies.",
    fields: [
      {
        key: "trigger",
        label: "What kicks this process off?",
        type: "textarea",
        placeholder:
          "e.g., A new client signs their contract, an order comes in...",
      },
      {
        key: "completion",
        label: "How do you know it's done?",
        type: "textarea",
        placeholder: "The clear signal that this process is fully wrapped up",
      },
      {
        key: "prerequisites",
        label: "What needs to be in place first?",
        type: "textarea",
        placeholder:
          "Anything that has to happen before you can start...",
      },
      {
        key: "downstream",
        label: "What depends on this being done?",
        type: "textarea",
        placeholder:
          "Other processes that rely on this being finished correctly...",
      },
    ],
  },

  bigPicture: {
    id: "bigPicture",
    num: 4,
    title: "The Big Picture",
    subtitle: "The 30-second overview — major phases only",
    basic: true,
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
    title: "Step-by-Step",
    subtitle: "The full how-to — detailed enough that anyone could follow it",
    basic: true,
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
    subtitle: "Where the judgment calls live — so nobody's guessing",
    basic: false,
    aiPrompt:
      "Extract: decisions that can be made independently, those needing approval, what to do if info is missing, and escalation contacts.",
    fields: [
      {
        key: "independentDecisions",
        label: "What can they decide on their own?",
        type: "textarea",
        placeholder: "Things the executor can handle without checking in...",
      },
      {
        key: "approvalRequired",
        label: "What needs a sign-off?",
        type: "textarea",
        placeholder: "Decisions that require your approval or someone else's...",
      },
      {
        key: "missingInfo",
        label: "If something's missing or unclear...",
        type: "textarea",
        placeholder: "What should they do when they hit a wall?",
      },
      {
        key: "escalationContact",
        label: "Who do they come to?",
        type: "text",
        placeholder: "The person to contact when something goes sideways",
      },
    ],
  },

  doneRight: {
    id: "doneRight",
    num: 7,
    title: "Done Right Checklist",
    subtitle: "How you know it's actually finished — not just technically done",
    basic: false,
    aiPrompt:
      "Extract: definition of done, quality checklist items, and common mistakes to avoid.",
    fields: [
      {
        key: "completionCriteria",
        label: "This SOP is complete when...",
        type: "textarea",
        placeholder: "Be specific — what does truly done look like?",
      },
      {
        key: "qualityChecklist",
        label: "Quality checkpoints",
        type: "bulletlist",
        placeholder: "Add a checkpoint...",
      },
      {
        key: "commonMistakes",
        label: "Common mistakes to watch for",
        type: "bulletlist",
        placeholder: "Add something that tends to go wrong...",
      },
    ],
  },

  aiAutomation: {
    id: "aiAutomation",
    num: 8,
    title: "AI & Automation",
    subtitle: "Where technology can support or speed up this process",
    basic: false,
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
    subtitle: "Keeping this SOP alive and improving over time",
    basic: false,
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

export const getBasicSections = () =>
  SECTION_ORDER.filter((key) => SECTIONS[key].basic);

export const getDetailedSections = () => SECTION_ORDER;

export const getSectionsForType = (sopType) =>
  sopType === "detailed" ? SECTION_ORDER : getBasicSections();
