// Vercel serverless proxy — Google PageSpeed Insights API
// maxDuration: 60s (vercel.json-ban konfigurálva)

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  const PAGESPEED = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

  const fetchWithTimeout = async (fetchUrl, timeoutMs = 25000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(fetchUrl, { signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  };

  try {
    // Egymás után hívjuk (nem párhuzamosan), hogy ne timeout-oljon
    const mobileRes = await fetchWithTimeout(
      `${PAGESPEED}?url=${encodeURIComponent(url)}&strategy=mobile`
    );
    if (!mobileRes.ok) {
      const err = await mobileRes.json().catch(() => ({}));
      console.error("Mobile API error:", err);
      return res.status(502).json({ error: "PageSpeed API error (mobile)", detail: err });
    }
    const mobile = await mobileRes.json();

    const desktopRes = await fetchWithTimeout(
      `${PAGESPEED}?url=${encodeURIComponent(url)}&strategy=desktop`
    );
    if (!desktopRes.ok) {
      const err = await desktopRes.json().catch(() => ({}));
      console.error("Desktop API error:", err);
      return res.status(502).json({ error: "PageSpeed API error (desktop)", detail: err });
    }
    const desktop = await desktopRes.json();

    res.setHeader("Cache-Control", "s-maxage=300");
    return res.status(200).json({ mobile, desktop });
  } catch (err) {
    console.error("PageSpeed proxy error:", err.message);
    return res.status(500).json({ error: "Server error", detail: err.message });
  }
}
