# Shine Bright SOP Generator

A branded SOP (Standard Operating Procedure) generator tool built for Shine Bright Virtual. Users can create professional, branded SOPs either manually or by importing a Loom/video recording that AI transcribes and structures automatically.

## Product Overview

### What It Does
- **Manual SOP Builder**: Step-by-step form to create SOPs across 9 structured sections
- **AI Video Import (Pro)**: Paste a Loom link or upload a screen recording → AI transcribes and drafts the entire SOP → user reviews/confirms each section
- **Brand Customization (Pro)**: Upload logo, set brand colors, business name — output is fully white-labeled
- **Export**: PDF and DOCX download with branding applied

### Business Model (Freemium)
- **Free Tier**: Manual form builder, Sections 1–5 only, text export
- **Pro Tier** (one-time purchase, target $47–$97): All 9 sections, video-to-SOP AI import, full brand customization, PDF + DOCX export

### Target Audience
- Solo creative entrepreneurs documenting their processes
- Virtual assistants and OBMs building SOPs for clients
- Small business teams standardizing operations

---

## The Shine Bright SOP Framework (9 Sections)

| # | Section | Free? | Purpose |
|---|---------|-------|---------|
| 1 | Overview & Ownership | ✅ | Title, category, owner, executor, frequency, status, dates |
| 2 | Why This Matters | ✅ | Problem solved, desired outcome, risk of skipping |
| 3 | Triggers & Boundaries | ✅ | What starts/ends the process, prerequisites, downstream impact |
| 4 | The Big Picture | ✅ | 5–7 high-level phases (the "if you read one section" overview) |
| 5 | Detailed Steps | ✅ | Full step-by-step with tools, systems, and time estimates |
| 6 | Decisions & Escalation | 🔒 Pro | Independent decisions, approvals needed, missing info protocol, escalation |
| 7 | Done Right Checklist | 🔒 Pro | Completion criteria, quality checklist, common mistakes |
| 8 | AI & Automation | 🔒 Pro | Where AI helps, guardrails, human review checkpoints, connected tools |
| 9 | Tracking & Evolution | 🔒 Pro | Metrics, reviewer, feedback process, revision triggers |

---

## Tech Architecture

### Current State (Prototype)
- Single React component (`sop-generator.jsx`) built as a Claude.ai artifact
- Uses Anthropic API directly for AI SOP extraction from transcripts
- In-memory state only (no persistence)
- Export is text-only (placeholder for PDF/DOCX)

### Target Production Architecture

```
shine-bright-sop-generator/
├── src/
│   ├── components/
│   │   ├── App.jsx                 # Main app shell, routing, state
│   │   ├── Header.jsx              # App header with branding
│   │   ├── TierToggle.jsx          # Free/Pro toggle
│   │   ├── SectionNav.jsx          # Section navigation bar
│   │   ├── VideoImportPanel.jsx    # Loom link / video upload UI
│   │   ├── AIReviewFlow.jsx        # AI suggestion review with confirm/edit
│   │   ├── ManualEditor.jsx        # Section-by-section form editor
│   │   ├── PreviewPanel.jsx        # Live formatted SOP preview
│   │   ├── BrandPanel.jsx          # Logo, colors, business name config
│   │   ├── ExportBar.jsx           # Export buttons (text, PDF, DOCX)
│   │   └── fields/                 # Reusable form field components
│   │       ├── TextField.jsx
│   │       ├── TextareaField.jsx
│   │       ├── SelectField.jsx
│   │       ├── StepListField.jsx
│   │       ├── DetailedStepsField.jsx
│   │       └── BulletListField.jsx
│   ├── lib/
│   │   ├── sections.js             # SOP framework section definitions
│   │   ├── ai-extract.js           # Claude API call for transcript → SOP
│   │   ├── transcribe.js           # Video transcription (Loom API / Whisper)
│   │   ├── export-pdf.js           # PDF generation with branding
│   │   ├── export-docx.js          # DOCX generation with branding
│   │   └── constants.js            # Colors, fonts, defaults
│   ├── styles/
│   │   └── theme.js                # Design tokens, style objects
│   └── main.jsx                    # Entry point
├── public/
│   └── index.html
├── docs/
│   ├── PRODUCT_SPEC.md             # This product spec
│   ├── AI_PROMPT.md                # The Claude API prompt for SOP extraction
│   └── DEPLOYMENT.md               # Deployment guide
├── package.json
├── vite.config.js
└── README.md
```

### Key Technical Decisions to Make

