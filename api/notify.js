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

// ── Ügyfélfogható problémák — csak amitől egy vállalkozó tényleg lép ─────────
// 1. HTTPS hiányzik → böngésző "Nem biztonságos" feliratot mutat minden látogatónak
// 2. Mobil < 40    → telefonon szinte használhatatlan, a tulajdonos maga is érzi
// 3. Nagy rés ÉS mobil < 55 → az oldal lényegében nincs mobilra optimalizálva
// Minden más (telefon link, meta, schema, maps) extra info — nem önálló megkeresési ok

function clientMsg(noHttps, mobileTrulySlow, mobileBroken, mobileScore) {
  if (noHttps)
    return "Szia! Megnéztem a weboldalatokat, és azt látom, hogy nem biztonságos kapcsolaton tölt be — a böngészők \"Nem biztonságos\" figyelmeztetést mutatnak minden látogatónak. Ez bizalmat ront, és a Google is hátrányba sorolja az ilyen oldalakat. Ha érdekel, szívesen segítek rajta.";
  if (mobileBroken)
    return "Szia! Megnéztem a weboldalatokat — asztali gépen jól néz ki, de mobilon sajnos nehézkes a használata. Ma már az érdeklődők nagy része telefonon keres, és egy nem mobilbarát oldal sok látogatót eltérít, mielőtt még kapcsolatba lépnének. Ha érdekel, szívesen megmutatom, mi okozza és hogyan lehet megoldani.";
  if (mobileTrulySlow)
    return "Szia! Ránéztem a weboldalatokra, és azt látom, hogy mobilon igen lassan tölt be — a Google mérése szerint " + mobileScore + "/100 pont, ami azt jelenti, hogy egy átlagos kapcsolaton az oldal betöltése több másodpercet vesz igénybe. Ma már az ügyfelek nagy része telefonon keres, és ha az oldal sokat várat, sokan inkább továbblépnek. Ha kíváncsi vagy rá, szívesen átbeszéljük.";
  return null;
}

