// Vercel serverless — Ajánlat generálás + lekérés
// POST /api/proposal   → létrehoz egy ajánlatot, elmenti GitHub-ra, visszaadja az ID-t
// GET  /api/proposal?id=xxx → visszaadja az ajánlat adatait

const CONTACT = {
  phone:     "+36 30 148 0917",
  phoneRaw:  "+36301480917",
  email:     "richard.kormendi@gmail.com",
  web:       "richardkormendi.com",
  instagram: "https://www.instagram.com/rickormendi/",
};

// ── Szolgáltatás + ár logika ─────────────────────────────────────────────────
function buildServices(mobileScore, desktopScore, checks) {
  const noHttps    = checks.https === false;
  const bigGap     = (desktopScore - mobileScore) > 30;
  const mobileSlow = mobileScore < 40;
  const needNew    = mobileScore < 25;

  const services = [];

  if (noHttps) {
    services.push({
      key: "https",
      title: "HTTPS — Biztonságos kapcsolat",
      desc: "SSL tanúsítvány telepítése és beállítása. Megszűnik a \"Nem biztonságos\" figyelmeztetés minden böngészőben.",
      price: 35000,
      optional: false,
    });
  }

  if (needNew) {
    services.push({
      key: "new_site",
      title: "Új, modern weboldal",
      desc: "Az oldal jelenlegi állapota miatt az újraépítés gazdaságosabb, mint a javítgatás. Mobilbarát, gyors, modern design.",
      price: 250000,
      optional: false,
    });
  } else if (mobileSlow && bigGap) {
    services.push({
      key: "speed_mobile",
      title: "Sebesség + mobiloptimalizálás csomag",
      desc: "Képoptimalizálás, kódtömörítés, mobilbarát elrendezés javítása. Cél: 70+ pont mobilon (jelenlegi: " + mobileScore + "/100).",
      price: 130000,
      optional: false,
    });
  } else if (mobileSlow) {
    services.push({
      key: "speed",
      title: "Sebességoptimalizálás",
      desc: "Képoptimalizálás, kódtömörítés, gyorsítótárazás beállítása. Cél: 70+ pont mobilon (jelenlegi: " + mobileScore + "/100).",
      price: 80000,
      optional: false,
    });
  }

  // Analytics — ha nincs, mindig ajánljuk
  if (checks.hasAnalytics === false) {
    services.push({
      key: "analytics",
      title: "Google Analytics telepítés",
      desc: "Látogatásmérés beállítása — láthatóvá válik hányan és honnan érkeznek az oldalra.",
      price: 15000,
      optional: false,
    });
  }

  // Havi karbantartás — mindig felajánljuk
  services.push({
    key: "maintenance",
    title: "Havi karbantartás + teljesítményriport",
    desc: "Havonta egyoldalas összefoglaló: forgalom, sebesség, Google helyezés. Bármikor lemondható.",
    price: 15000,
    monthly: true,
    optional: true,
  });

  const total = services.filter(s => !s.optional).reduce((sum, s) => sum + s.price, 0);
  return { services, total };
}

// ── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

  // ── GET: proposal lekérése raw GitHub-ról ───────────────────────────────
  if (req.method === "GET") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Missing id" });

    try {
      const raw = await fetch(
        `https://raw.githubusercontent.com/rickcircle/richard-kormendi-site/main/content/proposals/${id}.json`,
        GITHUB_TOKEN ? { headers: { Authorization: `Bearer ${GITHUB_TOKEN}` } } : {}
      );
      if (!raw.ok) return res.status(404).json({ error: "Proposal not found" });
      const data = await raw.json();
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── POST: proposal létrehozása ───────────────────────────────────────────
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  if (!GITHUB_TOKEN) return res.status(500).json({ error: "No GitHub token" });

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const { url, mobileScore, desktopScore, checks = {} } = body;
  if (!url || mobileScore == null || desktopScore == null) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const now      = new Date();
  const dateStr  = now.toISOString().split("T")[0];
  const timeStr  = now.getHours().toString().padStart(2, "0") + now.getMinutes().toString().padStart(2, "0");
  const domain   = url.replace(/^https?:\/\//, "").replace(/[^a-z0-9]/gi, "-").toLowerCase().slice(0, 40);
  const id       = `${dateStr}-${timeStr}-${domain}`;

  const { services, total } = buildServices(mobileScore, desktopScore, checks);

  const proposal = {
    id, url, mobileScore, desktopScore, checks,
    pageTitle: checks.pageTitle || domain,
    date: now.toISOString(),
    services, total,
    contact: CONTACT,
  };

  const content = Buffer.from(JSON.stringify(proposal, null, 2)).toString("base64");

  try {
    const ghRes = await fetch(
      `https://api.github.com/repos/rickcircle/richard-kormendi-site/contents/content/proposals/${id}.json`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
          "User-Agent": "richard-kormendi-site",
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({ message: `proposal: ${url}`, content }),
      }
    );

    if (!ghRes.ok) {
      const err = await ghRes.json().catch(() => ({}));
      return res.status(500).json({ error: "GitHub write failed", detail: err?.message });
    }

    return res.status(200).json({ ok: true, id, path: `/proposal/${id}` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
