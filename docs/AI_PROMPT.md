# AI SOP Extraction Prompt

This is the prompt sent to Claude's API to extract structured SOP data from a video transcript.

## System Prompt

```
You are an SOP extraction tool for the Shine Bright SOP Generator. Your job is to
analyze a transcript of someone explaining or demonstrating a business process and
extract it into a structured SOP format.

You must respond ONLY with a JSON object — no markdown backticks, no preamble, no
explanation. Just the raw JSON.
```

## User Prompt Template

```
Given this transcript of someone explaining a process, extract structured SOP data.

Respond ONLY with a JSON object (no markdown, no backticks, no preamble) matching
this exact structure. For arrays of strings, provide 2-4 items. For "steps" provide
objects with "what", "tools", "time" keys. For "flowSteps" provide 5-7 string items.

{
  "overview": {
    "sopTitle": "",
    "category": "",
    "owner": "",
    "executor": "",
    "frequency": ""
  },
  "whyItMatters": {
    "problemSolved": "",
    "desiredOutcome": "",
    "riskOfSkipping": ""
  },
  "triggers": {
    "trigger": "",
    "completion": "",
    "prerequisites": "",
    "downstream": ""
  },
  "bigPicture": {
    "flowSteps": ["", "", "", "", ""]
  },
  "detailedSteps": {
    "steps": [
      { "what": "", "tools": "", "time": "" }
    ]
  },
  "decisions": {
    "independentDecisions": "",
    "approvalRequired": "",
    "missingInfo": "",
    "escalationContact": ""
  },
  "doneRight": {
    "completionCriteria": "",
    "qualityChecklist": ["", ""],
    "commonMistakes": ["", ""]
  },
  "aiAutomation": {
    "aiUsage": "",
    "aiGuardrails": "",
    "humanReview": "",
    "connectedTools": ""
  },
  "evolution": {
    "metrics": "",
    "reviewer": "",
    "feedbackProcess": "",
    "revisionTriggers": ""
  }
}

Rules:
- Category must be one of: Operations, Client Experience, Marketing, Finance, Team
- Frequency must be one of: One-time, Daily, Weekly, Bi-weekly, Monthly, Quarterly, Annually, Triggered by event
- Fill in every field with intelligent suggestions based on the transcript
- If something isn't explicitly mentioned, make a reasonable inference based on context
- For the "Why This Matters" section, think about WHY someone would document this process
- For "Decisions & Escalation", identify any conditional logic or decision points mentioned
- For "Done Right Checklist", infer quality standards from what the speaker emphasizes
- For "AI & Automation", suggest where AI tools could realistically help this process
- Keep language clear, professional, and actionable
- Each detailed step should be specific enough that someone unfamiliar could follow it

Transcript:
{TRANSCRIPT_TEXT}
```

## Quality Notes

The prompt is designed to:
1. **Fill all fields** — even if the transcript doesn't explicitly cover a section, the AI infers reasonable content
2. **Match exact enum values** — category and frequency are constrained to valid options
3. **Return clean JSON** — no markdown formatting, no code fences
4. **Be actionable** — the output should read like a real SOP, not a summary of a video

## Improving Extraction Quality

Things to iterate on:
- Add examples of good vs. bad extractions to the prompt (few-shot)
- For longer transcripts (>10 min), consider chunking or summarizing first
- Consider a two-pass approach: first extract raw facts, then structure into SOP format
- Add a "confidence" field to each section so the UI can highlight low-confidence areas for user review
- Test with different types of processes (creative, technical, administrative) and tune accordingly

## Cost Estimate

Using Claude Sonnet at ~$3/M input tokens and ~$15/M output tokens:
- Average transcript: ~1,500 words ≈ 2,000 tokens input
- SOP output: ~800 words ≈ 1,000 tokens output
- Cost per SOP extraction: ~$0.02
- At 1,000 users/month: ~$20/month in API costs
