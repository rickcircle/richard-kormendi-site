// Vercel serverless — Audit Log mentése GitHub repóba
// Minden audit futtatáskor létrehoz egy .md fájlt a content/audits/ mappában
// A Decap CMS admin felületen látható lesz az Audit Log menüpontban

const ISSUE_HUMAN = {
  "render-blocking-resources":  "Bizonyos fájlok blokkolják az oldal megjelenését",
  "unused-javascript":          "Felesleges JavaScript kód lassítja az oldalt",
  "unused-css-rules":           "Felesleges stíluslap-kód terheli az oldalt",
  "uses-optimized-images":      "A képek nincsenek optimalizálva",
  "uses-webp-images":           "A képek régi formátumban vannak (WebP javasolt)",
  "uses-text-compression":      "A szövegfájlok nincsenek tömörítve a szerveren",
  "offscreen-images":           "Képek töltődnek le mielőtt láthatók lennének",
  "uses-responsive-images":     "Mobilon is nagy méretű képek töltődnek le",
  "efficient-animated-content": "Az animált képek (GIF) túl nagy méretűek",
  "uses-rel-preconnect":        "Külső szolgáltatások lassítják az oldalt",
  "uses-long-cache-ttl":        "A böngésző nem gyorsítótárazza az elemeket",
  "dom-size":                   "Az oldal HTML struktúrája túl bonyolult",
  "mainthread-work-breakdown":  "JavaScript túlterheli a böngészőt",
};

