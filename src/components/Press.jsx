import { motion } from "framer-motion";
import { fadeUp, staggerContainer, staggerItem } from "../utils/animations";
import { useLang } from "../context/LanguageContext";
import { t } from "../i18n/translations";

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

  return (
    <section id="press" style={{ padding: "8rem 2rem", background: "#faf7f2" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
          style={{ marginBottom: "3rem" }}>
          <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#e8963a", textTransform: "uppercase", marginBottom: "1.5rem" }}>
            {tx.label}
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 600, lineHeight: 1.2 }}>
            {tx.heading}
          </h2>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
          style={{ display: "flex", flexDirection: "column" }}>
          {pressItems.map((item, i) => (
            <motion.div key={i} variants={staggerItem}
              className="press-item"
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr auto",
                alignItems: "center",
                gap: "1.5rem",
                padding: "1.5rem 0",
                borderBottom: i < pressItems.length - 1 ? "1px solid #f0f0f0" : "none",
              }}>
              <span style={{
                fontSize: "0.7rem", letterSpacing: "0.12em", color: "#ccc",
                textTransform: "uppercase", fontWeight: 500,
              }}>
                {item.type[lang]}
              </span>
              <div>
                <p style={{ margin: 0, fontWeight: 500, fontSize: "0.95rem", color: "#1a1a1a" }}>
                  {item.outlet}
                </p>
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.82rem", color: "#aaa" }}>
                  {item.desc[lang]}
                </p>
              </div>
              {item.href ? (
                <a href={item.href} target="_blank" rel="noreferrer"
                  style={{
                    fontSize: "0.78rem", letterSpacing: "0.08em", color: "#bbb",
                    textDecoration: "none", whiteSpace: "nowrap",
                    transition: "color 0.2s",
                  }}
                  onMouseOver={e => e.currentTarget.style.color = "#1a1a1a"}
                  onMouseOut={e => e.currentTarget.style.color = "#bbb"}>
                  {lang === "hu" ? "Megtekintés →" : "Read →"}
                </a>
              ) : (
                <span style={{ fontSize: "0.78rem", color: "#ddd", whiteSpace: "nowrap" }}>
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
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
