// Könnyű, saját látogatottság-követő — a napi analytics-digest emailhez.
// Nem cookie-alapú, nem session-átívelő: csak egy véletlen ID a jelenlegi fülre (sessionStorage),
// hogy a digest nagyjából meg tudja becsülni, meddig maradt valaki egy látogatáson belül.

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

export function track(type, extra = {}) {
  try {
    const payload = {
      type,
      path: window.location.pathname,
      referrer: document.referrer || "",
      sessionId: getSessionId(),
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
