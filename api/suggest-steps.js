export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { title, category, steps } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not configured" });

  const existingSteps = (steps || []).filter(s => s && s.trim()).join("\n");

  const prompt = `A small business owner is documenting a process called "${title || "this process"}"${category ? ` (category: ${category})` : ""}.

Their current high-level steps are:
${existingSteps || "(none yet)"}

Are there any commonly important steps that are missing from this process? Suggest 2-4 steps they might have forgotten to include. Keep suggestions short (one sentence each), practical, and specific to this type of process.

Return ONLY a JSON array of strings, like: ["Step suggestion one", "Step suggestion two"]
No explanation, no markdown, just the JSON array.`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) return res.status(500).json({ suggestions: [] });

  const result = await response.json();
  const text = result.content.map(c => c.text || "").join("").replace(/```json|```/g, "").trim();

  try {
    const suggestions = JSON.parse(text);
    return res.status(200).json({ suggestions: Array.isArray(suggestions) ? suggestions : [] });
  } catch {
    return res.status(200).json({ suggestions: [] });
  }
}
