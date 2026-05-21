// Vercel serverless function — Mailchimp feliratkozó hozzáadása
// Env vars szükségesek (Vercel Dashboard → Settings → Environment Variables):
//   MAILCHIMP_API_KEY  — pl. abc123def456-us21
//   MAILCHIMP_LIST_ID  — Audience ID, pl. a1b2c3d4e5

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email" });
  }

  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;

  if (!apiKey || !listId) {
    console.error("Missing MAILCHIMP_API_KEY or MAILCHIMP_LIST_ID env vars");
    return res.status(500).json({ error: "Server misconfigured" });
  }

  // A szerver prefix az API key végéből jön: pl. "abc123-us21" → "us21"
  const serverPrefix = apiKey.split("-").pop();
  const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}`,
      },
      body: JSON.stringify({
        email_address: email,
        status: "subscribed",
      }),
    });

    const data = await response.json();

    // Már feliratkozott — ez sem hiba a felhasználónak
    if (data.status === 400 && data.title === "Member Exists") {
      return res.status(200).json({ success: true, alreadySubscribed: true });
    }

    if (!response.ok) {
      console.error("Mailchimp error:", data);
      return res.status(400).json({ error: data.detail || "Subscription failed" });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
