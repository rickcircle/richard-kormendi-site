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

function clientMsg(noHttps, noPhoneLink, noMetaDesc, bigGap, mobileScore) {
  if (noHttps)
    return "Szia! Megnéztem a weboldalatokat, és azt látom, hogy nem biztonságos kapcsolaton tölt be — a böngészők \"Nem biztonságos\" figyelmeztetést mutatnak. Ez bizalmat ront, és a Google is hátrányba sorolja az ilyen oldalakat. Könnyen javítható lenne. Ha érdekel, szívesen segítek.";
  if (noPhoneLink)
    return "Szia! Ránéztem a weboldalatokra, és azt látom, hogy a telefonszám mobilon nem kattintható — hívni csak a szám kézzel történő beírásával lehet. Ma már az érdeklődők nagy része telefonon keres, és sokan egyszerűen nem fognak manuálisan számot beírni. Ez percek alatt javítható. Ha érdekel, megmutatom.";
  if (noMetaDesc)
    return "Szia! Megnéztem a weboldalatokat, és azt látom, hogy Google-ban nincs szöveg az oldal találata alatt — csak az URL jelenik meg. Ez azt jelenti, hogy az érdeklődők kevésbé kattintanak rá. Pár sorral sokkal jobban nézne ki és több látogatót hozna. Ha érdekel, segítek megírni.";
  if (bigGap)
    return "Szia! Megnéztem a weboldalatokat — asztali gépen rendben van, de mobilon nehézkes a használata. Ma már az érdeklődők nagy része telefonon keres, és egy nem mobilbarát oldal sok látogatót eltérít. Pár fejlesztéssel könnyen orvosolható lenne. Ha érdekel, szívesen megmutatom.";
  if (mobileScore < 50)
    return "Szia! Ránéztem a weboldalatokra, és azt látom, hogy mobilon lassabban tölt be a kelleténél. Ma már az ügyfelek nagy része telefonon keres — ha az oldal sokat vár, sokan inkább továbblépnek. Ez megoldható, általában pár héten belül érezhető a különbség. Ha kíváncsi vagy rá, szívesen átbeszéljük.";
  return null;
}

