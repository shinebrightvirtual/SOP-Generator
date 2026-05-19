import { useState, useRef, useCallback, useEffect } from "react";

const SECTIONS = {
  overview: {
    id: "overview",
    num: 1,
    title: "Overview & Ownership",
    subtitle: "The quick snapshot",
    free: true,
    aiPrompt: "Extract: SOP title, category (Operations/Client Experience/Marketing/Finance/Team), who owns this process, who executes it, and frequency.",
    fields: [
      { key: "sopTitle", label: "SOP Title", type: "text", placeholder: "e.g., Client Onboarding Process" },
      { key: "category", label: "Category", type: "select", options: ["Operations", "Client Experience", "Marketing", "Finance", "Team"] },
      { key: "owner", label: "Owner (Accountable)", type: "text", placeholder: "Role or name of the person accountable" },
      { key: "executor", label: "Executor (Does the Work)", type: "text", placeholder: "Who performs this process?" },
      { key: "frequency", label: "Frequency", type: "select", options: ["One-time", "Daily", "Weekly", "Bi-weekly", "Monthly", "Quarterly", "Annually", "Triggered by event"] },
      { key: "status", label: "Status", type: "select", options: ["Draft", "Active", "Needs Review", "Archived"] },
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
    aiPrompt: "Extract: what problem this process solves, the desired outcome, and what goes wrong if skipped.",
    fields: [
      { key: "problemSolved", label: "What problem does this solve?", type: "textarea", placeholder: "Describe the pain point or gap this SOP addresses..." },
      { key: "desiredOutcome", label: "Desired outcome when done well", type: "textarea", placeholder: "What does a great result look like?" },
      { key: "riskOfSkipping", label: "What breaks if we skip this?", type: "textarea", placeholder: "The cost, risk, or consequence of not following this process..." },
    ],
  },
  triggers: {
    id: "triggers",
    num: 3,
    title: "Triggers & Boundaries",
    subtitle: "When it starts, when it ends",
    free: true,
    aiPrompt: "Extract: what triggers this process, what marks completion, prerequisites, and downstream dependencies.",
    fields: [
      { key: "trigger", label: "What triggers this SOP?", type: "textarea", placeholder: "e.g., New client signs contract, order is placed..." },
      { key: "completion", label: "What signals completion?", type: "textarea", placeholder: "How do you know this process is done?" },
      { key: "prerequisites", label: "What needs to happen first?", type: "textarea", placeholder: "Dependencies or prerequisites before starting..." },
      { key: "downstream", label: "What depends on this being done?", type: "textarea", placeholder: "Other processes that rely on this being completed correctly..." },
    ],
  },
  bigPicture: {
    id: "bigPicture",
    num: 4,
    title: "The Big Picture",
    subtitle: "The 30-second overview",
    free: true,
    aiPrompt: "Extract: the 5-7 major phases of this process as a high-level numbered flow.",
    fields: [
      { key: "flowSteps", label: "High-level flow (5–7 major phases)", type: "steplist", placeholder: "Describe this phase...", maxSteps: 7 },
    ],
  },
  detailedSteps: {
    id: "detailedSteps",
    num: 5,
    title: "Detailed Steps",
    subtitle: "The full how-to",
    free: true,
    aiPrompt: "Extract: every step with what happens, tools/systems used, and time estimates.",
    fields: [
      { key: "steps", label: "Step-by-step execution", type: "detailedsteps" },
    ],
  },
  decisions: {
    id: "decisions",
    num: 6,
    title: "Decisions & Escalation",
    subtitle: "Where judgment calls live",
    free: false,
    aiPrompt: "Extract: decisions that can be made independently, those needing approval, what to do if info is missing, and escalation contacts.",
    fields: [
      { key: "independentDecisions", label: "Decisions that can be made independently", type: "textarea", placeholder: "What can the executor decide on their own?" },
      { key: "approvalRequired", label: "Decisions that need approval", type: "textarea", placeholder: "What needs sign-off, and from whom?" },
      { key: "missingInfo", label: "If information is missing...", type: "textarea", placeholder: "What should the executor do?" },
      { key: "escalationContact", label: "Escalation contact", type: "text", placeholder: "Who to contact if something goes wrong" },
    ],
  },
  doneRight: {
    id: "doneRight",
    num: 7,
    title: "Done Right Checklist",
    subtitle: "How you know it's complete",
    free: false,
    aiPrompt: "Extract: definition of done, quality checklist items, and common mistakes to avoid.",
    fields: [
      { key: "completionCriteria", label: "Definition of done", type: "textarea", placeholder: "This SOP is complete when..." },
      { key: "qualityChecklist", label: "Quality checklist", type: "bulletlist", placeholder: "Add a quality checkpoint..." },
      { key: "commonMistakes", label: "Common mistakes to avoid", type: "bulletlist", placeholder: "Add a common pitfall..." },
    ],
  },
  aiAutomation: {
    id: "aiAutomation",
    num: 8,
    title: "AI & Automation",
    subtitle: "Where technology supports the process",
    free: false,
    aiPrompt: "Extract: where AI or automation could support this, guardrails, human review points, and connected tools.",
    fields: [
      { key: "aiUsage", label: "Where AI or automation supports this process", type: "textarea", placeholder: "e.g., AI drafts initial copy, Zapier sends notifications..." },
      { key: "aiGuardrails", label: "What AI should never handle here", type: "textarea", placeholder: "Critical boundaries for automated tools..." },
      { key: "humanReview", label: "Where human review is required", type: "textarea", placeholder: "Checkpoints that need a real person..." },
      { key: "connectedTools", label: "Connected tools & automations", type: "text", placeholder: "e.g., Zapier, ChatGPT, Slack bot, Airtable automation..." },
    ],
  },
  evolution: {
    id: "evolution",
    num: 9,
    title: "Tracking & Evolution",
    subtitle: "Keeping it alive",
    free: false,
    aiPrompt: "Extract: metrics to monitor, who reviews, how feedback is logged, and revision triggers.",
    fields: [
      { key: "metrics", label: "Metrics or signals to monitor", type: "textarea", placeholder: "How do you know this process is working well?" },
      { key: "reviewer", label: "Who reviews performance?", type: "text", placeholder: "Role responsible for reviewing this SOP" },
      { key: "feedbackProcess", label: "How issues or feedback get logged", type: "text", placeholder: "e.g., Slack channel, Airtable form, shared doc..." },
      { key: "revisionTriggers", label: "What would trigger a revision?", type: "textarea", placeholder: "e.g., tool change, team change, recurring problems..." },
    ],
  },
};

const SECTION_ORDER = ["overview", "whyItMatters", "triggers", "bigPicture", "detailedSteps", "decisions", "doneRight", "aiAutomation", "evolution"];

let _id = 0;
const uid = () => `uid-${++_id}`;

const DEFAULT_BRAND = {
  logo: null,
  logoName: "",
  primaryColor: "#1B3A4B",
  accentColor: "#E8985E",
  businessName: "",
};

/* ═══════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════ */
const S = {
  app: {
    minHeight: "100vh",
    background: "#F7F5F0",
    fontFamily: "'DM Sans', sans-serif",
    color: "#2D2D2D",
  },
  header: {
    background: "linear-gradient(135deg, #1B3A4B 0%, #2D5F73 100%)",
    padding: "36px 24px 28px",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
  },
  headerPattern: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: "radial-gradient(circle at 20% 50%, rgba(232,152,94,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 40%)",
    pointerEvents: "none",
  },
  headerTitle: { fontSize: "26px", fontWeight: 700, color: "#FFF", margin: 0, letterSpacing: "-0.5px", position: "relative", zIndex: 1 },
  headerAccent: { color: "#E8985E" },
  headerSub: { fontSize: "13px", color: "rgba(255,255,255,0.65)", marginTop: "6px", position: "relative", zIndex: 1, fontWeight: 400 },
  navBar: {
    display: "flex", gap: "2px", padding: "10px 16px", background: "#FFF",
    borderBottom: "1px solid #E8E4DD", overflowX: "auto", position: "sticky", top: 0, zIndex: 100,
  },
  navItem: (active, locked) => ({
    padding: "7px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: active ? 600 : 500,
    background: active ? "#1B3A4B" : "transparent",
    color: active ? "#FFF" : locked ? "#B5AFA6" : "#5C5C5C",
    cursor: locked ? "default" : "pointer", whiteSpace: "nowrap", transition: "all 0.2s",
    border: "none", opacity: locked ? 0.6 : 1, display: "flex", alignItems: "center", gap: "3px",
  }),
  main: { maxWidth: "720px", margin: "0 auto", padding: "20px 16px 120px" },
  card: {
    background: "#FFF", borderRadius: "16px", padding: "24px 22px", marginBottom: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)", border: "1px solid #EDE9E3",
  },
  lockedCard: {
    background: "#FAFAF8", borderRadius: "16px", padding: "28px 24px", marginBottom: "16px",
    border: "1px dashed #D4CFC7",
  },
  secNum: (c) => ({ fontSize: "10px", fontWeight: 700, color: c || "#E8985E", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "3px" }),
  secTitle: { fontSize: "20px", fontWeight: 700, color: "#1B3A4B", margin: "0 0 2px", letterSpacing: "-0.3px" },
  secSub: { fontSize: "12px", color: "#918B82", margin: "0 0 20px", fontStyle: "italic" },
  fieldGroup: { marginBottom: "16px" },
  label: { display: "block", fontSize: "12px", fontWeight: 600, color: "#3D3D3D", marginBottom: "5px" },
  input: {
    width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1.5px solid #E0DBD3",
    fontSize: "13px", fontFamily: "'DM Sans', sans-serif", color: "#2D2D2D", background: "#FDFCFA",
    outline: "none", transition: "border-color 0.2s", boxSizing: "border-box",
  },
  textarea: {
    width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1.5px solid #E0DBD3",
    fontSize: "13px", fontFamily: "'DM Sans', sans-serif", color: "#2D2D2D", background: "#FDFCFA",
    outline: "none", minHeight: "72px", resize: "vertical", transition: "border-color 0.2s", boxSizing: "border-box",
  },
  select: {
    width: "100%", padding: "9px 12px", borderRadius: "10px", border: "1.5px solid #E0DBD3",
    fontSize: "13px", fontFamily: "'DM Sans', sans-serif", color: "#2D2D2D", background: "#FDFCFA",
    outline: "none", boxSizing: "border-box", appearance: "none",
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23918B82' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
  },
  addBtn: {
    display: "inline-flex", alignItems: "center", gap: "5px", padding: "7px 14px", borderRadius: "8px",
    border: "1.5px dashed #D4CFC7", background: "transparent", color: "#7A7468", fontSize: "12px",
    fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  },
  removeBtn: {
    padding: "3px 7px", borderRadius: "6px", border: "none", background: "rgba(200,80,80,0.08)",
    color: "#C85050", fontSize: "11px", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  },
  stepNum: {
    minWidth: "26px", height: "26px", borderRadius: "50%", background: "#1B3A4B", color: "#FFF",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700,
    marginTop: "7px", flexShrink: 0,
  },
  tabRow: { display: "flex", gap: "4px", marginBottom: "20px" },
  tab: (active) => ({
    padding: "9px 18px", borderRadius: "10px 10px 0 0", border: "none", fontSize: "12px", fontWeight: active ? 600 : 500,
    background: active ? "#1B3A4B" : "#E8E4DD", color: active ? "#FFF" : "#6B6560",
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  }),
  exportBar: {
    position: "fixed", bottom: 0, left: 0, right: 0, background: "#FFF",
    borderTop: "1px solid #E8E4DD", padding: "12px 20px",
    display: "flex", justifyContent: "center", gap: "10px", zIndex: 200,
    boxShadow: "0 -2px 12px rgba(0,0,0,0.04)",
  },
  exportBtn: (primary) => ({
    padding: "10px 24px", borderRadius: "10px",
    border: primary ? "none" : "1.5px solid #1B3A4B",
    background: primary ? "linear-gradient(135deg, #1B3A4B, #2D5F73)" : "transparent",
    color: primary ? "#FFF" : "#1B3A4B", fontSize: "13px", fontWeight: 600,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: "6px",
  }),
  badge: { display: "inline-block", padding: "2px 7px", borderRadius: "6px", fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" },
  freeBadge: { background: "#E6F4EA", color: "#1E7F3F" },
  proBadge: { background: "linear-gradient(135deg, #E8985E, #D4803E)", color: "#FFF" },
  tierToggle: {
    display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px",
    background: "#FFF9F3", borderRadius: "12px", border: "1px solid #F0DCC8", marginBottom: "16px",
  },
  tierLabel: (a) => ({ fontSize: "12px", fontWeight: a ? 700 : 500, color: a ? "#1B3A4B" : "#918B82", cursor: "pointer" }),
  toggleTrack: (on) => ({
    width: "40px", height: "22px", borderRadius: "11px", background: on ? "#E8985E" : "#D4CFC7",
    position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0,
  }),
  toggleThumb: (on) => ({
    width: "16px", height: "16px", borderRadius: "50%", background: "#FFF",
    position: "absolute", top: "3px", left: on ? "21px" : "3px",
    transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
  }),
  colorPicker: { display: "flex", alignItems: "center", gap: "8px" },
  colorSwatch: (c) => ({
    width: "32px", height: "32px", borderRadius: "8px", border: "2px solid #E0DBD3",
    cursor: "pointer", background: c, flexShrink: 0,
  }),
  logoPreview: { maxHeight: "50px", maxWidth: "180px", objectFit: "contain" },
  uploadArea: {
    border: "2px dashed #D4CFC7", borderRadius: "12px", padding: "16px",
    textAlign: "center", cursor: "pointer", background: "#FDFCFA",
  },

  // ── Video import styles ──
  videoCard: {
    background: "linear-gradient(135deg, #FFF9F3 0%, #FFF 100%)",
    borderRadius: "16px", padding: "24px 22px", marginBottom: "16px",
    border: "1.5px solid #F0DCC8", position: "relative", overflow: "hidden",
  },
  videoCardPattern: {
    position: "absolute", top: 0, right: 0, width: "200px", height: "200px",
    background: "radial-gradient(circle, rgba(232,152,94,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  videoInputRow: {
    display: "flex", gap: "10px", alignItems: "stretch",
  },
  videoInput: {
    flex: 1, padding: "11px 14px", borderRadius: "10px", border: "1.5px solid #E0DBD3",
    fontSize: "13px", fontFamily: "'DM Sans', sans-serif", color: "#2D2D2D", background: "#FFF",
    outline: "none", boxSizing: "border-box",
  },
  videoBtn: (variant) => ({
    padding: "10px 18px", borderRadius: "10px", border: "none",
    background: variant === "primary" ? "linear-gradient(135deg, #E8985E, #D4803E)" : "#EDE9E3",
    color: variant === "primary" ? "#FFF" : "#5C5C5C",
    fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
    whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "6px",
  }),
  uploadVideoBtn: {
    padding: "10px 18px", borderRadius: "10px", border: "1.5px dashed #D4CFC7",
    background: "transparent", color: "#7A7468", fontSize: "13px", fontWeight: 500,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap",
    display: "flex", alignItems: "center", gap: "6px",
  },
  orDivider: { fontSize: "11px", color: "#B5AFA6", fontWeight: 600, display: "flex", alignItems: "center" },

  // ── AI Review flow ──
  aiReviewCard: {
    background: "#FFF", borderRadius: "16px", padding: "22px 20px", marginBottom: "14px",
    border: "1.5px solid #EDE9E3", position: "relative",
  },
  aiReviewHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px",
  },
  aiStatusDot: (status) => ({
    width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0, marginTop: "6px",
    background: status === "confirmed" ? "#34A853" : status === "editing" ? "#E8985E" : status === "pending" ? "#D4CFC7" : "#4A90D9",
  }),
  aiFieldPreview: {
    background: "#FAFAF8", borderRadius: "10px", padding: "12px 14px", marginBottom: "8px",
    border: "1px solid #EDE9E3", fontSize: "13px", lineHeight: 1.6, color: "#3D3D3D",
  },
  confirmBtn: {
    padding: "8px 18px", borderRadius: "8px", border: "none",
    background: "#34A853", color: "#FFF", fontSize: "12px", fontWeight: 600,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  },
  editBtn: {
    padding: "8px 18px", borderRadius: "8px", border: "1.5px solid #E8985E",
    background: "transparent", color: "#E8985E", fontSize: "12px", fontWeight: 600,
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
  },
  progressBar: {
    height: "4px", borderRadius: "2px", background: "#EDE9E3", overflow: "hidden", marginBottom: "16px",
  },
  progressFill: (pct) => ({
    height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #E8985E, #34A853)",
    borderRadius: "2px", transition: "width 0.5s ease",
  }),
  processingPulse: {
    display: "inline-block", width: "10px", height: "10px", borderRadius: "50%",
    background: "#E8985E", animation: "pulse 1.2s ease-in-out infinite",
  },
};

