# Deployment Guide

## Recommended Stack

| Layer | Tool | Why |
|-------|------|-----|
| Frontend | Vite + React | Fast, modern, great DX |
| Hosting | Vercel | Free tier, serverless functions built in, easy custom domains |
| AI API | Anthropic Claude (Sonnet) | Best quality for structured extraction, ~$0.02/SOP |
| Transcription (Loom) | Loom Developer API | Direct transcript access for Loom videos |
| Transcription (uploads) | Deepgram or Whisper API | Fast, accurate, affordable |
| PDF Export | jsPDF + html2canvas (client) or Puppeteer (server) | Client-side is simpler; server-side is higher quality |
| DOCX Export | `docx` npm package | Full programmatic control over Word docs |
| Payments | LemonSqueezy or Stripe | LemonSqueezy is simpler for digital products |
| Database (optional) | Supabase | Free tier, handles auth + data if needed |

---

## Step-by-Step Deployment

### 1. Initialize the Project

```bash
npm create vite@latest shine-bright-sop -- --template react
cd shine-bright-sop
npm install
```

### 2. Install Dependencies

```bash
# Core
npm install docx file-saver jspdf html2canvas

# Optional but recommended
npm install @anthropic-ai/sdk    # If using the official SDK
```

### 3. Set Up Serverless Functions (Vercel)

Create `api/` directory for serverless functions:

```
api/
├── extract-sop.js       # Claude API: transcript → SOP JSON
├── transcribe-loom.js   # Fetch transcript from Loom API
└── transcribe-video.js  # Send uploaded video to Deepgram/Whisper
```

Example `api/extract-sop.js`:
```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { transcript } = req.body;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: `...prompt with ${transcript}...` }],
    }),
  });

  const data = await response.json();
  res.json(data);
}
```

### 4. Environment Variables (Vercel Dashboard)

```
ANTHROPIC_API_KEY=sk-ant-...
LOOM_API_KEY=...
DEEPGRAM_API_KEY=...
LEMONSQUEEZY_API_KEY=...  (if using LemonSqueezy)
```

### 5. Domain Setup

**Option A — Subdirectory** (recommended for SEO):
- Deploy to Vercel
- Configure `shinebrightvirtual.com/sop-generator` via reverse proxy or Vercel rewrites

**Option B — Subdomain**:
- Point `tools.shinebrightvirtual.com` to Vercel
- Add CNAME record in DNS

### 6. Payment Integration

**LemonSqueezy** (simplest):
1. Create product in LemonSqueezy dashboard ($47–$97 one-time)
2. Use their checkout overlay or hosted page
3. On successful purchase, receive webhook → store license
4. Frontend checks license key in localStorage

**Stripe** (more control):
1. Create Stripe Checkout session
2. Redirect to payment
3. Webhook confirms payment → issue access
4. Store in Supabase or check Stripe customer status

---

## Production Checklist

- [ ] All API keys in environment variables (never in frontend code)
- [ ] Serverless functions for all external API calls
- [ ] Error handling for API failures (Loom, transcription, Claude)
- [ ] Rate limiting on serverless functions
- [ ] Loading states for all async operations
- [ ] Mobile responsive (test on phone)
- [ ] Export quality checked — PDF and DOCX both look professional
- [ ] Payment flow tested end-to-end
- [ ] Custom domain connected and SSL working
- [ ] Analytics set up (Plausible or Simple Analytics recommended — privacy-friendly)
- [ ] Meta tags / OG image for social sharing
- [ ] Favicon and app icon

---

## Cost Breakdown (Monthly)

| Item | Free Tier | At Scale (1,000 users/mo) |
|------|-----------|--------------------------|
| Vercel hosting | $0 | $0 (Pro at $20/mo if needed) |
| Claude API | $0 | ~$20/mo |
| Deepgram | $0 (first 200 hrs) | ~$15/mo |
| Loom API | $0 | $0 (transcript fetching) |
| LemonSqueezy | 5% + $0.50/txn | ~$250/mo on $5K revenue |
| **Total overhead** | **$0** | **~$285/mo** |

At $67 average price × 1,000 Pro conversions/mo = $67,000 revenue → $285 costs = 99.6% margin.

Even at 50 Pro conversions/mo = $3,350 revenue → ~$35 costs. Very healthy.
