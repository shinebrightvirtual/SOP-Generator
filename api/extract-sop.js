import { SECTIONS, SECTION_ORDER } from "../src/lib/sections.js";

function buildPrompt(transcript) {
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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { transcript } = req.body;
  if (!transcript) {
    return res.status(400).json({ error: "Missing transcript" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: buildPrompt(transcript) }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    return res.status(500).json({ error: `Claude API error: ${err}` });
  }

  const result = await response.json();
  const text = result.content.map(c => c.text || "").join("");
  const clean = text.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(clean);
    if (parsed.detailedSteps?.steps) {
      let stepId = 0;
      parsed.detailedSteps.steps = parsed.detailedSteps.steps.map(s => ({
        ...s,
        id: `ai-step-${++stepId}`,
      }));
    }
    return res.status(200).json(parsed);
  } catch {
    return res.status(500).json({ error: "Failed to parse AI response" });
  }
}
