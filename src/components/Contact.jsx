import { motion } from "framer-motion";
import { fadeUp } from "../utils/animations";
import { useLang } from "../context/LanguageContext";
import { t } from "../i18n/translations";

const socials = [
  { label: "YouTube", href: "https://www.youtube.com/@richardkormendi6379" },
  { label: "Instagram", href: "https://www.instagram.com/rickormendi/" },
  { label: "Spotify", href: "https://open.spotify.com/artist/5UW4cZ0M83TG2nJWYvkVkp" },
];

export default function Contact() {
  const { lang } = useLang();
  const tx = t[lang].contact;

  return (
    <section id="contact" style={{ background: "#1a1a1a", color: "#fff", padding: "8rem 2rem", textAlign: "center" }}>
      <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}>
        <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#555", textTransform: "uppercase", marginBottom: "2rem" }}>
          {tx.label}
        </p>
        <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 600, marginBottom: "1.5rem", color: "#fff" }}>
          {tx.heading}
        </h2>
        <p style={{ fontSize: "1rem", color: "#666", marginBottom: "2.5rem", lineHeight: 1.7 }}>
          {tx.body}
        </p>

        <a href="mailto:richard.kormendi@gmail.com"
          style={{ display: "inline-block", fontSize: "clamp(1rem, 2.5vw, 1.3rem)", color: "#fff", textDecoration: "none", borderBottom: "1px solid #444", paddingBottom: "4px", marginBottom: "3.5rem", transition: "border-color 0.2s" }}
          onMouseOver={e => { e.currentTarget.style.borderColor = "#fff"; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = "#444"; }}>
          richard.kormendi@gmail.com
        </a>

        <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
          {socials.map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
              style={{ fontSize: "0.85rem", letterSpacing: "0.08em", color: "#888", textDecoration: "none", transition: "color 0.2s" }}
              onMouseOver={e => e.currentTarget.style.color = "#fff"}
              onMouseOut={e => e.currentTarget.style.color = "#888"}>
              {s.label}
            </a>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
