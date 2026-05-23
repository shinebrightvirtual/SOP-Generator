export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "Video transcription isn't set up yet. Add a DEEPGRAM_API_KEY to your Vercel environment variables to enable this feature.",
    });
  }

  // Read raw video bytes from request body
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);

  if (!buffer.length) {
    return res.status(400).json({ error: "No file received." });
  }

  // Content-type is the video's actual MIME type (set by the frontend)
  const contentType = req.headers["content-type"] || "video/mp4";

  const response = await fetch(
    "https://api.deepgram.com/v1/listen?punctuate=true&paragraphs=true&model=nova-2",
    {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": contentType,
      },
      body: buffer,
    }
  );

  if (!response.ok) {
    const err = await response.text();
    console.error("Deepgram error:", err);
    return res.status(500).json({ error: `Transcription failed: ${err}` });
  }

  const result = await response.json();
  const transcript =
    result.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

  if (!transcript) {
    return res.status(422).json({ error: "No speech detected in the video. Make sure the recording has clear audio." });
  }

  return res.status(200).json({ transcript });
}
