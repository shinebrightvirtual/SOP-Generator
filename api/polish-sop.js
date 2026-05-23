import { SECTIONS } from "../src/lib/sections.js";

const SKIP_PARAGRAPHS = new Set(["overview", "bigPicture", "detailedSteps"]);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { data, sectionKeys } = req.body;
  if (!data || !sectionKeys) {
    return res.status(400).json({ error: "Missing data or sectionKeys" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  // ── Step 1: Polish individual field values ──────────────────────────────────
  const fieldsToPolish = {};
  for (const sectionId of sectionKeys) {
    const sData = data[sectionId];
    if (!sData) continue;
    for (const [key, value] of Object.entries(sData)) {
      if (typeof value === "string" && value.trim().length > 0) {
        if (!fieldsToPolish[sectionId]) fieldsToPolish[sectionId] = {};
        fieldsToPolish[sectionId][key] = value;
      }
    }
  }

  const polishPrompt = `You're helping a small business owner polish their process notes into a professional SOP document.

Lightly clean up the text fields below — fix grammar, complete fragments, and make things read clearly. Keep it warm and human, NOT corporate or robotic. Preserve the person's voice and all their specific details. Don't add information, don't remove specifics, don't over-explain.

Return ONLY a valid JSON object with the same structure as the input (same section IDs and field keys), with the text values polished.

Input:
${JSON.stringify(fieldsToPolish, null, 2)}`;

  const polishResponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: polishPrompt }],
    }),
  });

  let merged = {};
  if (polishResponse.ok) {
    const polishResult = await polishResponse.json();
    const polishText = polishResult.content.map(c => c.text || "").join("");
    const polishClean = polishText.replace(/```json|```/g, "").trim();
    try {
      const polished = JSON.parse(polishClean);
      for (const sectionId of sectionKeys) {
        merged[sectionId] = { ...(data[sectionId] || {}), ...(polished[sectionId] || {}) };
      }
    } catch {
      for (const sectionId of sectionKeys) {
        merged[sectionId] = data[sectionId] || {};
      }
    }
  } else {
    for (const sectionId of sectionKeys) {
      merged[sectionId] = data[sectionId] || {};
    }
  }

  // ── Step 2: Convert Q&A sections to flowing paragraphs ──────────────────────
  const sectionsForParagraphs = {};
  for (const sectionId of sectionKeys) {
    if (SKIP_PARAGRAPHS.has(sectionId)) continue;
    const sec = SECTIONS[sectionId];
    if (!sec) continue;
    const sData = merged[sectionId];
    if (!sData) continue;

    const labeledFields = {};
    for (const field of sec.fields) {
      if (field.type === "checkbox") continue;
      if (field.conditional && !sData[field.conditional]) continue;
      const val = sData[field.key];
      if (!val) continue;
      if (typeof val === "string" && val.trim()) {
        labeledFields[field.label] = val.trim();
      } else if (Array.isArray(val)) {
        const items = val.filter(v => typeof v === "string" && v.trim());
        if (items.length) labeledFields[field.label] = items.join("; ");
      }
    }

    if (Object.keys(labeledFields).length > 0) {
      sectionsForParagraphs[sectionId] = labeledFields;
    }
  }

  let paragraphs = {};

  if (Object.keys(sectionsForParagraphs).length > 0) {
    const paraPrompt = `A small business owner has filled out sections of an SOP. For each section, take all their answers and write them as a single flowing paragraph.

Rules:
- Connect the answers naturally into coherent prose — do not list them
- Keep their specific details and voice — warm and human, not corporate
- Do not include question labels in the output
- Write as if describing the process, not answering questions

Return ONLY a valid JSON object where each key is the section ID and the value is the paragraph text.

Sections:
${JSON.stringify(sectionsForParagraphs, null, 2)}`;

    const paraResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4096,
        messages: [{ role: "user", content: paraPrompt }],
      }),
    });

    if (paraResponse.ok) {
      const paraResult = await paraResponse.json();
      const paraText = paraResult.content.map(c => c.text || "").join("");
      const paraClean = paraText.replace(/```json|```/g, "").trim();
      try {
        paragraphs = JSON.parse(paraClean);
      } catch {
        paragraphs = {};
      }
    }
  }

  return res.status(200).json({ data: merged, paragraphs });
}