function analyzeFixability(mobileScore, desktopScore, issues) {
  const criticalCount = issues.filter(i => (i.score || 0) < 0.5).length;
  const hasDeepIssues = issues.some(
    i => ["dom-size", "mainthread-work-breakdown"].includes(i.key) && (i.score || 0) < 0.5
  );
  const bigGap = (desktopScore - mobileScore) > 30; // valószínűleg nem reszponzív
  const contactWorthy = mobileScore < 70 || bigGap;

  if (mobileScore < 25 && criticalCount >= 4 && hasDeepIssues) {
    return {
      label: "⚠️ Új oldalt javaslunk",
      hours: null,
      reason: "Mély strukturális problémák vannak. Az újraépítés jobban megéri, mint a javítgatás.",
      contactWorthy: true,
      contactNote: "📞 ÉRDEMES MEGKERESNI — új oldal lehetséges",
      clientMessage: "Szia! Megnéztem az önök weboldalát, és sajnos komoly technikai problémákat látok — mobilon szinte használhatatlan. Ennél a szintnél egy modern új oldal jobban megéri, mint a javítgatás, és az ár általában nem akkora, mint gondolnák. Ha érdekel, szívesen átbeszéljük a lehetőségeket.",
    };
  }
  if (bigGap && mobileScore >= 50) {
    return {
      label: "✅ Megcsináljuk — mobilbarátosítás",
      hours: "5–10 óra",
      reason: "Az oldal asztali gépen rendben van, de mobilon nem megfelelően jelenik meg.",
      contactWorthy: true,
      contactNote: "📞 ÉRDEMES MEGKERESNI — mobilbarátosítás kell",
      clientMessage: "Szia! Megnéztem az önök weboldalát — asztali gépen rendben van, de mobilon nehézkes a használata. Ma már az érdeklődők nagy része telefonon keres, és egy nem mobilbarát oldal sok érdeklődőt eltérít. Pár fejlesztéssel könnyen orvosolható. Ha érdekel, szívesen megmutatom.",
    };
  }
  if (mobileScore < 40 && criticalCount >= 3) {
    return {
      label: "✅ Megcsináljuk — nagyobb munka",
      hours: "15–25 óra",
      reason: "Több kritikus probléma van, amelyek kód szintű beavatkozást igényelnek.",
      contactWorthy: true,
      contactNote: "📞 ÉRDEMES MEGKERESNI — 15–25 óra",
      clientMessage: "Szia! Ránéztem az önök weboldalára, és azt látom, hogy mobilon nehézkesen tölt be és használható. Ma már az ügyfelek nagy része telefonon keres — ha az oldal lassan tölt be, sokan inkább továbblépnek. Ez megoldható, általában pár héten belül érezhető a javulás. Ha kíváncsi rá, szívesen átbeszéljük.",
    };
  }
  if (mobileScore < 70) {
    return {
      label: "✅ Megcsináljuk — közepes munka",
      hours: "5–15 óra",
      reason: "Van néhány javítandó pont, de az alap rendben van.",
      contactWorthy: true,
      contactNote: "📞 ÉRDEMES MEGKERESNI — 5–15 óra",
      clientMessage: "Szia! Megnéztem az önök weboldalát — az alap rendben van, de mobilon van néhány lassító tényező. Néhány fejlesztéssel gyorsabb és könnyebben megtalálható lehetne Google-ban is. Ha érdekel, szívesen megmutatom mi kellene hozzá.",
    };
  }
  return {
    label: "✅ Kisebb finomhangolás",
    hours: "2–5 óra",
    reason: "Az oldal jól teljesít, kisebb finomhangolás elegendő.",
    contactWorthy: false,
    contactNote: "⏭ KIHAGYHATÓ — az oldal jól teljesít",
    clientMessage: null,
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const { url, mobileScore, desktopScore, issues = [] } = body;
  if (!url || mobileScore == null || desktopScore == null) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) {
    console.warn("GITHUB_TOKEN nincs beállítva — audit log kihagyva");
    return res.status(200).json({ ok: false, reason: "no token" });
  }

  const analysis = analyzeFixability(mobileScore, desktopScore, issues);

  // Fájlnév: 2026-05-22-1430-pelda-hu.md
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = now.getHours().toString().padStart(2, "0") + now.getMinutes().toString().padStart(2, "0");
  const domain = url.replace(/^https?:\/\//, "").replace(/[^a-z0-9]/gi, "-").toLowerCase().slice(0, 40);
  const filename = `${dateStr}-${timeStr}-${domain}.md`;

  const mobileEmoji  = mobileScore  >= 90 ? "🟢" : mobileScore  >= 50 ? "🟡" : "🔴";
  const desktopEmoji = desktopScore >= 90 ? "🟢" : desktopScore >= 50 ? "🟡" : "🔴";

  const topIssuesText = issues.slice(0, 5)
    .map(i => `- ${ISSUE_HUMAN[i.key] || i.key}`)
    .join("\n");

  const markdownContent = `---
url: "${url}"
date: "${now.toISOString()}"
mobile_score: ${mobileScore}
desktop_score: ${desktopScore}
fixable_label: "${analysis.label}"
fixable_hours: "${analysis.hours || "—"}"
fixable_reason: "${analysis.reason}"
contact_worthy: ${analysis.contactWorthy}
contact_note: "${analysis.contactNote}"
---

# Audit: ${url}

**Dátum:** ${now.toLocaleDateString("hu-HU")} ${now.toLocaleTimeString("hu-HU", { hour: "2-digit", minute: "2-digit" })}

## ${analysis.contactNote}

## Pontszámok

| | Pontszám |
|---|---|
| ${mobileEmoji} Mobil | **${mobileScore}/100** |
| ${desktopEmoji} Asztali | **${desktopScore}/100** |

## Értékelés

### ${analysis.label}

${analysis.reason}

${analysis.hours ? `⏱️ **Becsült munkaidő: ${analysis.hours}**` : ""}

## Fő problémák (mobilon)

${topIssuesText || "Nem volt azonosítható probléma — jól néz ki!"}
${analysis.clientMessage ? `
## 📋 Másolható üzenet az ügyfélnek

${analysis.clientMessage}
` : ""}
`;

  const content = Buffer.from(markdownContent).toString("base64");

  try {
    const githubRes = await fetch(
      `https://api.github.com/repos/rickcircle/richard-kormendi-site/contents/content/audits/${filename}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
          "User-Agent": "richard-kormendi-site-audit",
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          message: `audit: ${url} — 📱 ${mobileScore} / 🖥 ${desktopScore}`,
          content,
        }),
      }
    );

    if (!githubRes.ok) {
      const err = await githubRes.json().catch(() => ({}));
      console.error("GitHub API hiba:", JSON.stringify(err));
      return res.status(500).json({ error: "GitHub írás sikertelen", detail: err?.message });
    }

    return res.status(200).json({ ok: true, analysis });
  } catch (err) {
    console.error("Notify hiba:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
