import { useState, useRef, useCallback, useEffect } from "react";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const SECTIONS = {
  overview: {
    id: "overview",
    num: 1,
    title: "Overview & Ownership",
    subtitle: "The quick snapshot — who owns this and what's it called?",
    free: true,
    aiPrompt: "Extract: SOP title, category, who owns this process, who executes it, and how often it runs.",
    fields: [
      { key: "sopTitle", label: "What's this SOP called?", type: "text", placeholder: "e.g., Client Onboarding Process" },
      { key: "category", label: "Category", type: "select", allowCustom: true, options: ["Operations", "Client Experience", "Marketing", "Finance", "Team"] },
      { key: "owner", label: "Who's accountable for this?", type: "text", placeholder: "The person responsible — even if they don't do the work" },
      { key: "executor", label: "Who actually does it?", type: "text", placeholder: "The person who runs through this process" },
      { key: "frequency", label: "How often does this happen?", type: "select", options: ["One-time", "Daily", "Weekly", "Bi-weekly", "Monthly", "Quarterly", "Annually", "Triggered by event"] },
      { key: "status", label: "Status", type: "select", options: ["Draft", "Active", "Needs Review", "Archived"] },
      { key: "versionDate", label: "Version Date", type: "date" },
      { key: "nextReview", label: "Next Review Date", type: "date" },
    ],
  },
  whyItMatters: {
    id: "whyItMatters",
    num: 2,
    title: "Why This Matters",
    subtitle: "What problem does this solve — and what breaks if you skip it?",
    free: true,
    aiPrompt: "Extract: what problem this process solves, the desired outcome, and what goes wrong if skipped.",
    fields: [
      { key: "problemSolved", label: "What problem does this solve?", type: "textarea", placeholder: "What was falling through the cracks before this process existed?" },
      { key: "desiredOutcome", label: "What does a great result look like?", type: "textarea", placeholder: "When this goes perfectly, what happens?" },
      { key: "riskOfSkipping", label: "What breaks if you skip this?", type: "textarea", placeholder: "The real cost — time, money, client trust — of not following this..." },
    ],
  },
  triggers: {
    id: "triggers",
    num: 3,
    title: "When It Starts & Ends",
    subtitle: "What kicks this off — and how do you know you're done?",
    free: true,
    aiPrompt: "Extract: what triggers this process, what marks completion, prerequisites, and downstream dependencies.",
    fields: [
      { key: "trigger", label: "What kicks this process off?", type: "textarea", placeholder: "e.g., A new client signs their contract, an order comes in..." },
      { key: "completion", label: "How do you know it's done?", type: "textarea", placeholder: "The clear signal that this process is fully wrapped up" },
      { key: "prerequisites", label: "What needs to be in place first?", type: "textarea", placeholder: "Anything that has to happen before you can start..." },
      { key: "downstream", label: "What depends on this being done?", type: "textarea", placeholder: "Other processes that rely on this being finished correctly..." },
    ],
  },
  bigPicture: {
    id: "bigPicture",
    num: 4,
    title: "The Big Picture",
    subtitle: "The 30-second overview — major phases only",
    free: true,
    aiPrompt: "Extract: the 5-7 major phases of this process as a high-level numbered flow.",
    fields: [
      { key: "flowSteps", label: "Walk me through the main phases (5–7 steps)", type: "steplist", placeholder: "Describe this phase in plain language...", maxSteps: 7 },
    ],
  },
  detailedSteps: {
    id: "detailedSteps",
    num: 5,
    title: "Step-by-Step",
    subtitle: "The full how-to — detailed enough that anyone could follow it",
    free: true,
    aiPrompt: "Extract: every step with what happens, tools/systems used, and time estimates.",
    fields: [
      { key: "steps", label: "Every step, in order", type: "detailedsteps" },
    ],
  },
  decisions: {
    id: "decisions",
    num: 6,
    title: "Decisions & Escalation",
    subtitle: "Where the judgment calls live — so nobody's guessing",
    free: false,
    aiPrompt: "Extract: decisions that can be made independently, those needing approval, what to do if info is missing, and escalation contacts.",
    fields: [
      { key: "independentDecisions", label: "What can they decide on their own?", type: "textarea", placeholder: "Things the executor can handle without checking in..." },
      { key: "approvalRequired", label: "What needs a sign-off?", type: "textarea", placeholder: "Decisions that require your approval or someone else's..." },
      { key: "missingInfo", label: "If something's missing or unclear...", type: "textarea", placeholder: "What should they do when they hit a wall?" },
      { key: "escalationContact", label: "Who do they come to?", type: "text", placeholder: "The person to contact when something goes sideways" },
    ],
  },
  doneRight: {
    id: "doneRight",
    num: 7,
    title: "Done Right Checklist",
    subtitle: "How you know it's actually finished — not just technically done",
    free: false,
    aiPrompt: "Extract: definition of done, quality checklist items, and common mistakes to avoid.",
    fields: [
      { key: "completionCriteria", label: "This SOP is complete when...", type: "textarea", placeholder: "Be specific — what does truly done look like?" },
      { key: "qualityChecklist", label: "Quality checkpoints", type: "bulletlist", placeholder: "Add a checkpoint..." },
      { key: "commonMistakes", label: "Common mistakes to watch for", type: "bulletlist", placeholder: "Add something that tends to go wrong..." },
    ],
  },
  aiAutomation: {
    id: "aiAutomation",
    num: 8,
    title: "AI & Automation",
    subtitle: "Where tech helps — and where humans need to stay in the loop",
    free: false,
    aiPrompt: "Extract: where AI or automation could support this, guardrails, human review points, and connected tools.",
    fields: [
      { key: "aiUsage", label: "Where does tech support this process?", type: "textarea", placeholder: "e.g., AI drafts copy, Zapier sends a notification, Calendly handles scheduling..." },
      { key: "aiGuardrails", label: "What should automation never touch here?", type: "textarea", placeholder: "The things that need a human, full stop..." },
      { key: "humanReview", label: "Where does a person need to check the work?", type: "textarea", placeholder: "Approval points, quality checks, client-facing moments..." },
      { key: "connectedTools", label: "Tools & automations connected to this", type: "text", placeholder: "e.g., Zapier, ChatGPT, Slack, Airtable, HoneyBook..." },
    ],
  },
  evolution: {
    id: "evolution",
    num: 9,
    title: "Keeping It Alive",
    subtitle: "How this SOP grows and improves over time",
    free: false,
    aiPrompt: "Extract: metrics to monitor, who reviews, how feedback is logged, and revision triggers.",
    fields: [
      { key: "metrics", label: "How do you know this process is working?", type: "textarea", placeholder: "What signals would tell you it's running smoothly — or not?" },
      { key: "reviewer", label: "Who checks in on this?", type: "text", placeholder: "The person responsible for keeping this SOP updated" },
      { key: "feedbackProcess", label: "How does feedback get captured?", type: "text", placeholder: "e.g., Slack channel, shared doc, Airtable form..." },
      { key: "revisionTriggers", label: "What would trigger an update to this?", type: "textarea", placeholder: "e.g., tool changes, team changes, recurring problems..." },
    ],
  },
};

const SECTION_ORDER = ["overview", "whyItMatters", "triggers", "bigPicture", "detailedSteps", "decisions", "doneRight", "aiAutomation", "evolution"];

