import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, sopTitle, format, fileData } = req.body;

  if (!email || !fileData) {
    return res.status(400).json({ error: "Missing email or file data" });
  }

  const safeName = (sopTitle || "SOP").replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "_");
  const filename = `SOP_${safeName}.${format}`;
  const contentType = format === "pdf"
    ? "application/pdf"
    : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  try {
    await resend.emails.send({
      from: "Shine Bright Virtual <hello@shinebrightvirtual.com>",
      to: email,
      subject: `Your SOP is ready: ${sopTitle || "Standard Operating Procedure"}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #333;">
          <div style="background: #2D3526; padding: 24px 32px; border-radius: 8px 8px 0 0;">
            <div style="font-size: 18px; font-weight: 700; color: #fff;">
              <span style="color: #C49A3C;">Shine Bright</span> SOP Generator
            </div>
          </div>
          <div style="background: #fff; padding: 32px; border: 1px solid #e8e5e0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="margin: 0 0 16px; font-size: 22px; color: #2D3526;">Here's your SOP!</h2>
            <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.6; color: #555;">
              Your <strong>${sopTitle || "SOP"}</strong> is done. It's attached - save it, share it with whoever needs it, or drop it straight into your systems.
            </p>
            <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #555;">
              If something changes or you want to update it,
              <a href="https://tools.shinebrightvirtual.com" style="color: #C49A3C; text-decoration: none; font-weight: 600;">head back and rebuild it</a>
              anytime.
            </p>
            <div style="border-top: 1px solid #e8e5e0; padding-top: 20px; font-size: 13px; color: #999;">
              Sent by <a href="https://shinebrightvirtual.com" style="color: #C49A3C; text-decoration: none;">Shine Bright Virtual</a>
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          filename,
          content: fileData,
        },
      ],
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Resend error:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
}
