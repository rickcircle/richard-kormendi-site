import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Önálló oldal — nincs Navbar/Footer, tiszta ajánlat az ügyfélnek
// URL: /proposal/:id

function fmt(n) {
  return new Intl.NumberFormat("hu-HU").format(n) + " Ft";
}

function ScoreBadge({ score, label }) {
  const color = score >= 70 ? "#0cce6b" : score >= 50 ? "#ffa400" : "#ff4e42";
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: "0.35rem", padding: "1.25rem 1.75rem",
      border: `2px solid ${color}20`, borderRadius: "10px",
      background: score >= 70 ? "#f0fdf6" : score >= 50 ? "#fffbf0" : "#fff5f5",
    }}>
      <span style={{ fontSize: "2rem", fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
      <span style={{ fontSize: "0.65rem", letterSpacing: "0.12em", color: "#999", textTransform: "uppercase" }}>{label}</span>
    </div>
  );
}

function Problem({ icon, title, desc }) {
  return (
    <div style={{
      display: "flex", gap: "0.9rem", alignItems: "flex-start",
      padding: "1rem 1.25rem", background: "#fff5f5",
      border: "1px solid #fecaca", borderLeft: "3px solid #ff4e42", borderRadius: "8px",
    }}>
      <span style={{ fontSize: "1.1rem", flexShrink: 0, marginTop: "2px" }}>{icon}</span>
      <div>
        <p style={{ margin: "0 0 0.2rem", fontWeight: 600, fontSize: "0.9rem", color: "#1a1a1a" }}>{title}</p>
        <p style={{ margin: 0, fontSize: "0.82rem", color: "#666", lineHeight: 1.55 }}>{desc}</p>
      </div>
    </div>
  );
}

