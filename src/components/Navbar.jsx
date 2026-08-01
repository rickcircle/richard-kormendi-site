import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { t } from "../i18n/translations";
import { track } from "../utils/track";

const ACCENT = "#c23b3b";
const SPOTIFY_GREEN = "#1DB954";
const SPOTIFY_URL = "https://open.spotify.com/artist/5UW4cZ0M83TG2nJWYvkVkp";
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
              track("section_view", { section: entry.target.id });
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
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <a href={isHome ? "#" : "/"} style={{ textDecoration: "none", color: "#f5f1ea", fontWeight: 600, fontSize: "0.95rem", letterSpacing: "-0.01em" }}>
          RK
        </a>
        <SpotifyNavButton />
      </div>

      <nav style={{ display: "flex", alignItems: "center", gap: "2rem" }} className="desktop-nav">
        {navLinks.map(link => {
          const isActive = active === link.id;
          return (
            <a key={link.label} href={link.href}
              style={{
                ...navLinkStyle,
                color: isActive ? ACCENT : "rgba(245,241,234,0.65)",
                textShadow: isActive ? "0 0 12px rgba(194, 59, 59,0.4)" : "none",
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
        @media (max-width: 420px) {
          .navbar-spotify-label { display: none; }
          .navbar-spotify { padding: 6px !important; }
        }
      `}</style>
    </header>
  );
}

function SpotifyNavButton() {
  return (
    <a
      href={SPOTIFY_URL}
      target="_blank" rel="noreferrer"
      onClick={() => track("click", { label: "navbar_spotify" })}
      className="navbar-spotify"
      style={{
        display: "inline-flex", alignItems: "center", gap: "0.4rem",
        padding: "5px 10px", borderRadius: "999px",
        background: SPOTIFY_GREEN, color: "#000",
        fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.02em",
        textDecoration: "none", flexShrink: 0,
        boxShadow: "0 0 14px rgba(29,185,84,0.35)",
        transition: "transform 0.15s ease",
      }}
      onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
      onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
      aria-label="Spotify"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
      <span className="navbar-spotify-label">Spotify</span>
    </a>
  );
}

function LangToggle({ lang, setLang }) {
  return (
    <button
      onClick={() => { const next = lang === "en" ? "hu" : "en"; setLang(() => next); track("click", { label: `lang_switch: ${next}` }); }}
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
