import { motion } from "framer-motion";
import { fadeUp, staggerContainer, staggerItem } from "../utils/animations";
import { useLang } from "../context/LanguageContext";
import { t } from "../i18n/translations";
import MagneticLink from "./MagneticLink";

const ACCENT = "#e8963a";

export default function Services() {
  const { lang } = useLang();
  const tx = t[lang].services;

  return (
    <section id="digital" style={{ padding: "8rem 2rem", background: "#0b0a08" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}>
          <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: ACCENT, textTransform: "uppercase", marginBottom: "2rem", textShadow: "0 0 16px rgba(232,150,58,0.3)" }}>
            {tx.label}
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 600, lineHeight: 1.2, marginBottom: "1rem", color: "#f5f1ea" }}>
            {tx.heading}
          </h2>
          <p style={{ fontSize: "1.1rem", lineHeight: 1.8, color: "rgba(245,241,234,0.65)", marginBottom: "4rem", maxWidth: "560px" }}>
            {tx.body}
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.5rem" }}>
          {tx.packages.map((pkg) => (
            <motion.div key={pkg.name}
              variants={staggerItem}
              style={{
                padding: "2rem",
                border: pkg.highlight ? `1px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.08)",
                borderRadius: "2px",
                background: pkg.highlight ? "#1c1814" : "rgba(255,255,255,0.03)",
                color: "#f5f1ea",
                boxShadow: pkg.highlight ? "0 0 30px rgba(232,150,58,0.15)" : "none",
                display: "flex", flexDirection: "column", gap: "1.25rem",
              }}>
              <div>
                <p style={{ fontSize: "0.75rem", letterSpacing: "0.12em", color: "rgba(245,241,234,0.5)", textTransform: "uppercase", margin: "0 0 0.5rem" }}>
                  {pkg.name}
                </p>
                <p style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
                  {pkg.price}
                </p>
              </div>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.6, color: "rgba(245,241,234,0.6)", margin: 0 }}>
                {pkg.desc}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {pkg.items.map(item => (
                  <li key={item} style={{ fontSize: "0.85rem", color: "rgba(245,241,234,0.7)", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                    <span style={{ color: "rgba(245,241,234,0.3)", flexShrink: 0 }}>—</span>
                    {item}
                  </li>
                ))}
              </ul>
              <MagneticLink href="#contact"
                style={{ marginTop: "auto", display: "inline-block", padding: "0.7rem 1.25rem", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "2px", textDecoration: "none", fontSize: "0.85rem", letterSpacing: "0.05em", color: "#f5f1ea", textAlign: "center", transition: "background 0.2s, color 0.2s, border-color 0.2s" }}
                onMouseOver={e => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = ACCENT; }}
                onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#f5f1ea"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}>
                {tx.cta}
              </MagneticLink>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