function analyzeFixability(mobileScore, desktopScore, issues, checks = {}) {
  const criticalCount  = issues.filter(i => (i.score || 0) < 0.5).length;
  const hasDeepIssues  = issues.some(
    i => ["dom-size", "mainthread-work-breakdown"].includes(i.key) && (i.score || 0) < 0.5
  );
  const bigGap       = (desktopScore - mobileScore) > 30;
  const noHttps      = checks.https === false;
  const noPhoneLink  = checks.hasPhoneLink === false && checks.hasAnyPhone !== false;
  const noMetaDesc   = checks.metaDescription === false;

  // Konkrét, kézzelfogható problémák → érdemes megkeresni
  const reasons = [
    noHttps      && "Nem biztonságos (HTTPS hiányzik)",
    noPhoneLink  && "Telefonszám nem kattintható mobilon",
    noMetaDesc   && "Hiányzó Google keresési leírás",
    bigGap       && "Valószínűleg nem mobilbarát",
    mobileScore < 50 && `Lassan tölt be mobilon (${mobileScore}/100)`,
  ].filter(Boolean);

  const contactWorthy = reasons.length > 0;
  const contactNote = contactWorthy
    ? `📞 ÉRDEMES MEGKERESNI — ${reasons[0]}`
    : "⏭ KIHAGYHATÓ — nincs konkrét, kézzelfogható probléma";

  const msg = clientMsg(noHttps, noPhoneLink, noMetaDesc, bigGap, mobileScore);

  // Munkaóra becslés a sebesség alapján
  if (mobileScore < 25 && criticalCount >= 4 && hasDeepIssues) {
    return { label: "⚠️ Új oldalt javaslunk", hours: null,
      reason: "Mély strukturális problémák vannak. Az újraépítés jobban megéri.",
      contactWorthy, contactNote,
      clientMessage: msg || "Szia! Megnéztem a weboldalatokat, és sajnos komoly technikai problémákat látok — mobilon szinte használhatatlan. Ennél a szintnél egy modern új oldal jobban megéri, mint a javítgatás. Ha érdekel, szívesen átbeszéljük." };
  }
  if (mobileScore < 40 && criticalCount >= 3) {
    return { label: "✅ Megcsináljuk — nagyobb munka", hours: "15–25 óra",
      reason: "Több kritikus probléma van, amelyek kód szintű beavatkozást igényelnek.",
      contactWorthy, contactNote, clientMessage: msg };
  }
  if (mobileScore < 60 || bigGap) {
    return { label: "✅ Megcsináljuk — közepes munka", hours: "5–15 óra",
      reason: "Van néhány javítandó pont, de az alap rendben van.",
      contactWorthy, contactNote, clientMessage: msg };
  }
  if (contactWorthy) {
    return { label: "✅ Gyors javítás", hours: "1–3 óra",
      reason: "Az oldal jól teljesít, de van egy-két konkrét hiba amit érdemes megoldani.",
      contactWorthy, contactNote, clientMessage: msg };
  }
  return { label: "✅ Rendben van", hours: null,
    reason: "Nem találtunk konkrét, kézzelfogható problémát.",
    contactWorthy: false, contactNote, clientMessage: null };
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

  const { url, mobileScore, desktopScore, issues = [], checks = {} } = body;
  if (!url || mobileScore == null || desktopScore == null) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) {
    console.warn("GITHUB_TOKEN nincs beállítva — audit log kihagyva");
    return res.status(200).json({ ok: false, reason: "no token" });
  }

  const analysis = analyzeFixability(mobileScore, desktopScore, issues, checks);

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
client_message: "${analysis.clientMessage ? analysis.clientMessage.replace(/"/g, '\\"') : ""}"
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

## Gyors ellenőrzések

| | |
|---|---|
| Biztonságos (HTTPS) | ${checks.https ? "✅ Igen" : "❌ Nem"} |
| Kattintható telefonszám | ${checks.hasPhoneLink === null ? "⚪ Nem ellenőrizhető" : checks.hasPhoneLink ? "✅ Igen" : checks.hasAnyPhone === false ? "❌ Nincs telefonszám" : "❌ Nem kattintható"} |
| Google keresési leírás | ${checks.metaDescription === null || checks.metaDescription === undefined ? "⚪ Nem ellenőrizhető" : checks.metaDescription ? "✅ Van" : "❌ Hiányzik"} |
| Strukturált adat (Schema) | ${checks.hasLocalBizSchema === null ? "⚪ Nem ellenőrizhető" : checks.hasLocalBizSchema ? "✅ Van" : checks.hasSchemaOrg ? "🟡 Általános (nem LocalBusiness)" : "❌ Hiányzik"} |
| Google Térkép az oldalon | ${checks.hasMapsEmbed === null ? "⚪ Nem ellenőrizhető" : checks.hasMapsEmbed ? "✅ Van" : "❌ Nincs"} |
| Social média (FB/IG) | ${checks.hasFacebook === null ? "⚪ Nem ellenőrizhető" : (checks.hasFacebook || checks.hasInstagram) ? `✅ Van (${[checks.hasFacebook && "Facebook", checks.hasInstagram && "Instagram"].filter(Boolean).join(", ")})` : "❌ Nincs link"} |
| Oldal frissessége | ${checks.copyrightYear === null ? "⚪ Nem ellenőrizhető" : checks.siteIsRecent ? `✅ Friss (© ${checks.copyrightYear})` : `❌ Elavult (© ${checks.copyrightYear})`} |
| Gombok mérete mobilon | ${checks.tapTargets === null || checks.tapTargets === undefined ? "⚪ Nem ellenőrizhető" : checks.tapTargets ? "✅ Rendben" : "❌ Túl kicsi"} |

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
