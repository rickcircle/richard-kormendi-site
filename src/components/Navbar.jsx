import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { t } from "../i18n/translations";

export default function Navbar() {
  const { lang, setLang } = useLang();
  const tx = t[lang].nav;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  // Prefix anchor links with "/" when not on home page
  const href = anchor => isHome ? anchor : `/${anchor}`;

  const navLinks = [
    { label: tx.about,    href: href("#about") },
    { label: tx.music,    href: href("#music") },
    { label: tx.releases, href: href("#releases") },
    { label: tx.shows,    href: href("#shows") },
    { label: tx.photos,   href: href("#photos") },
    { label: tx.contact,  href: href("#contact") },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      background: scrolled ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.35)",
      backdropFilter: "blur(12px)",
      borderBottom: scrolled ? "1px solid #e8e8e8" : "1px solid transparent",
      transition: "all 0.3s ease",
    }}>
      <a href={isHome ? "#" : "/"} style={{ textDecoration: "none", color: scrolled ? "#1a1a1a" : "#fff", fontWeight: 600, fontSize: "0.95rem", letterSpacing: "-0.01em", transition: "color 0.3s" }}>
        RK
      </a>

      <nav style={{ display: "flex", alignItems: "center", gap: "2rem" }} className="desktop-nav">
        {navLinks.map(link => (
          <a key={link.label} href={link.href}
            style={{ ...navLinkStyle, color: scrolled ? "#555" : "rgba(255,255,255,0.75)" }}
            onMouseOver={e => e.currentTarget.style.color = scrolled ? "#1a1a1a" : "#fff"}
            onMouseOut={e => e.currentTarget.style.color = scrolled ? "#555" : "rgba(255,255,255,0.75)"}>
            {link.label}
          </a>
        ))}
        <LangToggle lang={lang} setLang={setLang} scrolled={scrolled} />
      </nav>

      <div style={{ display: "none" }} className="mobile-controls">
        <LangToggle lang={lang} setLang={setLang} scrolled={scrolled} />
        <button onClick={() => setMenuOpen(o => !o)} className="hamburger"
          style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", flexDirection: "column", gap: "5px" }}
          aria-label="Toggle menu">
          {[0,1,2].map(i => <span key={i} style={{ display: "block", width: "22px", height: "1.5px", background: scrolled ? "#1a1a1a" : "#fff", transition: "background 0.3s" }} />)}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
            style={{
              position: "absolute", top: "60px", left: 0, right: 0,
              background: "rgba(255,255,255,0.97)", backdropFilter: "blur(12px)",
              borderBottom: "1px solid #e8e8e8", padding: "1.5rem 2rem",
              display: "flex", flexDirection: "column", gap: "1.25rem",
            }}>
            {navLinks.map(link => (
              <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)}
                style={{ textDecoration: "none", color: "#1a1a1a", fontSize: "1rem", letterSpacing: "0.05em" }}>
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

function LangToggle({ lang, setLang, scrolled }) {
  const clr = scrolled ? "#555" : "rgba(255,255,255,0.75)";
  const border = scrolled ? "#ddd" : "rgba(255,255,255,0.4)";
  return (
    <button
      onClick={() => setLang(l => l === "en" ? "hu" : "en")}
      style={{
        background: "none", border: `1px solid ${border}`, borderRadius: "2px",
        padding: "3px 8px", fontSize: "0.75rem", letterSpacing: "0.08em",
        cursor: "pointer", color: clr, transition: "all 0.3s",
        fontFamily: "inherit",
      }}
      onMouseOver={e => { e.currentTarget.style.borderColor = scrolled ? "#1a1a1a" : "#fff"; e.currentTarget.style.color = scrolled ? "#1a1a1a" : "#fff"; }}
      onMouseOut={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = clr; }}
    >
      {lang === "en" ? "HU" : "EN"}
    </button>
  );
}

const navLinkStyle = {
  textDecoration: "none", color: "#555",
  fontSize: "0.85rem", letterSpacing: "0.05em", transition: "color 0.2s",
};
