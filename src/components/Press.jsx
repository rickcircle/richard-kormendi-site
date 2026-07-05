import { motion } from "framer-motion";
import { fadeUp, staggerContainer, staggerItem } from "../utils/animations";
import { useLang } from "../context/LanguageContext";
import { t } from "../i18n/translations";

const ACCENT = "#e8963a";

// Kurátori visszajelzés hozzáadásához: { quote: { en, hu }, author, role: { en, hu } }
// Sima sajtómegjelenéshez: { type, outlet, desc, href }
const pressItems = [
  {
    type:    { en: "Feature",  hu: "Cikk" },
    outlet:  "MusicAlive.net",
    desc:    { en: "Featured artist — Cold Urban Sighs", hu: "Kiemelt előadó — Cold Urban Sighs" },
    href:    "https://musicalive.net/richard-kormendi-cold-urban-sighs/",
  },
  {
    type:    { en: "Radio",    hu: "Rádió" },
    outlet:  "Tony Michaelides Show",
    desc:    { en: "Radio play — international broadcast", hu: "Rádiós sugárzás — nemzetközi adásban" },
    href:    null,
  },
  {
    type:    { en: "Playlist", hu: "Playlist" },
    outlet:  "Nosso Som",
    desc:    { en: "Playlist feature — 40.9k followers", hu: "Playlist szereplés — 40,9 ezer követő" },
    href:    "https://nossosom77.wixsite.com/nossosom/post/enthralling-mergulha-na-obsessão-com-intensidade-e-transforma-tensão-em-linguagem-sonora",
  },
];

export default function Press() {
  const { lang } = useLang();
  const tx = t[lang].press;

  const quotes = pressItems.filter(item => item.quote);
  const mentions = pressItems.filter(item => !item.quote);

  return (
    <section id="press" style={{ padding: "8rem 2rem", background: "#0b0a08" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
          style={{ marginBottom: "3rem" }}>
          <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: ACCENT, textTransform: "uppercase", marginBottom: "1.5rem", textShadow: "0 0 16px rgba(232,150,58,0.3)" }}>
            {tx.label}
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 600, lineHeight: 1.2, color: "#f5f1ea" }}>
            {tx.heading}
          </h2>
        </motion.div>

        {/* Kurátori idézetek — kiemelt pull-quote kártyák */}
        {quotes.length > 0 && (
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
            style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "3rem" }}>
            {quotes.map((item, i) => (
              <motion.div key={i} variants={staggerItem}
                style={{
                  position: "relative",
                  padding: "2rem 2rem 2rem 2.5rem",
                  borderLeft: `3px solid ${ACCENT}`,
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "0 6px 6px 0",
                }}>
                <span style={{
                  position: "absolute", top: "0.75rem", left: "1.1rem",
                  fontSize: "3rem", fontFamily: "Georgia, serif", lineHeight: 1,
                  color: "rgba(232,150,58,0.25)", userSelect: "none",
                }}>
                  "
                </span>
                <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "#f5f1ea", fontStyle: "italic", margin: "0 0 1rem", position: "relative" }}>
                  {item.quote[lang]}
                </p>
                <p style={{ fontSize: "0.8rem", color: "rgba(245,241,234,0.5)", margin: 0 }}>
                  — <span style={{ color: "#f5f1ea", fontWeight: 500 }}>{item.author}</span>
                  {item.role && <span>, {item.role[lang]}</span>}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Egyszerű sajtómegjelenések — kompakt lista */}
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
          style={{ display: "flex", flexDirection: "column" }}>
          {mentions.map((item, i) => (
            <motion.div key={i} variants={staggerItem}
              className="press-item"
              style={{
                display: "grid",
                gridTemplateColumns: "90px 1fr auto",
                alignItems: "center",
                gap: "1.5rem",
                padding: "1.5rem 0",
                borderBottom: i < mentions.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
              }}>
              <span style={{
                display: "inline-block", width: "fit-content",
                fontSize: "0.65rem", letterSpacing: "0.08em", color: "rgba(245,241,234,0.5)",
                textTransform: "uppercase", fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.15)", borderRadius: "999px",
                padding: "3px 10px",
              }}>
                {item.type[lang]}
              </span>
              <div>
                <p style={{ margin: 0, fontWeight: 500, fontSize: "0.95rem", color: "#f5f1ea" }}>
                  {item.outlet}
                </p>
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.82rem", color: "rgba(245,241,234,0.45)" }}>
                  {item.desc[lang]}
                </p>
              </div>
              {item.href ? (
                <a href={item.href} target="_blank" rel="noreferrer"
                  style={{
                    fontSize: "0.78rem", letterSpacing: "0.08em", color: "rgba(245,241,234,0.45)",
                    textDecoration: "none", whiteSpace: "nowrap",
                    transition: "color 0.2s",
                  }}
                  onMouseOver={e => e.currentTarget.style.color = ACCENT}
                  onMouseOut={e => e.currentTarget.style.color = "rgba(245,241,234,0.45)"}>
                  {lang === "hu" ? "Megtekintés →" : "Read →"}
                </a>
              ) : (
                <span style={{ fontSize: "0.78rem", color: "rgba(245,241,234,0.25)", whiteSpace: "nowrap" }}>
                  {lang === "hu" ? "Archívum" : "Archive"}
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
      <style>{`
        @media (max-width: 520px) {
          .press-item {
            grid-template-columns: 1fr !important;
            gap: 0.4rem !important;
          }
          .press-item > span:first-child {
            margin-bottom: 0.3rem;
          }
        }
      `}</style>
    </section>
  );
}
