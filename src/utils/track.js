// Könnyű, saját látogatottság-követő — a napi analytics-digest emailhez.
// Két azonosítót használ:
//  - sessionId (sessionStorage): csak az adott fülre/látogatásra, az "átlag idő az oldalon" méréséhez
//  - visitorId (localStorage): hosszabb életű, ebből tudja a digest, hogy új vagy visszatérő látogatóról van szó
// Egyik sem köthető személyhez — csak véletlen ID-k, nincs bennük semmilyen személyes adat.

function getSessionId() {
  try {
    let id = sessionStorage.getItem("rk_sid");
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
      sessionStorage.setItem("rk_sid", id);
    }
    return id;
  } catch {
    return "unknown";
  }
}

function getVisitorId() {
  try {
    let id = localStorage.getItem("rk_vid");
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
      localStorage.setItem("rk_vid", id);
    }
    return id;
  } catch {
    return "unknown";
  }
}

function getDevice() {
  return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? "mobile" : "desktop";
}

function getLang() {
  const param = new URLSearchParams(window.location.search).get("lang");
  return param === "hu" || param === "en" ? param : "en";
}

function getUtm() {
  const params = new URLSearchParams(window.location.search);
  const source = params.get("utm_source");
  if (!source) return null;
  return { source, medium: params.get("utm_medium") || null, campaign: params.get("utm_campaign") || null };
}

// Saját forgalom kizárása — látogasd meg egyszer a https://richardkormendi.com/?rk_owner=1 linket
// bármelyik eszközödön/böngésződben, onnantól az a böngésző soha nem kerül a statisztikába.
// Visszakapcsoláshoz (pl. teszteléshez): ?rk_owner=0
function isOwnerExcluded() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.has("rk_owner")) {
      if (params.get("rk_owner") === "0") localStorage.removeItem("rk_owner");
      else localStorage.setItem("rk_owner", "1");
    }
    return localStorage.getItem("rk_owner") === "1";
  } catch {
    return false;
  }
}

export function track(type, extra = {}) {
  if (isOwnerExcluded()) return;
  try {
    const payload = {
      type,
      path: window.location.pathname,
      referrer: document.referrer || "",
      sessionId: getSessionId(),
      visitorId: getVisitorId(),
      device: getDevice(),
      lang: getLang(),
      utm: getUtm(),
      ts: Date.now(),
      ...extra,
    };
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    }
  } catch {
    // néma hiba — a követés soha nem törheti el az oldalt
  }
}