let _id = 0;
const uid = () => `uid-${++_id}`;

const DEFAULT_BRAND = {
  logo: null,
  logoName: "",
  primaryColor: "#803D1B",
  accentColor: "#2F3420",
  businessName: "",
};

/* ═══════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════ */
const C = {
  bg: "#EBE6E3",
  primary: "#803D1B",
  dark: "#2F3420",
  mid: "#99998F",
  sage: "#B2B9AC",
  card: "#FFFFFF",
  inputBg: "#F8F5F2",
  border: "#D9D3CC",
  text: "#2A2A2A",
  textLight: "#7A7468",
};

/* ═══════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════ */
const S = {
  app: {
    minHeight: "100vh",
    background: C.bg,
    fontFamily: "'DM Sans', sans-serif",
    color: C.text,
  },
  header: {
    background: C.dark,
    padding: "28px 24px 22px",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
  },
  headerDots: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: "radial-gradient(circle, rgba(235,230,227,0.08) 1px, transparent 1px)",
    backgroundSize: "20px 20px",
    pointerEvents: "none",
  },
  headerEyebrow: {
    fontSize: "10px", fontWeight: 700, letterSpacing: "2.5px", textTransform: "uppercase",
    color: C.sage, marginBottom: "6px", position: "relative", zIndex: 1,
  },
  headerTitle: {
    fontSize: "24px", fontWeight: 700, color: "#FFF", margin: 0,
    fontFamily: "'Playfair Display', serif", position: "relative", zIndex: 1, letterSpacing: "-0.3px",
  },
  headerAccent: { color: "#CEB597" },
  headerSub: {
    fontSize: "13px", color: "rgba(255,255,255,0.55)", marginTop: "6px",
    position: "relative", zIndex: 1, fontWeight: 400,
  },
  navBar: {
    display: "flex", gap: "2px", padding: "10px 16px", background: "#FFF",
    borderBottom: `1px solid ${C.border}`, overflowX: "auto", position: "sticky", top: 0, zIndex: 100,
  },
  navItem: (active, locked) => ({
    padding: "7px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: active ? 600 : 500,
    background: active ? C.primary : "transparent",
    color: active ? "#FFF" : locked ? C.sage : C.textLight,
    cursor: locked ? "default" : "pointer", whiteSpace: "nowrap", transition: "all 0.2s",
    border: "none", opacity: locked ? 0.6 : 1, display: "flex", alignItems: "center", gap: "3px",
  }),
  main: { maxWidth: "720px", margin: "0 auto", padding: "20px 16px 120px" },
  card: {
    background: C.card, borderRadius: "16px", padding: "24px 22px", marginBottom: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)", border: `1px solid ${C.border}`,
  },
  lockedCard: {
    background: "#FAFAF8", borderRadius: "16px", padding: "28px 24px", marginBottom: "16px",
    border: `1px dashed ${C.border}`,
  },
  secNum: (c) => ({
    fontSize: "10px", fontWeight: 700, color: c || C.primary, textTransform: "uppercase",
    letterSpacing: "1.5px", marginBottom: "3px",
  }),
  secTitle: {
    fontSize: "20px", fontWeight: 700, color: C.dark, margin: "0 0 2px",
    fontFamily: "'Playfair Display', serif", letterSpacing: "-0.2px",
  },
  secSub: { fontSize: "12px", color: C.textLight, margin: "0 0 20px" },
  fieldGroup: { marginBottom: "16px" },
  label: { display: "block", fontSize: "12px", fontWeight: 600, color: "#3D3D3D", marginBottom: "5px" },
  input: {
    width: "100%", padding: "9px 12px", borderRadius: "10px", border: `1.5px solid ${C.border}`,
    fontSize: "13px", fontFamily: "'DM Sans', sans-serif", color: C.text, background: C.inputBg,
    outline: "none", transition: "border-color 0.2s", boxSizing: "border-box",
  },
  textarea: {
    width: "100%", padding: "9px 12px", borderRadius: "10px", border: `1.5px solid ${C.border}`,
    fontSize: "13px", fontFamily: "'DM Sans', sans-serif", color: C.text, background: C.inputBg,
    outline: "none", minHeight: "72px", resize: "vertical", transition: "border-color 0.2s", boxSizing: "border-box",
  },
  select: {
    width: "100%", padding: "9px 12px", borderRadius: "10px", border: `1.5px solid ${C.border}`,
    fontSize: "13px", fontFamily: "'DM Sans', sans-serif", color: C.text, background: C.inputBg,
    outline: "none", boxSizing: "border-box", appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2399998F' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
  },
  addBtn: {
    display: "inline-flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "8px",
    border: `1.5px dashed ${C.border}`, background: "transparent", color: C.textLight, fontSize: "12px",
    fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  },
  removeBtn: {
    padding: "3px 7px", borderRadius: "6px", border: "none", background: "rgba(200,80,80,0.08)",
    color: "#C85050", fontSize: "11px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  },
  stepNum: {
    minWidth: "26px", height: "26px", borderRadius: "50%", background: C.primary, color: "#FFF",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700,
    marginTop: "7px", flexShrink: 0,
  },
  tabRow: { display: "flex", gap: "4px", marginBottom: "20px" },
  tab: (active) => ({
    padding: "9px 18px", borderRadius: "10px 10px 0 0", border: "none", fontSize: "12px",
    fontWeight: active ? 600 : 500,
    background: active ? C.dark : "#E0DAD4",
    color: active ? "#FFF" : C.textLight,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  }),
  exportBar: {
    position: "fixed", bottom: 0, left: 0, right: 0, background: "#FFF",
    borderTop: `1px solid ${C.border}`, padding: "12px 20px",
    display: "flex", justifyContent: "center", gap: "10px", zIndex: 200,
    boxShadow: "0 -2px 12px rgba(0,0,0,0.04)",
  },
  exportBtn: (primary) => ({
    padding: "10px 22px", borderRadius: "10px",
    border: primary ? "none" : `1.5px solid ${C.dark}`,
    background: primary ? C.primary : "transparent",
    color: primary ? "#FFF" : C.dark, fontSize: "13px", fontWeight: 600,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: "6px",
  }),
  badge: {
    display: "inline-block", padding: "2px 7px", borderRadius: "6px",
    fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px",
  },
  freeBadge: { background: "#E6F4EA", color: "#1E7F3F" },
  proBadge: { background: C.primary, color: "#FFF" },
  tierToggle: {
    display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px",
    background: "#FFF", borderRadius: "12px", border: `1px solid ${C.border}`, marginBottom: "16px",
  },
  tierLabel: (a) => ({ fontSize: "12px", fontWeight: a ? 700 : 500, color: a ? C.dark : C.mid, cursor: "pointer" }),
  toggleTrack: (on) => ({
    width: "40px", height: "22px", borderRadius: "11px", background: on ? C.primary : C.border,
    position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0,
  }),
  toggleThumb: (on) => ({
    width: "16px", height: "16px", borderRadius: "50%", background: "#FFF",
    position: "absolute", top: "3px", left: on ? "21px" : "3px",
    transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
  }),
  colorPicker: { display: "flex", alignItems: "center", gap: "8px" },
  colorSwatch: (c) => ({
    width: "32px", height: "32px", borderRadius: "8px", border: `2px solid ${C.border}`,
    cursor: "pointer", background: c, flexShrink: 0,
  }),
  logoPreview: { maxHeight: "50px", maxWidth: "180px", objectFit: "contain" },
  uploadArea: {
    border: `2px dashed ${C.border}`, borderRadius: "12px", padding: "16px",
    textAlign: "center", cursor: "pointer", background: C.inputBg,
  },
  videoCard: {
    background: "#FFF", borderRadius: "16px", padding: "24px 22px", marginBottom: "16px",
    border: `1.5px solid ${C.border}`, position: "relative", overflow: "hidden",
  },
  videoCardPattern: {
    position: "absolute", top: 0, right: 0, width: "160px", height: "160px",
    backgroundImage: "radial-gradient(circle, rgba(128,61,27,0.06) 1px, transparent 1px)",
    backgroundSize: "12px 12px",
    pointerEvents: "none",
  },
  videoInputRow: { display: "flex", gap: "10px", alignItems: "stretch" },
  videoInput: {
    flex: 1, padding: "11px 14px", borderRadius: "10px", border: `1.5px solid ${C.border}`,
    fontSize: "13px", fontFamily: "'DM Sans', sans-serif", color: C.text, background: "#FFF",
    outline: "none", boxSizing: "border-box",
  },
  videoBtn: (variant) => ({
    padding: "10px 18px", borderRadius: "10px", border: "none",
    background: variant === "primary" ? C.primary : "#E8E2DC",
    color: variant === "primary" ? "#FFF" : C.textLight,
    fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
    whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "6px",
  }),
  uploadVideoBtn: {
    padding: "10px 18px", borderRadius: "10px", border: `1.5px dashed ${C.border}`,
    background: "transparent", color: C.textLight, fontSize: "13px", fontWeight: 500,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap",
    display: "flex", alignItems: "center", gap: "6px",
  },
  orDivider: { fontSize: "11px", color: C.sage, fontWeight: 600, display: "flex", alignItems: "center" },
  aiReviewCard: {
    background: "#FFF", borderRadius: "16px", padding: "22px 20px", marginBottom: "14px",
    border: `1.5px solid ${C.border}`, position: "relative",
  },
  aiReviewHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px",
  },
  aiStatusDot: (status) => ({
    width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0, marginTop: "6px",
    background: status === "confirmed" ? "#34A853" : status === "editing" ? C.primary : status === "pending" ? C.border : "#4A90D9",
  }),
  aiFieldPreview: {
    background: C.inputBg, borderRadius: "10px", padding: "12px 14px", marginBottom: "8px",
    border: `1px solid ${C.border}`, fontSize: "13px", lineHeight: 1.6, color: "#3D3D3D",
  },
  confirmBtn: {
    padding: "8px 18px", borderRadius: "8px", border: "none",
    background: "#34A853", color: "#FFF", fontSize: "12px", fontWeight: 600,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  },
  editBtn: {
    padding: "8px 18px", borderRadius: "8px", border: `1.5px solid ${C.primary}`,
    background: "transparent", color: C.primary, fontSize: "12px", fontWeight: 600,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  },
  progressBar: {
    height: "4px", borderRadius: "2px", background: C.border, overflow: "hidden", marginBottom: "16px",
  },
  progressFill: (pct) => ({
    height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${C.primary}, #34A853)`,
    borderRadius: "2px", transition: "width 0.5s ease",
  }),
  processingPulse: {
    display: "inline-block", width: "10px", height: "10px", borderRadius: "50%",
    background: C.primary, animation: "pulse 1.2s ease-in-out infinite",
  },
};