#### 1. Hosting & Deployment
- **Recommended**: Vercel or Netlify (free tier handles this easily)
- Frontend: Static React app (Vite build)
- Backend: Serverless functions for AI calls and document generation
- Domain: `shinebrightvirtual.com/sop-generator` or `tools.shinebrightvirtual.com`

#### 2. Video Transcription
- **Loom links**: Use [Loom API](https://developers.loom.com/) to fetch transcript directly
- **Uploaded videos**: Use [Deepgram](https://deepgram.com/) or [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text) for transcription
- Deepgram has a generous free tier and is fast; Whisper is cheaper at scale

#### 3. AI SOP Extraction
- Uses Anthropic Claude API (claude-sonnet-4-20250514)
- Prompt is in `docs/AI_PROMPT.md`
- Returns structured JSON matching the 9-section framework
- Serverless function proxies the call (keeps API key server-side)

#### 4. Document Export
- **PDF**: Use [jsPDF](https://github.com/parallax/jsPDF) + [html2canvas](https://html2canvas.hertzen.com/), or for higher quality, a server-side solution like [Puppeteer](https://pptr.dev/) in a serverless function
- **DOCX**: Use [docx](https://github.com/dolanmiri/docx) npm package — excellent for programmatic Word doc generation with full formatting control
- Both need to apply user's brand colors, logo, and business name

#### 5. Payment Processing
- **Recommended**: [Stripe Checkout](https://stripe.com/checkout) or [LemonSqueezy](https://lemonsqueezy.com/) (simpler for digital products)
- One-time purchase unlocks Pro features
- Store purchase status in localStorage + a simple database (Supabase free tier, or even Stripe's customer portal)

#### 6. User Accounts (Optional for V1)
- V1 could work without accounts — payment unlocks Pro via a license key stored in localStorage
- V2: Add simple auth (Supabase Auth or Clerk) for saved SOPs, team features

---

## Development Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

### Environment Variables
Create a `.env` file:
```
VITE_ANTHROPIC_API_KEY=sk-ant-...    # For development only — move to serverless in production
LOOM_API_KEY=...                      # For Loom transcript fetching
DEEPGRAM_API_KEY=...                  # For video upload transcription
```

⚠️ **IMPORTANT**: Never expose API keys in the frontend. In production, all AI and transcription calls must go through serverless functions (Vercel API routes or Netlify Functions).

---

## Claude Code Development Guide

### Priority Order for Building

**Phase 1 — Core App (Week 1)**
1. Scaffold Vite + React project
2. Break the monolithic `sop-generator.jsx` into the component structure above
3. Set up the design system (theme.js with CSS variables)
4. Get the manual editor fully working with all 9 sections
5. Implement the preview panel with live updates

**Phase 2 — Export (Week 2)**
1. Build PDF export using the `docx` and `jspdf` packages
2. Build DOCX export with full branding (logo, colors, business name)
3. Test export quality across both formats

**Phase 3 — AI Video Import (Week 2–3)**
1. Set up serverless function for Claude API proxy
2. Implement Loom API integration for transcript fetching
3. Implement Deepgram/Whisper for uploaded video transcription
4. Build the AI review flow (suggest → confirm/edit → finalize)
5. Refine the AI extraction prompt for quality

**Phase 4 — Payment & Deployment (Week 3–4)**
1. Set up Stripe or LemonSqueezy for one-time purchase
2. Implement Pro tier gating (payment verification)
3. Deploy to Vercel/Netlify
4. Connect to shinebrightvirtual.com domain
5. Test full flow end-to-end

### Key Files to Reference
- `src/components/sop-generator-prototype.jsx` — the working prototype (monolithic, for reference)
- `src/lib/sections.js` — the SOP framework definition (extract from prototype)
- `docs/AI_PROMPT.md` — the Claude API prompt for SOP extraction

---

## Design System

### Colors
- Primary: `#1B3A4B` (deep teal-navy)
- Accent: `#E8985E` (warm copper)
- Background: `#F7F5F0` (warm paper)
- Card: `#FFFFFF`
- Border: `#EDE9E3`
- Muted text: `#918B82`

### Typography
- Font: DM Sans (Google Fonts)
- Weights: 400, 500, 600, 700

### Component Patterns
- Cards: 16px border-radius, subtle shadow, 1px border
- Inputs: 10px border-radius, 1.5px border, warm background
- Buttons: 10px border-radius, gradient for primary actions
- Step numbers: Circular badges with primary color background

---

## License & IP Notes
- This SOP framework is **original work** created for Shine Bright Virtual
- It is inspired by common SOP best practices but does NOT reproduce any licensed template
- The framework, section names, field structures, and guidance language are fully owned by Shine Bright Virtual / Shine Designs LLC
- Safe to sell, distribute, and build products around
