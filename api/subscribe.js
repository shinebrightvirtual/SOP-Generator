export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Missing email" });

  const apiKey = process.env.MAILERLITE_API_KEY;
  if (!apiKey) {
    // Not configured — fail silently so it doesn't break the export flow
    return res.status(200).json({ ok: false, reason: "not_configured" });
  }

  const body = { email };

  // If a group ID is set, add them to that specific list
  const groupId = process.env.MAILERLITE_GROUP_ID;
  if (groupId) {
    body.groups = [groupId];
  }

  const response = await fetch("https://connect.mailerlite.com/api/subscribers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "Accept": "application/json",
    },
    body: JSON.stringify(body),
  });

  // 200 = updated existing, 201 = new subscriber — both are success
  if (response.ok) {
    return res.status(200).json({ ok: true });
  }

  const err = await response.json().catch(() => ({}));
  console.error("MailerLite error:", err);
  // Return 200 anyway — don't block the export if this fails
  return res.status(200).json({ ok: false, reason: err.message });
}