/* ═══════════════════════════════════════════
   FIELD COMPONENTS
   ═══════════════════════════════════════════ */
function TextField({ field, value, onChange }) {
  return (
    <div style={S.fieldGroup}>
      <label style={S.label}>{field.label}</label>
      <input
        type={field.type === "date" ? "date" : "text"}
        style={S.input}
        placeholder={field.placeholder}
        value={value || ""}
        onChange={e => onChange(field.key, e.target.value)}
      />
    </div>
  );
}

function TextareaField({ field, value, onChange }) {
  return (
    <div style={S.fieldGroup}>
      <label style={S.label}>{field.label}</label>
      <textarea
        style={S.textarea}
        placeholder={field.placeholder}
        value={value || ""}
        onChange={e => onChange(field.key, e.target.value)}
      />
    </div>
  );
}

function SelectField({ field, value, onChange }) {
  const presets = field.options || [];
  const isCustom = value && !presets.includes(value);
  const [showCustom, setShowCustom] = useState(isCustom);

  const handleSelect = (e) => {
    if (e.target.value === "__custom__") {
      setShowCustom(true);
      onChange(field.key, "");
    } else {
      setShowCustom(false);
      onChange(field.key, e.target.value);
    }
  };

  return (
    <div style={S.fieldGroup}>
      <label style={S.label}>{field.label}</label>
      <select
        style={S.select}
        value={isCustom ? "__custom__" : value || ""}
        onChange={handleSelect}
      >
        <option value="">Choose one...</option>
        {presets.map(o => <option key={o} value={o}>{o}</option>)}
        {field.allowCustom && <option value="__custom__">Something else...</option>}
      </select>
      {showCustom && field.allowCustom && (
        <input
          style={{ ...S.input, marginTop: "8px" }}
          placeholder="Type your own category name..."
          value={value || ""}
          onChange={e => onChange(field.key, e.target.value)}
          autoFocus
        />
      )}
    </div>
  );
}

function StepListField({ field, value, onChange }) {
  const items = value || [""];
  const max = field.maxSteps || 7;
  const update = (i, v) => { const n = [...items]; n[i] = v; onChange(field.key, n); };
  const add = () => { if (items.length < max) onChange(field.key, [...items, ""]); };
  const remove = (i) => { const n = items.filter((_, idx) => idx !== i); onChange(field.key, n.length ? n : [""]); };
  return (
    <div style={S.fieldGroup}>
      <label style={S.label}>{field.label}</label>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "8px" }}>
          <div style={S.stepNum}>{i + 1}</div>
          <input style={{ ...S.input, flex: 1 }} placeholder={field.placeholder} value={item} onChange={e => update(i, e.target.value)} />
          {items.length > 1 && <button style={S.removeBtn} onClick={() => remove(i)}>✕</button>}
        </div>
      ))}
      {items.length < max && <button style={S.addBtn} onClick={add}>+ Add another phase</button>}
    </div>
  );
}

