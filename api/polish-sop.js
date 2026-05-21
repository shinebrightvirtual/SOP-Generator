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

  // Build a compact representation of only the text fields that need polishing
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

  const prompt = `You're helping a small business owner polish their process notes into a professional SOP document.

Lightly clean up the text fields below — fix grammar, complete fragments, and make things read clearly. Keep it warm and human, NOT corporate or robotic. Preserve the person's voice and all their specific details. Don't add information, don't remove specifics, don't over-explain.

Return ONLY a valid JSON object with the same structure as the input (same section IDs and field keys), with the text values polished.

Input:
${JSON.stringify(fieldsToPolish, null, 2)}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
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
    const polished = JSON.parse(clean);
    // Merge polished text back into the original data (preserving arrays/objects)
    const merged = {};
    for (const sectionId of sectionKeys) {
      merged[sectionId] = { ...(data[sectionId] || {}), ...(polished[sectionId] || {}) };
    }
    return res.status(200).json({ data: merged });
  } catch {
    // If parse fails, return original data unmodified
    return res.status(200).json({ data });
  }
}
