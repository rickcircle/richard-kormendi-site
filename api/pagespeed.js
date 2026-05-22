// Vercel serverless proxy — Google PageSpeed Insights API
// Azért kell proxy, hogy elkerüljük a böngésző CORS korlátait
// Ingyenes, API key nem szükséges

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  const PAGESPEED = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

  try {
    const [mobileRes, desktopRes] = await Promise.all([
      fetch(`${PAGESPEED}?url=${encodeURIComponent(url)}&strategy=mobile`),
      fetch(`${PAGESPEED}?url=${encodeURIComponent(url)}&strategy=desktop`),
    ]);

    if (!mobileRes.ok || !desktopRes.ok) {
      return res.status(502).json({ error: "PageSpeed API error" });
    }

    const [mobile, desktop] = await Promise.all([mobileRes.json(), desktopRes.json()]);

    res.setHeader("Cache-Control", "s-maxage=300"); // 5 perc cache
    return res.status(200).json({ mobile, desktop });
  } catch (err) {
    console.error("PageSpeed proxy error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
