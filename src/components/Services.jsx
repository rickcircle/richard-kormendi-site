import { motion } from "framer-motion";
import { fadeUp, staggerContainer, staggerItem } from "../utils/animations";
import { useLang } from "../context/LanguageContext";
import { t } from "../i18n/translations";
import MagneticLink from "./MagneticLink";

export default function Services() {
  const { lang } = useLang();
  const tx = t[lang].services;

  return (
    <section id="digital" style={{ padding: "8rem 2rem", background: "#faf7f2" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}>
          <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#e8963a", textTransform: "uppercase", marginBottom: "2rem" }}>
            {tx.label}
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 600, lineHeight: 1.2, marginBottom: "1rem" }}>
            {tx.heading}
          </h2>
          <p style={{ fontSize: "1.1rem", lineHeight: 1.8, color: "#444", marginBottom: "4rem", maxWidth: "560px" }}>
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
                padding: "2rem", border: pkg.highlight ? "1px solid #1a1a1a" : "1px solid #e0e0e0",
                borderRadius: "2px", background: pkg.highlight ? "#1a1a1a" : "#fff",
                color: pkg.highlight ? "#fff" : "#1a1a1a",
                display: "flex", flexDirection: "column", gap: "1.25rem",
              }}>
              <div>
                <p style={{ fontSize: "0.75rem", letterSpacing: "0.12em", color: pkg.highlight ? "#888" : "#999", textTransform: "uppercase", margin: "0 0 0.5rem" }}>
                  {pkg.name}
                </p>
                <p style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
                  {pkg.price}
                </p>
              </div>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.6, color: pkg.highlight ? "#aaa" : "#666", margin: 0 }}>
                {pkg.desc}
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {pkg.items.map(item => (
                  <li key={item} style={{ fontSize: "0.85rem", color: pkg.highlight ? "#ccc" : "#555", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                    <span style={{ color: pkg.highlight ? "#666" : "#bbb", flexShrink: 0 }}>—</span>
                    {item}
                  </li>
                ))}
              </ul>
              <MagneticLink href="#contact"
                style={{ marginTop: "auto", display: "inline-block", padding: "0.7rem 1.25rem", border: `1px solid ${pkg.highlight ? "#555" : "#ccc"}`, borderRadius: "2px", textDecoration: "none", fontSize: "0.85rem", letterSpacing: "0.05em", color: pkg.highlight ? "#fff" : "#1a1a1a", textAlign: "center", transition: "background 0.2s, color 0.2s" }}
                onMouseOver={e => { e.currentTarget.style.background = pkg.highlight ? "#fff" : "#1a1a1a"; e.currentTarget.style.color = pkg.highlight ? "#1a1a1a" : "#fff"; }}
                onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = pkg.highlight ? "#fff" : "#1a1a1a"; }}>
                {tx.cta}
              </MagneticLink>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