/* ═══════════════════════════════════════════
   FIELD COMPONENTS (same as before, tightened)
   ═══════════════════════════════════════════ */
function TextField({ field, value, onChange }) {
  return (
    <div style={S.fieldGroup}>
      <label style={S.label}>{field.label}</label>
      <input type={field.type === "date" ? "date" : "text"} style={S.input} placeholder={field.placeholder} value={value || ""} onChange={e => onChange(field.key, e.target.value)} />
    </div>
  );
}
function TextareaField({ field, value, onChange }) {
  return (
    <div style={S.fieldGroup}>
      <label style={S.label}>{field.label}</label>
      <textarea style={S.textarea} placeholder={field.placeholder} value={value || ""} onChange={e => onChange(field.key, e.target.value)} />
    </div>
  );
}
function SelectField({ field, value, onChange }) {
  return (
    <div style={S.fieldGroup}>
      <label style={S.label}>{field.label}</label>
      <select style={S.select} value={value || ""} onChange={e => onChange(field.key, e.target.value)}>
        <option value="">Select...</option>
        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
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
      {items.length < max && <button style={S.addBtn} onClick={add}>+ Add phase</button>}
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
        <div key={step.id} style={{ background: "#FAFAF8", borderRadius: "12px", padding: "14px", marginBottom: "10px", border: "1px solid #EDE9E3" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={S.stepNum}>{i + 1}</div>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#5C5C5C" }}>Step {i + 1}</span>
            </div>
            {steps.length > 1 && <button style={S.removeBtn} onClick={() => remove(i)}>Remove</button>}
          </div>
          <div style={{ marginBottom: "6px" }}>
            <label style={{ ...S.label, fontSize: "11px" }}>What happens</label>
            <textarea style={{ ...S.textarea, minHeight: "54px" }} placeholder="Describe what happens..." value={step.what} onChange={e => update(i, "what", e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ ...S.label, fontSize: "11px" }}>Tools / systems</label>
              <input style={S.input} placeholder="e.g., Asana, Docs..." value={step.tools} onChange={e => update(i, "tools", e.target.value)} />
            </div>
            <div style={{ flex: 0.4 }}>
              <label style={{ ...S.label, fontSize: "11px" }}>Time est.</label>
              <input style={S.input} placeholder="e.g., 15 min" value={step.time} onChange={e => update(i, "time", e.target.value)} />
            </div>
          </div>
        </div>
      ))}
      <button style={S.addBtn} onClick={add}>+ Add step</button>
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
          <span style={{ color: "#E8985E", fontWeight: 700, fontSize: "16px", flexShrink: 0 }}>•</span>
          <input style={{ ...S.input, flex: 1 }} placeholder={field.placeholder} value={item} onChange={e => update(i, e.target.value)} />
          {items.length > 1 && <button style={S.removeBtn} onClick={() => remove(i)}>✕</button>}
        </div>
      ))}
      <button style={S.addBtn} onClick={add}>+ Add item</button>
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
      <div style={S.secNum()}>Brand Customization</div>
      <h3 style={{ ...S.secTitle, fontSize: "17px", marginBottom: "14px" }}>Make it yours</h3>
      <div style={S.fieldGroup}>
        <label style={S.label}>Business Name</label>
        <input style={S.input} placeholder="Your business name" value={brand.businessName} onChange={e => setBrand(b => ({ ...b, businessName: e.target.value }))} />
      </div>
      <div style={S.fieldGroup}>
        <label style={S.label}>Logo</label>
        <input type="file" ref={fileRef} accept="image/*" style={{ display: "none" }} onChange={handleLogo} />
        <div style={S.uploadArea} onClick={() => fileRef.current?.click()}>
          {brand.logo ? (
            <div><img src={brand.logo} alt="Logo" style={S.logoPreview} /><div style={{ fontSize: "11px", color: "#918B82", marginTop: "4px" }}>{brand.logoName}</div></div>
          ) : (
            <div><div style={{ fontSize: "20px", marginBottom: "2px" }}>⬆</div><div style={{ fontSize: "12px", color: "#918B82" }}>Upload your logo</div></div>
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
function PreviewPanel({ data, brand, isPro }) {
  const pc = isPro ? brand.primaryColor : "#1B3A4B";
  const ac = isPro ? brand.accentColor : "#E8985E";
  const biz = isPro && brand.businessName ? brand.businessName : "";
  const sectionsToShow = SECTION_ORDER.filter(k => SECTIONS[k].free || isPro);

  return (
    <div style={{ background: "#FFF", borderRadius: "16px", padding: "28px 24px", border: "1px solid #EDE9E3", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
      <div style={{ borderBottom: `3px solid ${pc}`, paddingBottom: "14px", marginBottom: "22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          {biz && <div style={{ fontSize: "10px", fontWeight: 700, color: ac, textTransform: "uppercase", letterSpacing: "1.5px" }}>{biz}</div>}
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: pc, margin: "4px 0 0" }}>{data.overview?.sopTitle || "Standard Operating Procedure"}</h1>
          <div style={{ fontSize: "11px", color: "#918B82", marginTop: "3px" }}>
            {data.overview?.category && <span>{data.overview.category}</span>}
            {data.overview?.status && <span> · {data.overview.status}</span>}
            {data.overview?.versionDate && <span> · {data.overview.versionDate}</span>}
          </div>
        </div>
        {isPro && brand.logo && <img src={brand.logo} alt="" style={{ maxHeight: "40px", maxWidth: "100px", objectFit: "contain" }} />}
      </div>

      {sectionsToShow.map(key => {
        const sec = SECTIONS[key];
        const sData = data[key] || {};
        const hasContent = Object.values(sData).some(v => v && (typeof v === "string" ? v.trim() : Array.isArray(v) ? v.some(item => typeof item === "string" ? item.trim() : item?.what?.trim()) : false));
        if (!hasContent && key !== "overview") return null;
        return (
          <div key={key} style={{ marginBottom: "18px" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: pc, margin: "0 0 3px", borderBottom: `1.5px solid ${ac}`, paddingBottom: "5px", display: "inline-block" }}>{sec.num}. {sec.title}</h2>
            <div style={{ fontSize: "12px", color: "#4A4A4A", lineHeight: 1.6, marginTop: "6px" }}>
              {sec.fields.map(field => {
                const val = sData[field.key];
                if (!val || (typeof val === "string" && !val.trim())) return null;
                if (field.type === "steplist" && Array.isArray(val)) {
                  return (<div key={field.key} style={{ marginBottom: "6px" }}>{val.filter(v => v.trim()).map((v, i) => (<div key={i} style={{ display: "flex", gap: "6px", marginBottom: "3px" }}><span style={{ color: ac, fontWeight: 700, minWidth: "18px" }}>{i+1}.</span><span>{v}</span></div>))}</div>);
                }
                if (field.type === "detailedsteps" && Array.isArray(val)) {
                  return (<div key={field.key}>{val.filter(s => s.what?.trim()).map((s, i) => (<div key={i} style={{ marginBottom: "8px", paddingLeft: "10px", borderLeft: `2px solid ${ac}` }}><div style={{ fontWeight: 600, color: pc, fontSize: "12px" }}>Step {i+1}</div><div>{s.what}</div>{s.tools && <div style={{ fontSize: "11px", color: "#7A7468" }}>Tools: {s.tools}</div>}{s.time && <div style={{ fontSize: "11px", color: "#7A7468" }}>Time: {s.time}</div>}</div>))}</div>);
                }
                if (field.type === "bulletlist" && Array.isArray(val)) {
                  return (<div key={field.key} style={{ marginBottom: "6px" }}><div style={{ fontSize: "11px", fontWeight: 600, color: "#6B6560", marginBottom: "3px" }}>{field.label}</div>{val.filter(v => v.trim()).map((v, i) => (<div key={i} style={{ display: "flex", gap: "5px", marginBottom: "2px" }}><span style={{ color: ac }}>•</span><span>{v}</span></div>))}</div>);
                }
                if (key === "overview") return null;
                return (<div key={field.key} style={{ marginBottom: "6px" }}><span style={{ fontWeight: 600, color: "#5C5C5C" }}>{field.label}: </span><span>{val}</span></div>);
              })}
            </div>
          </div>
        );
      })}

      <div style={{ borderTop: `2px solid ${pc}`, paddingTop: "10px", marginTop: "20px", textAlign: "center" }}>
        <div style={{ fontSize: "10px", color: "#B5AFA6" }}>{biz ? `© ${new Date().getFullYear()} ${biz}` : "Created with Shine Bright SOP Generator"}</div>
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
  const [status, setStatus] = useState(""); // "", "transcribing", "analyzing", "done"
  const [progress, setProgress] = useState(0);
  const fileRef = useRef(null);

  const simulateProcessing = async (source) => {
    setProcessing(true);
    setStatus("transcribing");
    setProgress(15);

    // Simulate transcription step
    await new Promise(r => setTimeout(r, 1800));
    setProgress(40);
    setStatus("analyzing");

    // Call Claude API to generate SOP from a simulated transcript
    try {
      const demoTranscript = source === "loom"
        ? `This is a walkthrough of our client onboarding process. First, when a new client signs their contract in HoneyBook, I get a notification. I then create their project folder in Google Drive using our template. Next I set up their Asana board — I duplicate our onboarding template and customize the tasks with their specific details like their brand colors and login credentials. Then I send them the welcome email from our Dubsado template, which includes the link to fill out their brand questionnaire. Once they submit that questionnaire, I review it and add their brand assets to their Google Drive folder. After that, I schedule our kickoff call in Calendly and send them the prep doc. The whole process usually takes about 2-3 days. If they don't submit the questionnaire within 48 hours, I send a gentle reminder. The process is done when we've had our kickoff call and they're fully set up in all our systems. Common mistakes are forgetting to update the Asana due dates or not checking that all their logins work before the kickoff.`
        : `This is how we process product orders. When an order comes in through Shopify, we first check inventory in our warehouse management system. Then we print the packing slip and pull items from the shelf. We quality check each item before packing — making sure labels are straight, no damage, correct scent. Then we pack it according to our shipping standards — tissue paper, sticker, thank you card. We weigh the package and print the shipping label through ShipStation. Finally we scan it as shipped which triggers the confirmation email to the customer. Rush orders get flagged and need to be processed within 4 hours. If an item is out of stock, we email the customer within 1 hour with options. The whole process takes about 10-15 minutes per order for standard, 5 minutes for rush.`;

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
Fill in every field with intelligent suggestions based on the transcript. If something isn't explicitly mentioned, make a reasonable inference.

Transcript:
${demoTranscript}`
          }],
        }),
      });

      setProgress(75);

      const apiData = await response.json();
      const text = apiData.content.map(i => i.text || "").join("\n");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      // Add IDs to detailed steps
      if (parsed.detailedSteps?.steps) {
        parsed.detailedSteps.steps = parsed.detailedSteps.steps.map(s => ({ ...s, id: uid() }));
      }

      setProgress(100);
      setStatus("done");

      await new Promise(r => setTimeout(r, 600));
      onTranscriptReady(parsed);
    } catch (err) {
      console.error("AI processing error:", err);
      // Fallback: still show done state
      setProgress(100);
      setStatus("done");
      await new Promise(r => setTimeout(r, 400));
      setProcessing(false);
      setStatus("");
      setProgress(0);
    }
  };

  const handleLoomSubmit = () => {
    if (!loomUrl.trim()) return;
    simulateProcessing("loom");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setVideoFile(file);
    simulateProcessing("upload");
  };

  return (
    <div style={S.videoCard}>
      <div style={S.videoCardPattern} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <span style={{ fontSize: "20px" }}>🎥</span>
          <div style={S.secNum("#E8985E")}>AI-Powered Import</div>
          <span style={{ ...S.badge, ...S.proBadge }}>Pro</span>
        </div>
        <h3 style={{ ...S.secTitle, fontSize: "17px", marginBottom: "4px" }}>Start from a Video</h3>
        <p style={{ fontSize: "12px", color: "#918B82", margin: "0 0 16px", lineHeight: 1.5 }}>
          Paste a Loom link or upload a screen recording. AI will watch, transcribe, and draft your entire SOP — then you review each section.
        </p>

        {!processing ? (
          <>
            {!isPro ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ fontSize: "13px", color: "#918B82", marginBottom: "10px" }}>Video import is a Pro feature</div>
                <div style={{ fontSize: "11px", color: "#B5AFA6" }}>Toggle Pro mode above to try it</div>
              </div>
            ) : (
              <>
                <div style={S.videoInputRow}>
                  <input
                    style={S.videoInput}
                    placeholder="Paste Loom link here... (e.g., https://www.loom.com/share/...)"
                    value={loomUrl}
                    onChange={e => setLoomUrl(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLoomSubmit()}
                  />
                  <button style={S.videoBtn("primary")} onClick={handleLoomSubmit}>
                    ✦ Analyze
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "12px 0" }}>
                  <div style={{ flex: 1, height: "1px", background: "#E8E4DD" }} />
                  <span style={S.orDivider}>OR</span>
                  <div style={{ flex: 1, height: "1px", background: "#E8E4DD" }} />
                </div>
                <input type="file" ref={fileRef} accept="video/*" style={{ display: "none" }} onChange={handleFileUpload} />
                <button style={S.uploadVideoBtn} onClick={() => fileRef.current?.click()}>
                  📁 Upload a video file
                </button>
              </>
            )}
          </>
        ) : (
          <div>
            <div style={S.progressBar}>
              <div style={S.progressFill(progress)} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {status !== "done" && (
                <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
              )}
              {status !== "done" && <div style={S.processingPulse} />}
              {status === "done" && <span style={{ fontSize: "16px" }}>✅</span>}
              <span style={{ fontSize: "13px", fontWeight: 500, color: "#5C5C5C" }}>
                {status === "transcribing" && "Transcribing video..."}
                {status === "analyzing" && "AI is analyzing & drafting your SOP..."}
                {status === "done" && "SOP draft ready! Loading review..."}
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
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#1B3A4B" }}>Review AI Suggestions</div>
            <div style={{ fontSize: "12px", color: "#918B82", marginTop: "2px" }}>{confirmed} of {total} sections confirmed</div>
          </div>
          {allConfirmed && (
            <button style={{ ...S.videoBtn("primary"), padding: "10px 22px" }} onClick={onConfirmAll}>
              ✦ Finish & Edit
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
            borderColor: isConfirmed ? "#C6F0D0" : isEditing ? "#F0DCC8" : "#EDE9E3",
            background: isConfirmed ? "#FBFEFB" : "#FFF",
          }}>
            <div style={S.aiReviewHeader}>
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", flex: 1 }}>
                <div style={S.aiStatusDot(status)} />
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#1B3A4B" }}>{sec.num}. {sec.title}</div>
                  <div style={{ fontSize: "11px", color: "#918B82" }}>
                    {isConfirmed ? "✓ Confirmed" : isEditing ? "Editing..." : "AI suggestion — review & confirm"}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {!isConfirmed && !isEditing && (
                  <>
                    <button style={S.editBtn} onClick={() => onEditSection(key)}>Edit</button>
                    <button style={S.confirmBtn} onClick={() => onConfirmSection(key)}>Confirm</button>
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
                      <div style={{ fontSize: "11px", fontWeight: 600, color: "#918B82", marginBottom: "3px" }}>{field.label}</div>
                      {typeof val === "string" && <div>{val}</div>}
                      {Array.isArray(val) && field.type === "steplist" && val.map((v, i) => (
                        <div key={i} style={{ marginBottom: "2px" }}><span style={{ color: "#E8985E", fontWeight: 700 }}>{i+1}.</span> {v}</div>
                      ))}
                      {Array.isArray(val) && field.type === "detailedsteps" && val.map((s, i) => (
                        <div key={i} style={{ marginBottom: "4px" }}>
                          <span style={{ fontWeight: 600, color: "#1B3A4B" }}>Step {i+1}:</span> {s.what}
                          {s.tools && <span style={{ fontSize: "11px", color: "#7A7468" }}> — {s.tools}</span>}
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
   MAIN APP
   ═══════════════════════════════════════════ */
export default function SOPGenerator() {
  const [isPro, setIsPro] = useState(false);
  const [activeView, setActiveView] = useState("editor");
  const [activeSection, setActiveSection] = useState("overview");
  const [data, setData] = useState({});
  const [brand, setBrand] = useState({ ...DEFAULT_BRAND });
  const [exporting, setExporting] = useState(false);

  // AI flow state
  const [aiMode, setAiMode] = useState(false); // "review" mode active
  const [aiData, setAiData] = useState({});
  const [sectionStatuses, setSectionStatuses] = useState({});

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);

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

  const handleConfirmSection = (key) => {
    setSectionStatuses(prev => ({ ...prev, [key]: "confirmed" }));
  };

  const handleEditSection = (key) => {
    setSectionStatuses(prev => ({ ...prev, [key]: "editing" }));
  };

  const handleConfirmAll = () => {
    setData(aiData);
    setAiMode(false);
    setSectionStatuses({});
    setActiveView("editor");
    setActiveSection("overview");
  };

  const handleExport = async (format) => {
    setExporting(true);
    const lines = [];
    const biz = isPro && brand.businessName ? brand.businessName : "";
    if (biz) lines.push(biz);
    lines.push("═".repeat(40));
    lines.push(data.overview?.sopTitle || "Standard Operating Procedure");
    lines.push("═".repeat(40));
    lines.push("");
    SECTION_ORDER.forEach(key => {
      const sec = SECTIONS[key];
      if (!sec.free && !isPro) return;
      const sData = data[key] || {};
      lines.push(`${sec.num}. ${sec.title}`);
      lines.push("─".repeat(30));
      sec.fields.forEach(field => {
        const val = sData[field.key];
        if (!val) return;
        if (typeof val === "string" && val.trim()) {
          lines.push(`${field.label}: ${val}`);
        } else if (Array.isArray(val)) {
          lines.push(`${field.label}:`);
          val.forEach((item, i) => {
            if (typeof item === "string" && item.trim()) lines.push(`  ${i + 1}. ${item}`);
            else if (item?.what?.trim()) {
              lines.push(`  Step ${i + 1}: ${item.what}`);
              if (item.tools) lines.push(`    Tools: ${item.tools}`);
              if (item.time) lines.push(`    Time: ${item.time}`);
            }
          });
        }
      });
      lines.push("");
    });
    const text = lines.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SOP_${(data.overview?.sopTitle || "document").replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setExporting(false), 1000);
  };

  const currentSection = SECTIONS[activeSection];
  const isLocked = !currentSection.free && !isPro;

  return (
    <div style={S.app}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.headerPattern} />
        <h1 style={S.headerTitle}><span style={S.headerAccent}>Shine Bright</span> SOP Generator</h1>
        <p style={S.headerSub}>Build branded, professional SOPs in minutes</p>
      </div>

      {/* Tier Toggle */}
      <div style={{ maxWidth: "720px", margin: "14px auto 0", padding: "0 16px" }}>
        <div style={S.tierToggle}>
          <span style={S.tierLabel(!isPro)}>Free</span>
          <div style={S.toggleTrack(isPro)} onClick={() => setIsPro(!isPro)}>
            <div style={S.toggleThumb(isPro)} />
          </div>
          <span style={S.tierLabel(isPro)}>Pro ✦</span>
          <span style={{ fontSize: "11px", color: "#918B82", marginLeft: "auto" }}>
            {isPro ? "All 9 sections + video import + branding" : "Sections 1–5 free"}
          </span>
        </div>
      </div>

      {/* View Tabs */}
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 16px" }}>
        <div style={S.tabRow}>
          <button style={S.tab(activeView === "editor")} onClick={() => setActiveView("editor")}>
            {aiMode ? "🤖 Review" : "✏️ Editor"}
          </button>
          <button style={S.tab(activeView === "preview")} onClick={() => setActiveView("preview")}>👁 Preview</button>
          {isPro && <button style={S.tab(activeView === "brand")} onClick={() => setActiveView("brand")}>🎨 Brand</button>}
        </div>
      </div>

      {/* Section Nav (only in non-AI editor mode) */}
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
        {/* Video Import — always show at top of editor */}
        {activeView === "editor" && !aiMode && (
          <VideoImportPanel onTranscriptReady={handleTranscriptReady} isPro={isPro} />
        )}

        {/* AI Review Flow */}
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
          <PreviewPanel data={aiMode ? aiData : data} brand={brand} isPro={isPro} />
        )}

        {/* Manual Editor */}
        {activeView === "editor" && !aiMode && (
          isLocked ? (
            <div style={S.lockedCard}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 20px", textAlign: "center" }}>
                <div style={{ fontSize: "36px", marginBottom: "10px" }}>🔒</div>
                <h3 style={{ ...S.secTitle, fontSize: "17px", textAlign: "center" }}>{currentSection.num}. {currentSection.title}</h3>
                <p style={{ fontSize: "13px", color: "#918B82", margin: "6px 0 14px", maxWidth: "340px" }}>
                  {currentSection.subtitle} — available in Pro with video import, full branding, and export.
                </p>
                <button style={{ ...S.exportBtn(true), padding: "9px 20px" }} onClick={() => setIsPro(true)}>✦ Unlock Pro</button>
              </div>
            </div>
          ) : (
            <div style={S.card}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                <div style={S.secNum()}>{`Section ${currentSection.num}`}</div>
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
        <button style={S.exportBtn(false)} onClick={() => handleExport("txt")} disabled={exporting}>
          {exporting ? "Exporting..." : "📄 Export Text"}
        </button>
        {isPro && (
          <>
            <button style={S.exportBtn(true)} onClick={() => handleExport("pdf")} disabled={exporting}>📋 PDF</button>
            <button style={S.exportBtn(true)} onClick={() => handleExport("docx")} disabled={exporting}>📝 DOCX</button>
          </>
        )}
      </div>
    </div>
  );
}
