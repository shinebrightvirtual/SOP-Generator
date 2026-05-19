# CLAUDE.md — Project Context for Claude Code

## What This Is
The Shine Bright SOP Generator is a freemium web tool that helps business owners and virtual assistants create branded Standard Operating Procedures. It's built for Shine Bright Virtual (owner: Jess, jess@shinebrightvirtual.com).

## Key Product Decisions Already Made
- **Freemium model**: Free tier = manual builder (sections 1–5) + text export. Pro tier = all 9 sections + AI video import + branding + PDF/DOCX export.
- **AI video import**: Users paste a Loom link or upload video → transcription → Claude API extracts structured SOP → user reviews each section with confirm/edit flow.
- **White-label output**: Pro users' exported SOPs show THEIR branding (logo, colors, business name), not Shine Bright's.
- **Original framework**: The 9-section SOP structure is Jess's original IP, NOT derived from any licensed template. Safe to sell.

## Current State
- `src/components/sop-generator-prototype.jsx` — Working monolithic prototype (built as a Claude.ai artifact). This is the reference implementation with all features working.
- `src/lib/sections.js` — SOP framework definitions extracted into a clean module
- `src/lib/constants.js` — Design tokens (colors, typography, spacing)
- `src/lib/ai-extract.js` — Claude API integration for transcript → SOP extraction
- `src/lib/transcribe.js` — Loom + video upload transcription handlers
- `docs/AI_PROMPT.md` — The full AI extraction prompt with improvement notes
- `docs/DEPLOYMENT.md` — Production deployment guide with cost estimates

## What Needs To Be Done

### Phase 1 — Break Up the Prototype
The monolithic prototype in `sop-generator-prototype.jsx` works but needs to be split into the component structure outlined in README.md. The prototype is the source of truth for behavior and styling.

### Phase 2 — Real Export
Currently export outputs a text file. Need to implement:
- **PDF export** using jsPDF + html2canvas (or Puppeteer serverless for higher quality)
- **DOCX export** using the `docx` npm package
- Both must apply the user's brand (logo, colors, business name)

### Phase 3 — Real Transcription
The prototype uses a hardcoded demo transcript. Need to wire up:
- Loom API for transcript fetching (serverless function)
- Deepgram or Whisper for uploaded video transcription (serverless function)
- The AI extraction already calls Claude's real API

### Phase 4 — Payment & Deploy
- LemonSqueezy or Stripe for one-time Pro purchase
- Deploy to Vercel
- Connect to shinebrightvirtual.com

## Design System
- **Font**: DM Sans (Google Fonts)
- **Primary**: #1B3A4B (deep teal-navy)
- **Accent**: #E8985E (warm copper)
- **Background**: #F7F5F0 (warm paper)
- **Cards**: White, 16px radius, subtle shadow
- **Vibe**: Warm, professional, approachable — not corporate or cold

## Tech Stack
- React 18 + Vite
- No CSS framework — inline styles (matches prototype)
- Serverless functions for API calls (Vercel API routes)
- `docx` package for Word export, `jspdf` for PDF export

## Important Notes
- API keys must NEVER be in frontend code in production
- The AI extraction prompt is in `docs/AI_PROMPT.md` — tune it as needed
- The SOP framework (sections, fields, labels) lives in `src/lib/sections.js` — this is the single source of truth
- Export documents should look polished and professional — this is a paid product
