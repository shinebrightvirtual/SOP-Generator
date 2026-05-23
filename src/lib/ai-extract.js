/**
 * AI SOP Extraction
 *
 * Sends a transcript to Claude API and returns structured SOP data.
 * In production, this should call a serverless function (not the API directly)
 * to keep the API key secure.
 */

import { SECTIONS, SECTION_ORDER } from "./sections.js";

/**
 * Build the extraction prompt from a transcript
 */
function buildPrompt(transcript) {
  // Build the expected JSON structure from section definitions
  const structure = {};
  SECTION_ORDER.forEach((key) => {
    const sec = SECTIONS[key];
    structure[key] = {};
    sec.fields.forEach((field) => {
      if (field.type === "steplist") {
        structure[key][field.key] = ["", "", "", "", ""];
      } else if (field.type === "detailedsteps") {
        structure[key][field.key] = [{ what: "", tools: "", time: "" }];
      } else if (field.type === "bulletlist") {
        structure[key][field.key] = ["", ""];
      } else {
        structure[key][field.key] = "";
      }
    });
  });

  return `Given this transcript of someone explaining a process, extract structured SOP data.

Respond ONLY with a JSON object (no markdown, no backticks, no preamble) matching this exact structure:

${JSON.stringify(structure, null, 2)}

Rules:
- Category must be one of: Operations, Client Experience, Marketing, Finance, Team
- Frequency must be one of: One-time, Daily, Weekly, Bi-weekly, Monthly, Quarterly, Annually, Triggered by event
- Fill in every field with intelligent suggestions based on the transcript
- If something isn't explicitly mentioned, make a reasonable inference
- Keep language clear, professional, and actionable
- Each detailed step should be specific enough that someone unfamiliar could follow it

Transcript:
${transcript}`;
}

/**
 * Extract SOP data from a transcript using Claude API.
 *
 * DEVELOPMENT: calls API directly (requires VITE_ANTHROPIC_API_KEY)
 * PRODUCTION: should call /api/extract-sop serverless function instead
 */
export async function extractSOPFromTranscript(transcript) {
  const isDev = import.meta.env.DEV;
  const prompt = buildPrompt(transcript);

  let responseData;

  if (isDev) {
    // Development: call API directly (API key in env)
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Missing VITE_ANTHROPIC_API_KEY in .env — needed for development"
      );
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    responseData = await response.json();
  } else {
    // Production: call serverless function
    const response = await fetch("/api/extract-sop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });

    responseData = await response.json();
  }

  let parsed;

  if (isDev) {
    // Dev: responseData is raw Claude API response — extract text and parse JSON
    const text = responseData.content
      .map((item) => item.text || "")
      .join("\n");
    const clean = text.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(clean);

    // Add IDs to detailed steps
    if (parsed.detailedSteps?.steps) {
      let stepId = 0;
      parsed.detailedSteps.steps = parsed.detailedSteps.steps.map((s) => ({
        ...s,
        id: `ai-step-${++stepId}`,
      }));
    }
  } else {
    // Production: serverless function already parsed and returned the SOP object
    if (responseData.error) {
      throw new Error(responseData.error);
    }
    parsed = responseData;
  }

  return parsed;
}