function DetailedStepsField({ field, value, onChange }) {
  const steps = value || [{ id: uid(), what: "", tools: "", time: "" }];
  const update = (i, k, v) => { const n = [...steps]; n[i] = { ...n[i], [k]: v }; onChange(field.key, n); };
  const add = () => onChange(field.key, [...steps, { id: uid(), what: "", tools: "", time: "" }]);
  const remove = (i) => { const n = steps.filter((_, idx) => idx !== i); onChange(field.key, n.length ? n : [{ id: uid(), what: "", tools: "", time: "" }]); };
  return (
    <div style={S.fieldGroup}>
      <label style={S.label}>{field.label}</label>
      {steps.map((step, i) => (
        <div key={step.id} style={{ background: C.inputBg, borderRadius: "12px", padding: "14px", marginBottom: "10px", border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={S.stepNum}>{i + 1}</div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: C.textLight }}>Step {i + 1}</span>
            </div>
            {steps.length > 1 && <button style={S.removeBtn} onClick={() => remove(i)}>Remove</button>}
          </div>
          <div style={{ marginBottom: "6px" }}>
            <label style={{ ...S.label, fontSize: "11px" }}>What happens</label>
            <textarea style={{ ...S.textarea, minHeight: "54px" }} placeholder="Walk through this step in plain language..." value={step.what} onChange={e => update(i, "what", e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ ...S.label, fontSize: "11px" }}>Tools / systems used</label>
              <input style={S.input} placeholder="e.g., Asana, Google Drive..." value={step.tools} onChange={e => update(i, "tools", e.target.value)} />
            </div>
            <div style={{ flex: 0.4 }}>
              <label style={{ ...S.label, fontSize: "11px" }}>Time estimate</label>
              <input style={S.input} placeholder="e.g., 15 min" value={step.time} onChange={e => update(i, "time", e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <button style={S.addBtn} onClick={add}>+ Add a step</button>
    </div>
  );
}

function BulletListField({ field, value, onChange }) {
  const items = value || [""];
  const update = (i, v) => { const n = [...items]; n[i] = v; onChange(field.key, n); };
  const add = () => onChange(field.key, [...items, ""]);
  const remove = (i) => { const n = items.filter((_, idx) => idx !== i); onChange(field.key, n.length ? n : [""]); };
  return (
    <div style={S.fieldGroup}>
      <label style={S.label}>{field.label}</label>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: "6px", marginBottom: "6px", alignItems: "center" }}>
          <span style={{ color: C.primary, fontWeight: 700, fontSize: "16px", flexShrink: 0 }}>•</span>
          <input style={{ ...S.input, flex: 1 }} placeholder={field.placeholder} value={item} onChange={e => update(i, e.target.value)} />
          {items.length > 1 && <button style={S.removeBtn} onClick={() => remove(i)}>✕</button>}
        </div>
      ))}
      <button style={S.addBtn} onClick={add}>+ Add one more</button>
    </div>
  );
}

function renderField(field, data, onChange) {
  const val = data[field.key];
  switch (field.type) {
    case "text": case "date": return <TextField key={field.key} field={field} value={val} onChange={onChange} />;
    case "textarea": return <TextareaField key={field.key} field={field} value={val} onChange={onChange} />;
    case "select": return <SelectField key={field.key} field={field} value={val} onChange={onChange} />;
    case "steplist": return <StepListField key={field.key} field={field} value={val} onChange={onChange} />;
    case "detailedsteps": return <DetailedStepsField key={field.key} field={field} value={val} onChange={onChange} />;
    case "bulletlist": return <BulletListField key={field.key} field={field} value={val} onChange={onChange} />;
    default: return null;
  }
}

/* ═══════════════════════════════════════════
   WELCOME SCREEN
   ═══════════════════════════════════════════ */
