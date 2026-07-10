import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { t } from "../i18n/translations";

const ACCENT = "#e8963a";
const SECTION_IDS = ["about", "music", "releases", "press", "shows", "photos", "contact"];

export default function Navbar() {
  const { lang, setLang } = useLang();
  const tx = t[lang].nav;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState(null);
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  // Prefix anchor links with "/" when not on home page
  const href = anchor => isHome ? anchor : `/${anchor}`;

  const navLinks = [
    { id: "about",    label: tx.about,    href: href("#about") },
    { id: "music",    label: tx.music,    href: href("#music") },
    { id: "releases", label: tx.releases, href: href("#releases") },
    { id: "press",    label: tx.press,    href: href("#press") },
    { id: "shows",    label: tx.shows,    href: href("#shows") },
    { id: "photos",   label: tx.photos,   href: href("#photos") },
    { id: "contact",  label: tx.contact,  href: href("#contact") },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Aktív szekció figyelése görgetéskor — csak a főoldalon van értelme
  // Emellett GA4 "section_view" eseményt is küld, egyszer szekciónként/oldalbetöltésenként
  // — ebből épül a napi analytics-digest email szekció-bontása
  useEffect(() => {
    if (!isHome) return;
    const sections = SECTION_IDS.map(id => document.getElementById(id)).filter(Boolean);
    if (sections.length === 0) return;

    const seen = new Set();
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
            if (!seen.has(entry.target.id)) {
              seen.add(entry.target.id);
              window.gtag?.("event", "section_view", { section_id: entry.target.id });
            }
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, [isHome]);

  return (
    <header style={{
      position: "fixed",
      top: 0, left: 0, right: 0,
      zIndex: 100,
      padding: "0 2rem",
      height: "60px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      background: scrolled ? "rgba(11,10,8,0.85)" : "rgba(11,10,8,0.25)",
      backdropFilter: "blur(12px)",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
      transition: "all 0.3s ease",
    }}>
      <a href={isHome ? "#" : "/"} style={{ textDecoration: "none", color: "#f5f1ea", fontWeight: 600, fontSize: "0.95rem", letterSpacing: "-0.01em" }}>
        RK
      </a>

      <nav style={{ display: "flex", alignItems: "center", gap: "2rem" }} className="desktop-nav">
        {navLinks.map(link => {
          const isActive = active === link.id;
          return (
            <a key={link.label} href={link.href}
              style={{
                ...navLinkStyle,
                color: isActive ? ACCENT : "rgba(245,241,234,0.65)",
                textShadow: isActive ? "0 0 12px rgba(232,150,58,0.4)" : "none",
              }}
              onMouseOver={e => e.currentTarget.style.color = ACCENT}
              onMouseOut={e => e.currentTarget.style.color = isActive ? ACCENT : "rgba(245,241,234,0.65)"}>
              {link.label}
            </a>
          );
        })}
        <LangToggle lang={lang} setLang={setLang} />
      </nav>

      <div style={{ display: "none" }} className="mobile-controls">
        <LangToggle lang={lang} setLang={setLang} />
        <button onClick={() => setMenuOpen(o => !o)} className="hamburger"
          style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", flexDirection: "column", gap: "5px" }}
          aria-label="Toggle menu">
          {[0,1,2].map(i => <span key={i} style={{ display: "block", width: "22px", height: "1.5px", background: "#f5f1ea" }} />)}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
            style={{
              position: "absolute", top: "60px", left: 0, right: 0,
              background: "rgba(11,10,8,0.97)", backdropFilter: "blur(12px)",
              borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "1.5rem 2rem",
              display: "flex", flexDirection: "column", gap: "1.25rem",
            }}>
            {navLinks.map(link => (
              <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)}
                style={{ textDecoration: "none", color: active === link.id ? ACCENT : "#f5f1ea", fontSize: "1rem", letterSpacing: "0.05em" }}>
                {link.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .mobile-controls { display: flex !important; align-items: center; gap: 1rem; }
        }
      `}</style>
    </header>
  );
}

function LangToggle({ lang, setLang }) {
  return (
    <button
      onClick={() => setLang(l => l === "en" ? "hu" : "en")}
      style={{
        background: "none", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "2px",
        padding: "3px 8px", fontSize: "0.75rem", letterSpacing: "0.08em",
        cursor: "pointer", color: "rgba(245,241,234,0.65)", transition: "all 0.3s",
        fontFamily: "inherit",
      }}
      onMouseOver={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; }}
      onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; e.currentTarget.style.color = "rgba(245,241,234,0.65)"; }}
    >
      {lang === "en" ? "HU" : "EN"}
    </button>
  );
}

const navLinkStyle = {
  textDecoration: "none",
  fontSize: "0.85rem", letterSpacing: "0.05em", transition: "color 0.2s",
};