function ServiceRow({ service, isLast }) {
  return (
    <div style={{
      padding: "1.25rem 0",
      borderBottom: isLast ? "none" : "1px solid #f0f0f0",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: "0 0 0.3rem", fontWeight: 600, fontSize: "0.9rem", color: "#1a1a1a" }}>
            {service.title}
            {service.optional && (
              <span style={{ marginLeft: "0.5rem", fontSize: "0.7rem", padding: "0.1rem 0.5rem",
                background: "#f0f0f0", borderRadius: "20px", color: "#888", fontWeight: 400 }}>
                opcionális
              </span>
            )}
          </p>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "#777", lineHeight: 1.55 }}>{service.desc}</p>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "0.95rem", color: "#1a1a1a", whiteSpace: "nowrap" }}>
            {fmt(service.price)}
          </p>
          {service.monthly && (
            <p style={{ margin: "0.1rem 0 0", fontSize: "0.7rem", color: "#999" }}>/hó</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Proposal() {
  const { id } = useParams();
  const [data, setData]     = useState(null);
  const [error, setError]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setError("Érvénytelen ajánlat azonosító."); setLoading(false); return; }
    fetch(`/api/proposal?id=${encodeURIComponent(id)}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError("Az ajánlat nem található vagy lejárt."); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', sans-serif", color: "#999", fontSize: "0.9rem" }}>
      Betöltés...
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", padding: "2rem", textAlign: "center" }}>
      <p style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔍</p>
      <p style={{ color: "#1a1a1a", fontWeight: 600, marginBottom: "0.5rem" }}>Ajánlat nem található</p>
      <p style={{ color: "#999", fontSize: "0.85rem" }}>{error}</p>
    </div>
  );

  const { url, mobileScore, desktopScore, checks = {}, pageTitle, date, services, total, contact } = data;
  const bigGap     = (desktopScore - mobileScore) > 30;
  const mobileSlow = mobileScore < 40;
  const noHttps    = checks.https === false;
  const noAnalytics = checks.hasAnalytics === false;

  const problems = [
    noHttps && {
      icon: "🔒",
      title: "Nem biztonságos kapcsolat (HTTPS hiányzik)",
      desc: "A böngészők \"Nem biztonságos\" figyelmeztetést mutatnak minden látogatónak. Ez bizalmat ront, és a Google is hátrányba sorolja az ilyen oldalakat.",
    },
    mobileSlow && bigGap && {
      icon: "📱",
      title: `Az oldal mobilon lassú és nem optimalizált (${mobileScore}/100)`,
      desc: `Asztali gépen elfogadható (${desktopScore}/100), de mobilon az oldal nehezen használható. Ma már az érdeklődők nagy része telefonon keres.`,
    },
    mobileSlow && !bigGap && {
      icon: "📱",
      title: `Az oldal mobilon lassú (${mobileScore}/100)`,
      desc: "A Google mérése szerint az oldal mobilon lassabban tölt be a javasolt szintnél. Ez különösen akkor számít, ha Google keresésből érkeznek látogatók.",
    },
    noAnalytics && {
      icon: "📊",
      title: "Nincs látogatásmérés az oldalon",
      desc: "Jelenleg nem derül ki hányan járnak az oldalon, honnan jönnek, és mire kattintanak. Ezek nélkül nehéz megítélni, mi működik.",
    },
  ].filter(Boolean);

  const mainServices = services.filter(s => !s.optional);
  const optServices  = services.filter(s => s.optional);

  const dateFormatted = new Date(date).toLocaleDateString("hu-HU", {
    year: "numeric", month: "long", day: "numeric"
  });

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#1a1a1a", background: "#fafafa", minHeight: "100vh" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fafafa; }
        @media print {
          body { background: #fff !important; }
          .no-print { display: none !important; }
          @page { margin: 1.5cm; }
        }
        @media (max-width: 600px) {
          .proposal-scores { flex-direction: row !important; }
          .proposal-header-inner { padding: 2rem 1.25rem !important; }
          .proposal-body { padding: 0 1.25rem 3rem !important; }
        }
      `}</style>

      {/* ── Fejléc ────────────────────────────────────────────────────────── */}
      <div style={{ background: "#1a1a1a", color: "#fff" }}>
        <div className="proposal-header-inner" style={{ maxWidth: "700px", margin: "0 auto", padding: "2.5rem 2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: "0.7rem", letterSpacing: "0.2em", color: "#aaa", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                Weboldal elemzés
              </p>
              <h1 style={{ fontSize: "clamp(1.3rem, 4vw, 1.9rem)", fontWeight: 700, lineHeight: 1.2, marginBottom: "0.4rem" }}>
                {pageTitle}
              </h1>
              <a href={url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: "0.78rem", color: "#aaa", textDecoration: "none" }}>
                {url.replace(/^https?:\/\//, "")} ↗
              </a>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "0.78rem", color: "#aaa" }}>{dateFormatted}</p>
              <p style={{ fontSize: "0.78rem", color: "#aaa", marginTop: "0.25rem" }}>richardkormendi.com</p>
            </div>
          </div>

          {/* Pontszámok */}
          <div className="proposal-scores" style={{ display: "flex", gap: "0.75rem", marginTop: "2rem", flexWrap: "wrap" }}>
            <ScoreBadge score={mobileScore}  label="Mobil" />
            <ScoreBadge score={desktopScore} label="Asztali" />
            <div style={{ flex: 1, display: "flex", alignItems: "center", paddingLeft: "0.5rem" }}>
              <p style={{ fontSize: "0.78rem", color: "#aaa", lineHeight: 1.6 }}>
                Google PageSpeed Insights mérés alapján<br />
                (0–100 skála, 90+ kiváló, 50 alatt kritikus)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="proposal-body" style={{ maxWidth: "700px", margin: "0 auto", padding: "0 2rem 4rem" }}>

        {/* ── Talált problémák ──────────────────────────────────────────── */}
        {problems.length > 0 && (
          <section style={{ paddingTop: "2.5rem" }}>
            <p style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase", marginBottom: "1rem" }}>
              Talált problémák
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {problems.map((p, i) => <Problem key={i} {...p} />)}
            </div>
          </section>
        )}

        {/* ── Javasolt szolgáltatások ──────────────────────────────────── */}
        <section style={{ paddingTop: "2.5rem" }}>
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase", marginBottom: "0.25rem" }}>
            Javasolt megoldás
          </p>
          <p style={{ fontSize: "0.82rem", color: "#999", marginBottom: "1.25rem", lineHeight: 1.6 }}>
            Az alábbi munkálatokkal a fenti problémák megoldhatók.
          </p>
          <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: "10px", padding: "0 1.5rem" }}>
            {mainServices.map((s, i) => (
              <ServiceRow key={s.key} service={s} isLast={i === mainServices.length - 1} />
            ))}
          </div>

          {/* Végösszeg */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "1rem 1.5rem", background: "#1a1a1a", borderRadius: "8px", marginTop: "0.75rem",
          }}>
            <span style={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem" }}>Összesen</span>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: "1.1rem" }}>{fmt(total)}</span>
          </div>

          {/* Opcionális */}
          {optServices.length > 0 && (
            <>
              <p style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase",
                margin: "2rem 0 0.25rem" }}>
                Opcionálisan ajánlott
              </p>
              <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: "10px", padding: "0 1.5rem" }}>
                {optServices.map((s, i) => (
                  <ServiceRow key={s.key} service={s} isLast={i === optServices.length - 1} />
                ))}
              </div>
              <p style={{ fontSize: "0.75rem", color: "#bbb", marginTop: "0.5rem", lineHeight: 1.5 }}>
                Az opcionális szolgáltatások az összegbe nincsenek beleszámítva. Bármikor lemondható.
              </p>
            </>
          )}
        </section>

        {/* ── Átfutási idő ─────────────────────────────────────────────── */}
        <section style={{ paddingTop: "2.5rem" }}>
          <div style={{
            padding: "1.25rem 1.5rem", background: "#fff", border: "1px solid #e8e8e8",
            borderRadius: "10px", display: "flex", gap: "1rem", alignItems: "center",
          }}>
            <span style={{ fontSize: "1.4rem" }}>⏱️</span>
            <div>
              <p style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.2rem" }}>Átfutási idő: 5–10 munkanap</p>
              <p style={{ fontSize: "0.8rem", color: "#777", lineHeight: 1.5 }}>
                A munka megkezdéséhez nem szükséges az oldalhoz hozzáférés — az elemzés alapján becsült munkaóra elegendő az ajánlathoz.
              </p>
            </div>
          </div>
        </section>

        {/* ── Kapcsolatfelvétel ─────────────────────────────────────────── */}
        <section style={{ paddingTop: "2.5rem" }}>
          <p style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase", marginBottom: "1rem" }}>
            Kapcsolatfelvétel
          </p>
          <div style={{
            background: "#fff", border: "1px solid #e8e8e8", borderRadius: "10px",
            padding: "1.75rem 1.5rem",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              gap: "1.5rem", flexWrap: "wrap" }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.2rem" }}>Körmendi Richard</p>
                <p style={{ fontSize: "0.82rem", color: "#777", marginBottom: "1rem" }}>Webfejlesztő</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  <a href={`tel:${contact.phoneRaw}`} style={{ fontSize: "0.85rem", color: "#1a1a1a", textDecoration: "none", display: "flex", gap: "0.5rem" }}>
                    📞 {contact.phone}
                  </a>
                  <a href={`mailto:${contact.email}`} style={{ fontSize: "0.85rem", color: "#1a1a1a", textDecoration: "none", display: "flex", gap: "0.5rem" }}>
                    ✉️ {contact.email}
                  </a>
                  <a href={`https://${contact.web}`} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: "0.85rem", color: "#1a1a1a", textDecoration: "none", display: "flex", gap: "0.5rem" }}>
                    🌐 {contact.web}
                  </a>
                  <a href={contact.instagram} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: "0.85rem", color: "#1a1a1a", textDecoration: "none", display: "flex", gap: "0.5rem" }}>
                    📷 Instagram
                  </a>
                </div>
              </div>
              <a href={`tel:${contact.phoneRaw}`}
                className="no-print"
                style={{
                  display: "inline-block", padding: "0.85rem 1.75rem",
                  background: "#1a1a1a", color: "#fff", borderRadius: "6px",
                  fontSize: "0.88rem", fontWeight: 600, textDecoration: "none",
                  whiteSpace: "nowrap", alignSelf: "center",
                }}>
                📞 Visszahívást kérek
              </a>
            </div>
          </div>
        </section>

        {/* ── Lábjegyzet ──────────────────────────────────────────────────── */}
        <p style={{ fontSize: "0.72rem", color: "#ccc", marginTop: "2.5rem", lineHeight: 1.6, textAlign: "center" }}>
          Az elemzés a Google PageSpeed Insights API alapján készült · {dateFormatted} · richardkormendi.com
        </p>
      </div>
    </div>
  );
}