function analyzeFixability(mobileScore, desktopScore, issues, checks = {}) {
  const criticalCount  = issues.filter(i => (i.score || 0) < 0.5).length;
  const hasDeepIssues  = issues.some(
    i => ["dom-size", "mainthread-work-breakdown"].includes(i.key) && (i.score || 0) < 0.5
  );
  const bigGap         = (desktopScore - mobileScore) > 30;
  const noHttps        = checks.https === false;
  const mobileTrulySlow = mobileScore < 40;
  const mobileBroken   = bigGap && mobileScore < 55;

  // Csak a valóban látható, ügyfélkört érintő problémák → ezek alapján érdemes megkeresni
  const reasons = [
    noHttps         && "Nem biztonságos (HTTPS hiányzik) — böngészők figyelmeztetnek",
    mobileBroken    && `Mobilon tört (${mobileScore}/100), asztali jó (${desktopScore}/100)`,
    mobileTrulySlow && `Mobilon szinte használhatatlanul lassú (${mobileScore}/100)`,
  ].filter(Boolean);

  const contactWorthy = reasons.length > 0;
  const contactNote = contactWorthy
    ? `📞 ÉRDEMES MEGKERESNI — ${reasons[0]}`
    : "⏭ KIHAGYHATÓ — nincs látható, ügyfélkört érintő probléma";

  const msg = clientMsg(noHttps, mobileTrulySlow, mobileBroken, mobileScore);

  // Munkaóra becslés
  if (mobileScore < 25 && criticalCount >= 4 && hasDeepIssues) {
    return { label: "⚠️ Új oldalt javaslunk", hours: null,
      reason: "Mély strukturális problémák vannak. Az újraépítés jobban megéri, mint a javítgatás.",
      contactWorthy, contactNote,
      clientMessage: msg || "Szia! Megnéztem a weboldalatokat, és sajnos komoly technikai problémákat látok — mobilon szinte használhatatlan. Ennél a szintnél egy modern új oldal jobban megéri, mint a javítgatás. Ha érdekel, szívesen átbeszéljük." };
  }
  if (mobileScore < 40 && criticalCount >= 3) {
    return { label: "✅ Megcsináljuk — nagyobb munka", hours: "15–25 óra",
      reason: "Több kritikus probléma van, amelyek kód szintű beavatkozást igényelnek.",
      contactWorthy, contactNote, clientMessage: msg };
  }
  if (mobileScore < 55 || (bigGap && mobileScore < 70)) {
    return { label: "✅ Megcsináljuk — közepes munka", hours: "5–15 óra",
      reason: "Van néhány javítandó pont, de az alap rendben van.",
      contactWorthy, contactNote, clientMessage: msg };
  }
  return { label: "✅ Rendben van", hours: null,
    reason: contactWorthy
      ? "Az oldal jól teljesít, de az alábbi konkrét probléma miatt érdemes kapcsolatba lépni."
      : "Nem találtunk látható, ügyfélkört érintő problémát.",
    contactWorthy, contactNote, clientMessage: msg };
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

  // Google gyors ellenőrzők
  const searchName = checks.pageTitle || url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const gSearch  = `https://www.google.com/search?q=${encodeURIComponent('"' + searchName + '"')}`;
  const gMaps    = `https://www.google.com/maps/search/${encodeURIComponent(searchName)}`;
  const gReviews = `https://www.google.com/search?q=${encodeURIComponent(searchName + " vélemények")}`;
  const gCompete = `https://www.google.com/maps/search/${encodeURIComponent(searchName.replace(/\s+\S+$/, ""))}`;
  // gCompete: az utolsó szót (pl. városnév) megtartja, az üzlet nevét leveszi → kategória keresés

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
has_chatbot: ${checks.hasChatbot || false}
chatbot_name: "${checks.chatbotName || ""}"
has_booking: ${checks.hasBooking || false}
booking_name: "${checks.bookingName || ""}"
business_quality: ${checks.businessQuality || 0}
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
| Google Analytics | ${checks.hasAnalytics === null ? "⚪ Nem ellenőrizhető" : checks.hasAnalytics ? "✅ Van" : "❌ Nincs — nem tudják hány látogatójuk van"} |
| Gombok mérete mobilon | ${checks.tapTargets === null || checks.tapTargets === undefined ? "⚪ Nem ellenőrizhető" : checks.tapTargets ? "✅ Rendben" : "❌ Túl kicsi"} |
| Chatbot / Élő chat | ${checks.hasChatbot === null ? "⚪ Nem ellenőrizhető" : checks.hasChatbot ? `✅ Van (${checks.chatbotName})` : "❌ Nincs"} |
| Online foglalás | ${checks.hasBooking === null ? "⚪ Nem ellenőrizhető" : checks.hasBooking ? `✅ Van (${checks.bookingName})` : "❌ Nincs"} |
| Cégminőség-pontszám | ${checks.businessQuality || 0}/8 |

## 🔍 Google jelenlét — gyors ellenőrzők

> Kattints, nézd meg manuálisan (1-1 perc)

| | |
|---|---|
| Megjelenik-e Google-on? | [🔍 Keresés: ${searchName}](${gSearch}) |
| Hol van a Maps-en? | [🗺 Google Maps](${gMaps}) |
| Hány értékelése van? | [⭐ Értékelések](${gReviews}) |

## Fő problémák (mobilon)

${topIssuesText || "Nem volt azonosítható probléma — jól néz ki!"}

${(() => {
  const quality = checks.businessQuality || 0;
  const THRESHOLD = 5;
  const opps = [];
  if (checks.hasChatbot === false && quality >= THRESHOLD)
    opps.push(`🤖 **AI chatbot lehetőség** — Nincs chatbot, de aktív a cég (${quality}/8). Pitch: "Megnéztem a weboldalatokat — jól néz ki. Egy dolgot látok: sok vállalkozásnál ugyanazokat a kérdéseket kapják nap mint nap. Egy AI chatbot ezeket automatizálná. Megmutatnám 15 perc alatt?"`);
  if (checks.hasBooking === false && quality >= THRESHOLD && (checks.hasMapsEmbed || checks.hasPhoneLink))
    opps.push(`📅 **Online foglalás lehetőség** — Nincs foglalási rendszer, fizikai helyszín valószínű (${quality}/8). Pitch: "Megnéztem a weboldalatokat. Egy lehetőséget látok: este/hétvégén elvesznek a leadek mert nincs online foglalás. Érdemes lenne 15 percet rá szánni?"`);
  return opps.length > 0
    ? `## 💡 Üzleti lehetőségek (cégminőség: ${quality}/8)\n\n${opps.join("\n\n")}`
    : "";
})()}

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