function WelcomeScreen({ onStart, initialBusinessName }) {
  const [businessName, setBusinessName] = useState(initialBusinessName || "");
  const [startMethod, setStartMethod] = useState(null);

  const canContinue = startMethod !== null;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{ background: C.dark, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          backgroundImage: "radial-gradient(circle, rgba(235,230,227,0.07) 1px, transparent 1px)",
          backgroundSize: "18px 18px", pointerEvents: "none",
        }} />
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "20px", color: "#FFF", letterSpacing: "-0.2px", position: "relative", zIndex: 1 }}>
          <span style={{ color: "#CEB597" }}>Shine Bright</span> SOP Generator
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
        <div style={{ maxWidth: "560px", width: "100%" }}>
          {/* Greeting */}
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "50%", background: C.dark,
              margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(47,52,32,0.2)",
            }}>
              <span style={{ fontSize: "24px" }}>✦</span>
            </div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif", fontSize: "32px", color: C.dark,
              margin: "0 0 10px", letterSpacing: "-0.5px",
            }}>
              Let's build your SOP
            </h1>
            <p style={{ fontSize: "15px", color: C.textLight, margin: 0, lineHeight: 1.6 }}>
              No overwhelm, no jargon — just a simple way to document<br />
              how your business actually works.
            </p>
          </div>

          {/* Business name */}
          <div style={{ background: C.card, borderRadius: "16px", padding: "24px", marginBottom: "16px", border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <label style={{ display: "block", fontWeight: 600, fontSize: "14px", color: C.dark, marginBottom: "8px" }}>
              First — what's your business called?
            </label>
            <input
              style={{ ...S.input, fontSize: "15px", padding: "11px 14px" }}
              placeholder="e.g., Shine Bright Virtual"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
            />
            <div style={{ fontSize: "11px", color: C.mid, marginTop: "6px" }}>
              This will show up on your exported SOP — totally optional if you're just exploring.
            </div>
          </div>

          {/* Start method */}
          <div style={{ background: C.card, borderRadius: "16px", padding: "24px", marginBottom: "24px", border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ fontWeight: 600, fontSize: "14px", color: C.dark, marginBottom: "14px" }}>
              How do you want to get started?
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <button
                onClick={() => setStartMethod("video")}
                style={{
                  padding: "16px 18px", borderRadius: "12px", border: `2px solid ${startMethod === "video" ? C.primary : C.border}`,
                  background: startMethod === "video" ? `${C.primary}10` : C.inputBg,
                  cursor: "pointer", textAlign: "left", transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "22px" }}>🎥</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: C.dark, marginBottom: "2px" }}>
                      I have a video walkthrough
                      <span style={{ ...S.badge, ...S.proBadge, marginLeft: "8px" }}>Pro</span>
                    </div>
                    <div style={{ fontSize: "12px", color: C.textLight, lineHeight: 1.4 }}>
                      Got a Loom or screen recording? Drop it in and we'll turn it into a full SOP automatically.
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setStartMethod("manual")}
                style={{
                  padding: "16px 18px", borderRadius: "12px", border: `2px solid ${startMethod === "manual" ? C.dark : C.border}`,
                  background: startMethod === "manual" ? `${C.dark}10` : C.inputBg,
                  cursor: "pointer", textAlign: "left", transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "22px" }}>✏️</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: C.dark, marginBottom: "2px" }}>
                      I'll fill it in myself
                    </div>
                    <div style={{ fontSize: "12px", color: C.textLight, lineHeight: 1.4 }}>
                      We'll guide you through each section one at a time. It's easier than it looks, promise.
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => canContinue && onStart({ businessName, startMethod })}
            disabled={!canContinue}
            style={{
              width: "100%", padding: "14px", borderRadius: "12px", border: "none",
              background: canContinue ? C.primary : C.border,
              color: canContinue ? "#FFF" : C.mid,
              fontSize: "15px", fontWeight: 700, cursor: canContinue ? "pointer" : "default",
              fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
              boxShadow: canContinue ? `0 4px 14px ${C.primary}40` : "none",
            }}
          >
            {canContinue ? "Let's go →" : "Choose an option above to continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   BRAND PANEL
   ═══════════════════════════════════════════ */
function BrandPanel({ brand, setBrand, isPro }) {
  const fileRef = useRef(null);
  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBrand(b => ({ ...b, logo: ev.target.result, logoName: file.name }));
    reader.readAsDataURL(file);
  };
  if (!isPro) return null;
  return (
    <div style={S.card}>
      <div style={S.secNum()}>Brand</div>
      <h3 style={{ ...S.secTitle, fontSize: "18px", marginBottom: "4px" }}>Make it yours</h3>
      <p style={S.secSub}>Your exported SOP will show your branding, not ours.</p>
      <div style={S.fieldGroup}>
        <label style={S.label}>Business Name</label>
        <input style={S.input} placeholder="Your business name" value={brand.businessName} onChange={e => setBrand(b => ({ ...b, businessName: e.target.value }))} />
      </div>
      <div style={S.fieldGroup}>
        <label style={S.label}>Logo</label>
        <input type="file" ref={fileRef} accept="image/*" style={{ display: "none" }} onChange={handleLogo} />
        <div style={S.uploadArea} onClick={() => fileRef.current?.click()}>
          {brand.logo ? (
            <div><img src={brand.logo} alt="Logo" style={S.logoPreview} /><div style={{ fontSize: "11px", color: C.textLight, marginTop: "4px" }}>{brand.logoName}</div></div>
          ) : (
            <div><div style={{ fontSize: "20px", marginBottom: "4px" }}>⬆</div><div style={{ fontSize: "12px", color: C.textLight }}>Upload your logo</div></div>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: "14px" }}>
        <div style={{ ...S.fieldGroup, flex: 1 }}>
          <label style={S.label}>Primary Color</label>
          <div style={S.colorPicker}>
            <input type="color" value={brand.primaryColor} onChange={e => setBrand(b => ({ ...b, primaryColor: e.target.value }))} style={{ ...S.colorSwatch(brand.primaryColor), border: "none", padding: 0, cursor: "pointer" }} />
            <input style={{ ...S.input, flex: 1 }} value={brand.primaryColor} onChange={e => setBrand(b => ({ ...b, primaryColor: e.target.value }))} />
          </div>
        </div>
        <div style={{ ...S.fieldGroup, flex: 1 }}>
          <label style={S.label}>Accent Color</label>
          <div style={S.colorPicker}>
            <input type="color" value={brand.accentColor} onChange={e => setBrand(b => ({ ...b, accentColor: e.target.value }))} style={{ ...S.colorSwatch(brand.accentColor), border: "none", padding: 0, cursor: "pointer" }} />
            <input style={{ ...S.input, flex: 1 }} value={brand.accentColor} onChange={e => setBrand(b => ({ ...b, accentColor: e.target.value }))} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PREVIEW PANEL
   ═══════════════════════════════════════════ */
function PreviewPanel({ data, brand, isPro, previewRef }) {
  const pc = isPro ? brand.primaryColor : C.primary;
  const ac = isPro ? brand.accentColor : C.dark;
  const biz = brand.businessName || "";
  const sectionsToShow = SECTION_ORDER.filter(k => SECTIONS[k].free || isPro);

  return (
    <div
      id="sop-preview"
      ref={previewRef}
      style={{ background: "#FFF", borderRadius: "16px", padding: "32px 28px", border: `1px solid ${C.border}`, boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}
    >
      <div style={{ borderBottom: `3px solid ${pc}`, paddingBottom: "16px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          {biz && <div style={{ fontSize: "10px", fontWeight: 700, color: ac, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "4px" }}>{biz}</div>}
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: pc, margin: "0 0 4px", fontFamily: "'Playfair Display', serif" }}>
            {data.overview?.sopTitle || "Standard Operating Procedure"}
          </h1>
          <div style={{ fontSize: "11px", color: C.textLight }}>
            {data.overview?.category && <span>{data.overview.category}</span>}
            {data.overview?.status && <span> · {data.overview.status}</span>}
            {data.overview?.versionDate && <span> · v{data.overview.versionDate}</span>}
          </div>
        </div>
        {isPro && brand.logo && <img src={brand.logo} alt="" style={{ maxHeight: "44px", maxWidth: "110px", objectFit: "contain" }} />}
      </div>

      {sectionsToShow.map(key => {
        const sec = SECTIONS[key];
        const sData = data[key] || {};
        const hasContent = Object.values(sData).some(v => v && (typeof v === "string" ? v.trim() : Array.isArray(v) ? v.some(item => typeof item === "string" ? item.trim() : item?.what?.trim()) : false));
        if (!hasContent && key !== "overview") return null;
        return (
          <div key={key} style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: pc, margin: "0 0 4px", borderBottom: `1.5px solid ${ac}`, paddingBottom: "5px", display: "inline-block", fontFamily: "'Playfair Display', serif" }}>
              {sec.num}. {sec.title}
            </h2>
            <div style={{ fontSize: "12px", color: "#4A4A4A", lineHeight: 1.6, marginTop: "8px" }}>
              {sec.fields.map(field => {
                const val = sData[field.key];
                if (!val || (typeof val === "string" && !val.trim())) return null;
                if (field.type === "steplist" && Array.isArray(val)) {
                  return (<div key={field.key} style={{ marginBottom: "6px" }}>{val.filter(v => v.trim()).map((v, i) => (<div key={i} style={{ display: "flex", gap: "6px", marginBottom: "3px" }}><span style={{ color: ac, fontWeight: 700, minWidth: "18px" }}>{i + 1}.</span><span>{v}</span></div>))}</div>);
                }
                if (field.type === "detailedsteps" && Array.isArray(val)) {
                  return (<div key={field.key}>{val.filter(s => s.what?.trim()).map((s, i) => (<div key={i} style={{ marginBottom: "10px", paddingLeft: "10px", borderLeft: `2px solid ${ac}` }}><div style={{ fontWeight: 600, color: pc, fontSize: "12px" }}>Step {i + 1}</div><div>{s.what}</div>{s.tools && <div style={{ fontSize: "11px", color: C.textLight }}>Tools: {s.tools}</div>}{s.time && <div style={{ fontSize: "11px", color: C.textLight }}>Time: {s.time}</div>}</div>))}</div>);
                }
                if (field.type === "bulletlist" && Array.isArray(val)) {
                  return (<div key={field.key} style={{ marginBottom: "6px" }}><div style={{ fontSize: "11px", fontWeight: 600, color: C.textLight, marginBottom: "3px" }}>{field.label}</div>{val.filter(v => v.trim()).map((v, i) => (<div key={i} style={{ display: "flex", gap: "5px", marginBottom: "2px" }}><span style={{ color: ac }}>•</span><span>{v}</span></div>))}</div>);
                }
                if (key === "overview") return null;
                return (<div key={field.key} style={{ marginBottom: "6px" }}><span style={{ fontWeight: 600, color: "#5C5C5C" }}>{field.label}: </span><span>{val}</span></div>);
              })}
            </div>
          </div>
        );
      })}

      <div style={{ borderTop: `2px solid ${pc}`, paddingTop: "12px", marginTop: "24px", textAlign: "center" }}>
        <div style={{ fontSize: "10px", color: C.sage }}>
          {biz ? `© ${new Date().getFullYear()} ${biz}` : "Created with Shine Bright SOP Generator"}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   VIDEO IMPORT PANEL
   ═══════════════════════════════════════════ */
function VideoImportPanel({ onTranscriptReady, isPro }) {
  const [loomUrl, setLoomUrl] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const fileRef = useRef(null);

  const simulateProcessing = async (source) => {
    setProcessing(true);
    setStatus("transcribing");
    setProgress(15);
    await new Promise(r => setTimeout(r, 1800));
    setProgress(40);
    setStatus("analyzing");

    try {
      const demoTranscript = source === "loom"
        ? `This is a walkthrough of our client onboarding process. When a new client signs their contract in HoneyBook, I get a notification. I then create their project folder in Google Drive using our template. Next I set up their Asana board — I duplicate our onboarding template and customize the tasks with their specific details. Then I send them the welcome email from our template, which includes the link to fill out their brand questionnaire. Once they submit that questionnaire, I review it and add their brand assets to their Google Drive folder. After that, I schedule our kickoff call in Calendly and send them the prep doc. The whole process usually takes about 2-3 days. The process is done when we've had our kickoff call and they're fully set up in all our systems. Common mistakes are forgetting to update the Asana due dates or not checking that all their logins work before the kickoff.`
        : `This is how we process product orders. When an order comes in through Shopify, we first check inventory in our warehouse management system. Then we print the packing slip and pull items from the shelf. We quality check each item before packing. Then we pack it with tissue paper, sticker, and a thank you card. We weigh the package and print the shipping label through ShipStation. Finally we scan it as shipped which triggers the confirmation email to the customer. Rush orders get flagged and need to be processed within 4 hours. If an item is out of stock, we email the customer within 1 hour. The whole process takes about 10-15 minutes per order.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `You are an SOP extraction tool. Given this transcript of someone explaining a process, extract structured SOP data. Respond ONLY with a JSON object (no markdown, no backticks, no preamble) matching this exact structure. For arrays of strings, provide 2-4 items. For "steps" provide objects with "what", "tools", "time" keys. For "flowSteps" provide 5-7 string items.

{
  "overview": { "sopTitle": "", "category": "", "owner": "", "executor": "", "frequency": "" },
  "whyItMatters": { "problemSolved": "", "desiredOutcome": "", "riskOfSkipping": "" },
  "triggers": { "trigger": "", "completion": "", "prerequisites": "", "downstream": "" },
  "bigPicture": { "flowSteps": ["","","","",""] },
  "detailedSteps": { "steps": [{"what":"","tools":"","time":""}] },
  "decisions": { "independentDecisions": "", "approvalRequired": "", "missingInfo": "", "escalationContact": "" },
  "doneRight": { "completionCriteria": "", "qualityChecklist": ["",""], "commonMistakes": ["",""] },
  "aiAutomation": { "aiUsage": "", "aiGuardrails": "", "humanReview": "", "connectedTools": "" },
  "evolution": { "metrics": "", "reviewer": "", "feedbackProcess": "", "revisionTriggers": "" }
}

Category must be one of: Operations, Client Experience, Marketing, Finance, Team.
Frequency must be one of: One-time, Daily, Weekly, Bi-weekly, Monthly, Quarterly, Annually, Triggered by event.
Fill in every field with intelligent suggestions based on the transcript.

Transcript:
${demoTranscript}`,
          }],
        }),
      });

      setProgress(75);
      const apiData = await response.json();
      const text = apiData.content.map(i => i.text || "").join("\n");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      if (parsed.detailedSteps?.steps) {
        parsed.detailedSteps.steps = parsed.detailedSteps.steps.map(s => ({ ...s, id: uid() }));
      }
      setProgress(100);
      setStatus("done");
      await new Promise(r => setTimeout(r, 600));
      onTranscriptReady(parsed);
    } catch (err) {
      console.error("AI processing error:", err);
      setProgress(100);
      setStatus("done");
      await new Promise(r => setTimeout(r, 400));
      setProcessing(false);
      setStatus("");
      setProgress(0);
    }
  };

  return (
    <div style={S.videoCard}>
      <div style={S.videoCardPattern} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <span style={{ fontSize: "18px" }}>🎥</span>
          <div style={S.secNum(C.primary)}>AI-Powered Import</div>
          <span style={{ ...S.badge, ...S.proBadge }}>Pro</span>
        </div>
        <h3 style={{ ...S.secTitle, fontSize: "17px", marginBottom: "4px" }}>Start from a video</h3>
        <p style={{ fontSize: "12px", color: C.textLight, margin: "0 0 16px", lineHeight: 1.5 }}>
          Paste a Loom link or upload a screen recording. We'll transcribe it and draft your whole SOP — then you review each section.
        </p>

        {!processing ? (
          !isPro ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: "13px", color: C.textLight, marginBottom: "10px" }}>Video import is a Pro feature</div>
              <div style={{ fontSize: "11px", color: C.sage }}>Toggle Pro mode above to try it</div>
            </div>
          ) : (
            <>
              <div style={S.videoInputRow}>
                <input
                  style={S.videoInput}
                  placeholder="Paste your Loom link here..."
                  value={loomUrl}
                  onChange={e => setLoomUrl(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && loomUrl.trim() && simulateProcessing("loom")}
                />
                <button style={S.videoBtn("primary")} onClick={() => loomUrl.trim() && simulateProcessing("loom")}>
                  ✦ Analyze
                </button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "12px 0" }}>
                <div style={{ flex: 1, height: "1px", background: C.border }} />
                <span style={S.orDivider}>or</span>
                <div style={{ flex: 1, height: "1px", background: C.border }} />
              </div>
              <input type="file" ref={fileRef} accept="video/*" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; if (f) { setVideoFile(f); simulateProcessing("upload"); } }} />
              <button style={S.uploadVideoBtn} onClick={() => fileRef.current?.click()}>
                📁 Upload a video file
              </button>
            </>
          )
        ) : (
          <div>
            <div style={S.progressBar}><div style={S.progressFill(progress)} /></div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {status !== "done" && <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>}
              {status !== "done" && <div style={S.processingPulse} />}
              {status === "done" && <span style={{ fontSize: "16px" }}>✅</span>}
              <span style={{ fontSize: "13px", fontWeight: 500, color: C.textLight }}>
                {status === "transcribing" && "Transcribing your video..."}
                {status === "analyzing" && "Building your SOP draft..."}
                {status === "done" && "All done! Loading your draft..."}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   AI REVIEW FLOW
   ═══════════════════════════════════════════ */
function AIReviewFlow({ aiData, onConfirmAll, onFieldChange, sectionStatuses, onConfirmSection, onEditSection }) {
  const confirmed = Object.values(sectionStatuses).filter(s => s === "confirmed").length;
  const total = SECTION_ORDER.length;
  const allConfirmed = confirmed === total;

  return (
    <div>
      <div style={{ ...S.card, background: "linear-gradient(135deg, #F0FFF4 0%, #FFF 100%)", border: "1.5px solid #C6F0D0", marginBottom: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: 700, color: C.dark, fontFamily: "'Playfair Display', serif" }}>Review your SOP draft</div>
            <div style={{ fontSize: "12px", color: C.textLight, marginTop: "2px" }}>{confirmed} of {total} sections confirmed — read each one and make any tweaks</div>
          </div>
          {allConfirmed && (
            <button style={{ ...S.videoBtn("primary"), padding: "10px 22px" }} onClick={onConfirmAll}>
              ✦ Looks good!
            </button>
          )}
        </div>
        <div style={{ ...S.progressBar, marginTop: "12px", marginBottom: "0" }}>
          <div style={S.progressFill((confirmed / total) * 100)} />
        </div>
      </div>

      {SECTION_ORDER.map(key => {
        const sec = SECTIONS[key];
        const sData = aiData[key] || {};
        const status = sectionStatuses[key] || "suggested";
        const isEditing = status === "editing";
        const isConfirmed = status === "confirmed";

        return (
          <div key={key} style={{
            ...S.aiReviewCard,
            borderColor: isConfirmed ? "#C6F0D0" : isEditing ? `${C.primary}60` : C.border,
            background: isConfirmed ? "#FBFEFB" : "#FFF",
          }}>
            <div style={S.aiReviewHeader}>
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", flex: 1 }}>
                <div style={S.aiStatusDot(status)} />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: C.dark }}>{sec.num}. {sec.title}</div>
                  <div style={{ fontSize: "11px", color: C.textLight }}>
                    {isConfirmed ? "✓ Confirmed" : isEditing ? "Editing..." : "AI suggestion — looks right? Hit confirm!"}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {!isConfirmed && !isEditing && (
                  <>
                    <button style={S.editBtn} onClick={() => onEditSection(key)}>Edit</button>
                    <button style={S.confirmBtn} onClick={() => onConfirmSection(key)}>Confirm ✓</button>
                  </>
                )}
                {isEditing && (
                  <button style={S.confirmBtn} onClick={() => onConfirmSection(key)}>Save & Confirm</button>
                )}
                {isConfirmed && (
                  <button style={S.editBtn} onClick={() => onEditSection(key)}>Revise</button>
                )}
              </div>
            </div>

            {!isEditing ? (
              <div>
                {sec.fields.map(field => {
                  const val = sData[field.key];
                  if (!val || (typeof val === "string" && !val.trim())) return null;
                  return (
                    <div key={field.key} style={S.aiFieldPreview}>
                      <div style={{ fontSize: "11px", fontWeight: 600, color: C.mid, marginBottom: "3px" }}>{field.label}</div>
                      {typeof val === "string" && <div>{val}</div>}
                      {Array.isArray(val) && field.type === "steplist" && val.map((v, i) => (
                        <div key={i} style={{ marginBottom: "2px" }}><span style={{ color: C.primary, fontWeight: 700 }}>{i + 1}.</span> {v}</div>
                      ))}
                      {Array.isArray(val) && field.type === "detailedsteps" && val.map((s, i) => (
                        <div key={i} style={{ marginBottom: "4px" }}>
                          <span style={{ fontWeight: 600, color: C.dark }}>Step {i + 1}:</span> {s.what}
                          {s.tools && <span style={{ fontSize: "11px", color: C.textLight }}> — {s.tools}</span>}
                        </div>
                      ))}
                      {Array.isArray(val) && field.type === "bulletlist" && val.map((v, i) => (
                        <div key={i}>• {v}</div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div>
                {sec.fields.map(field => renderField(field, sData, (k, v) => onFieldChange(key, k, v)))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════
   EXPORT HELPERS
   ═══════════════════════════════════════════ */
async function exportPDF(previewRef, title) {
  const element = document.getElementById("sop-preview");
  if (!element) return;
  const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
  const imgData = canvas.toDataURL("image/jpeg", 0.92);
  const pdf = new jsPDF("p", "mm", "a4");
  const pdfW = pdf.internal.pageSize.getWidth();
  const pdfH = pdf.internal.pageSize.getHeight();
  const imgH = (canvas.height * pdfW) / canvas.width;
  let position = 0;
  let heightLeft = imgH;
  pdf.addImage(imgData, "JPEG", 0, 0, pdfW, imgH);
  heightLeft -= pdfH;
  while (heightLeft > 0) {
    position -= pdfH;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, pdfW, imgH);
    heightLeft -= pdfH;
  }
  pdf.save(`${(title || "SOP").replace(/\s+/g, "_")}.pdf`);
}

async function exportDocx(data, brand, isPro) {
  const biz = brand.businessName || "";
  const children = [];

  if (biz) {
    children.push(new Paragraph({
      children: [new TextRun({ text: biz, bold: true, size: 28, color: "803D1B" })],
    }));
  }

  children.push(new Paragraph({
    text: data.overview?.sopTitle || "Standard Operating Procedure",
    heading: HeadingLevel.TITLE,
  }));

  const metaParts = [
    data.overview?.category,
    data.overview?.status,
    data.overview?.versionDate,
  ].filter(Boolean);
  if (metaParts.length) {
    children.push(new Paragraph({
      children: [new TextRun({ text: metaParts.join("  ·  "), color: "99998F", size: 20 })],
    }));
  }

  children.push(new Paragraph({ text: "" }));

  SECTION_ORDER.forEach(key => {
    const sec = SECTIONS[key];
    if (!sec.free && !isPro) return;
    const sData = data[key] || {};

    children.push(new Paragraph({
      text: `${sec.num}. ${sec.title}`,
      heading: HeadingLevel.HEADING_1,
    }));

    sec.fields.forEach(field => {
      const val = sData[field.key];
      if (!val) return;
      if (typeof val === "string" && val.trim()) {
        children.push(new Paragraph({
          children: [
            new TextRun({ text: `${field.label}: `, bold: true }),
            new TextRun(val),
          ],
        }));
      } else if (Array.isArray(val)) {
        children.push(new Paragraph({
          children: [new TextRun({ text: field.label, bold: true })],
        }));
        val.forEach((item, i) => {
          if (typeof item === "string" && item.trim()) {
            children.push(new Paragraph({ text: `${i + 1}. ${item}`, indent: { left: 360 } }));
          } else if (item?.what?.trim()) {
            children.push(new Paragraph({
              children: [new TextRun({ text: `Step ${i + 1}: `, bold: true }), new TextRun(item.what)],
              indent: { left: 360 },
            }));
            if (item.tools) children.push(new Paragraph({ text: `Tools: ${item.tools}`, indent: { left: 720 } }));
            if (item.time) children.push(new Paragraph({ text: `Time: ${item.time}`, indent: { left: 720 } }));
          }
        });
      }
    });

    children.push(new Paragraph({ text: "" }));
  });

  if (biz) {
    children.push(new Paragraph({
      children: [new TextRun({ text: `© ${new Date().getFullYear()} ${biz}`, color: "99998F", size: 18 })],
      alignment: AlignmentType.CENTER,
    }));
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${(data.overview?.sopTitle || "SOP").replace(/\s+/g, "_")}.docx`);
}

/* ═══════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════ */
export default function SOPGenerator() {
  const [appStage, setAppStage] = useState("welcome"); // "welcome" | "editor"
  const [isPro, setIsPro] = useState(false);
  const [activeView, setActiveView] = useState("editor");
  const [activeSection, setActiveSection] = useState("overview");
  const [startMethod, setStartMethod] = useState("manual");
  const [data, setData] = useState({});
  const [brand, setBrand] = useState({ ...DEFAULT_BRAND });
  const [exporting, setExporting] = useState(false);

  const [aiMode, setAiMode] = useState(false);
  const [aiData, setAiData] = useState({});
  const [sectionStatuses, setSectionStatuses] = useState({});

  const previewRef = useRef(null);

  useEffect(() => {
    const playfair = document.createElement("link");
    playfair.rel = "stylesheet";
    playfair.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap";
    document.head.appendChild(playfair);
  }, []);

  const handleStart = ({ businessName, startMethod: method }) => {
    setBrand(b => ({ ...b, businessName }));
    setStartMethod(method);
    setAppStage("editor");
    if (method === "video") {
      setIsPro(true);
    }
  };

  const handleFieldChange = useCallback((sectionId, key, value) => {
    if (aiMode) {
      setAiData(prev => ({ ...prev, [sectionId]: { ...prev[sectionId], [key]: value } }));
    } else {
      setData(prev => ({ ...prev, [sectionId]: { ...prev[sectionId], [key]: value } }));
    }
  }, [aiMode]);

  const handleTranscriptReady = (parsed) => {
    setAiData(parsed);
    const statuses = {};
    SECTION_ORDER.forEach(k => { statuses[k] = "suggested"; });
    setSectionStatuses(statuses);
    setAiMode(true);
    setActiveView("editor");
  };

  const handleConfirmSection = (key) => setSectionStatuses(prev => ({ ...prev, [key]: "confirmed" }));
  const handleEditSection = (key) => setSectionStatuses(prev => ({ ...prev, [key]: "editing" }));
  const handleConfirmAll = () => {
    setData(aiData);
    setAiMode(false);
    setSectionStatuses({});
    setActiveView("editor");
    setActiveSection("overview");
  };

  const handleExportPDF = async () => {
    setExporting(true);
    const prevView = activeView;
    setActiveView("preview");
    await new Promise(r => setTimeout(r, 200));
    try {
      await exportPDF(previewRef, data.overview?.sopTitle);
    } finally {
      setActiveView(prevView);
      setExporting(false);
    }
  };

  const handleExportDocx = async () => {
    setExporting(true);
    try {
      await exportDocx(data, brand, isPro);
    } finally {
      setExporting(false);
    }
  };

  if (appStage === "welcome") {
    return <WelcomeScreen onStart={handleStart} initialBusinessName={brand.businessName} />;
  }

  const currentSection = SECTIONS[activeSection];
  const isLocked = !currentSection.free && !isPro;

  return (
    <div style={S.app}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.headerDots} />
        <div style={S.headerEyebrow}>Shine Bright Virtual</div>
        <h1 style={S.headerTitle}>
          <span style={S.headerAccent}>SOP</span> Generator
        </h1>
        <p style={S.headerSub}>
          {brand.businessName ? `Building for ${brand.businessName}` : "Let's document how you work"}
        </p>
      </div>

      {/* Tier Toggle */}
      <div style={{ maxWidth: "720px", margin: "14px auto 0", padding: "0 16px" }}>
        <div style={S.tierToggle}>
          <span style={S.tierLabel(!isPro)}>Free</span>
          <div style={S.toggleTrack(isPro)} onClick={() => setIsPro(!isPro)}>
            <div style={S.toggleThumb(isPro)} />
          </div>
          <span style={S.tierLabel(isPro)}>Pro ✦</span>
          <span style={{ fontSize: "11px", color: C.mid, marginLeft: "auto" }}>
            {isPro ? "All 9 sections + video import + branding" : "Sections 1–5 are free"}
          </span>
        </div>
      </div>

      {/* View Tabs */}
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 16px" }}>
        <div style={S.tabRow}>
          <button style={S.tab(activeView === "editor")} onClick={() => setActiveView("editor")}>
            {aiMode ? "Review Draft" : "Editor"}
          </button>
          <button style={S.tab(activeView === "preview")} onClick={() => setActiveView("preview")}>Preview</button>
          {isPro && <button style={S.tab(activeView === "brand")} onClick={() => setActiveView("brand")}>Branding</button>}
        </div>
      </div>

      {/* Section Nav */}
      {activeView === "editor" && !aiMode && (
        <div style={S.navBar}>
          {SECTION_ORDER.map(key => {
            const sec = SECTIONS[key];
            const locked = !sec.free && !isPro;
            return (
              <button key={key} style={S.navItem(activeSection === key, locked)} onClick={() => !locked && setActiveSection(key)}>
                {locked && <span style={{ fontSize: "10px" }}>🔒</span>}
                {sec.num}. {sec.title}
              </button>
            );
          })}
        </div>
      )}

      {/* Main */}
      <div style={S.main}>
        {/* Video Import */}
        {activeView === "editor" && !aiMode && startMethod === "video" && (
          <VideoImportPanel onTranscriptReady={handleTranscriptReady} isPro={isPro} />
        )}
        {/* If they started manually but want to switch to video */}
        {activeView === "editor" && !aiMode && startMethod === "manual" && isPro && (
          <VideoImportPanel onTranscriptReady={handleTranscriptReady} isPro={isPro} />
        )}

        {/* AI Review */}
        {activeView === "editor" && aiMode && (
          <AIReviewFlow
            aiData={aiData}
            sectionStatuses={sectionStatuses}
            onConfirmSection={handleConfirmSection}
            onEditSection={handleEditSection}
            onConfirmAll={handleConfirmAll}
            onFieldChange={handleFieldChange}
          />
        )}

        {/* Brand Panel */}
        {activeView === "brand" && isPro && (
          <BrandPanel brand={brand} setBrand={setBrand} isPro={isPro} />
        )}

        {/* Preview */}
        {activeView === "preview" && (
          <PreviewPanel data={aiMode ? aiData : data} brand={brand} isPro={isPro} previewRef={previewRef} />
        )}

        {/* Manual Editor */}
        {activeView === "editor" && !aiMode && (
          isLocked ? (
            <div style={S.lockedCard}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "36px", marginBottom: "10px" }}>🔒</div>
                <h3 style={{ ...S.secTitle, fontSize: "17px", textAlign: "center" }}>{currentSection.num}. {currentSection.title}</h3>
                <p style={{ fontSize: "13px", color: C.textLight, margin: "6px 0 14px", maxWidth: "340px" }}>
                  {currentSection.subtitle} — unlock this section with a Pro account.
                </p>
                <button style={{ ...S.exportBtn(true), padding: "9px 20px" }} onClick={() => setIsPro(true)}>✦ Unlock Pro</button>
              </div>
            </div>
          ) : (
            <div style={S.card}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                <div style={S.secNum()}>Section {currentSection.num}</div>
                <span style={{ ...S.badge, ...(currentSection.free ? S.freeBadge : S.proBadge) }}>
                  {currentSection.free ? "Free" : "Pro"}
                </span>
              </div>
              <h2 style={S.secTitle}>{currentSection.title}</h2>
              <p style={S.secSub}>{currentSection.subtitle}</p>
              {currentSection.fields.map(field =>
                renderField(field, data[activeSection] || {}, (key, val) => handleFieldChange(activeSection, key, val))
              )}
            </div>
          )
        )}
      </div>

      {/* Export Bar */}
      <div style={S.exportBar}>
        <button style={S.exportBtn(true)} onClick={handleExportPDF} disabled={exporting}>
          {exporting ? "Saving..." : "⬇ Save as PDF"}
        </button>
        <button style={S.exportBtn(false)} onClick={handleExportDocx} disabled={exporting}>
          📝 Download for Google Docs
        </button>
      </div>
    </div>
  );
}
