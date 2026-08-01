import { motion } from "framer-motion";
import { fadeUp, staggerContainer, staggerItem } from "../utils/animations";
import { useLang } from "../context/LanguageContext";
import { t } from "../i18n/translations";

const ACCENT = "#c23b3b";

// Kurátori visszajelzés hozzáadásához: { quote: { en, hu }, author, song, role: { en, hu }, href? }
// Sima sajtómegjelenéshez: { type, outlet, desc, href }
const pressItems = [
  {
    quote: {
      en: "Delivers a cinematic dark-pop release that makes a powerful emotional statement. A hallmark of the track is Richard Körmendi's serious, conscious vocal delivery.",
      hu: "Filmszerű dark-pop kiadás, amely erőteljes érzelmi állásfoglalást fogalmaz meg. A dal egyik védjegye Körmendi Richárd komoly, tudatos énekhangja.",
    },
    author: "Kindline Magazine",
    song: "Fall Into You",
    role: { en: "Review", hu: "Kritika" },
    href: "https://kindlinemagazine.com/richard-kormendi-takes-loves-deepest-surrender-on-latest-release-fall-into-you/",
  },
  {
    quote: {
      en: "Fall Into You is a really beautiful song. There's so much pain and emotion in the track, and it comes through in a very raw and genuine way. The song feels unique in its own way, and the overall mood really stays with you. I liked how deeply emotional it feels without trying too hard. Really nice track overall!",
      hu: "A Fall Into You egy igazán gyönyörű dal. Rengeteg fájdalom és érzelem van benne, és ez nagyon nyers és őszinte módon jön át. A dal a maga módján egyedi, és az összhangulat tényleg veled marad. Tetszett, mennyire mélyen érzelmes anélkül, hogy túl erőltetett lenne. Összességében egy nagyon szép szám!",
    },
    author: "Sagar Kari",
    song: "Fall Into You",
    role: null,
    href: null,
  },
  {
    quote: {
      en: "The vocal performance is one of the song's strongest elements, blending deep textures with bright, energetic tones — with an excellent balance between heaviness and clarity.",
      hu: "Az énekhang a dal egyik legerősebb eleme — mély textúrák és fényes, energikus tónusok keverednek benne, kiváló egyensúlyban a nyerseség és a tisztaság között.",
    },
    author: "Expansión Radial",
    song: "You Become My Only",
    role: { en: "Oliver Zurita", hu: "Oliver Zurita" },
    href: "https://www.expansionradial.mx/richard-kormendi-you-become-my-only-hard-rock/",
  },
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
    desc:    { en: "Playlist feature — “Enthralling”, 40.9k followers", hu: "Playlist szereplés — „Enthralling”, 40,9 ezer követő" },
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
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
          style={{ marginBottom: "3rem" }}>
          <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: ACCENT, textTransform: "uppercase", marginBottom: "1.5rem", textShadow: "0 0 16px rgba(194, 59, 59,0.3)" }}>
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
                  color: "rgba(194, 59, 59,0.25)", userSelect: "none",
                }}>
                  "
                </span>
                {item.song && (
                  <span style={{
                    display: "inline-block", width: "fit-content",
                    fontSize: "0.65rem", letterSpacing: "0.08em", color: "#fff",
                    textTransform: "uppercase", fontWeight: 700,
                    background: ACCENT, borderRadius: "999px",
                    padding: "3px 10px", marginBottom: "0.85rem",
                  }}>
                    🎵 {item.song}
                  </span>
                )}
                <p style={{ fontSize: "1.05rem", lineHeight: 1.7, color: "#f5f1ea", fontStyle: "italic", margin: "0 0 1rem", position: "relative" }}>
                  {item.quote[lang]}
                </p>
                <p style={{ fontSize: "0.8rem", color: "rgba(245,241,234,0.5)", margin: 0 }}>
                  — <span style={{ color: "#f5f1ea", fontWeight: 500 }}>{item.author}</span>
                  {item.role && <span>, {item.role[lang]}</span>}
                </p>
                {item.href && (
                  <a href={item.href} target="_blank" rel="noreferrer"
                    style={{ display: "inline-block", marginTop: "0.85rem", fontSize: "0.78rem", letterSpacing: "0.06em", color: ACCENT, textDecoration: "none" }}>
                    {lang === "hu" ? "Teljes kritika →" : "Read full review →"}
                  </a>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Sajtómegjelenések — kártyás rács */}
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
          className="press-grid">
          {mentions.map((item, i) => {
            const Tag = item.href ? motion.a : motion.div;
            return (
              <Tag key={i} variants={staggerItem}
                {...(item.href ? { href: item.href, target: "_blank", rel: "noreferrer" } : {})}
                className="press-card"
                style={{
                  display: "flex", flexDirection: "column", gap: "0.85rem",
                  padding: "1.75rem",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "10px",
                  background: "rgba(255,255,255,0.03)",
                  textDecoration: "none",
                  transition: "border-color 0.2s, background 0.2s",
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(194, 59, 59,0.4)"; e.currentTarget.style.background = "rgba(194, 59, 59,0.05)"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
              >
                <span style={{
                  display: "inline-block", width: "fit-content",
                  fontSize: "0.65rem", letterSpacing: "0.08em", color: ACCENT,
                  textTransform: "uppercase", fontWeight: 700,
                  border: `1px solid rgba(194, 59, 59,0.35)`, borderRadius: "999px",
                  padding: "3px 10px",
                }}>
                  {item.type[lang]}
                </span>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "1.1rem", color: "#f5f1ea" }}>
                    {item.outlet}
                  </p>
                  <p style={{ margin: "0.35rem 0 0", fontSize: "0.85rem", color: "rgba(245,241,234,0.5)", lineHeight: 1.5 }}>
                    {item.desc[lang]}
                  </p>
                </div>
                <span style={{
                  marginTop: "auto", paddingTop: "0.5rem",
                  fontSize: "0.78rem", letterSpacing: "0.06em",
                  color: item.href ? "rgba(245,241,234,0.6)" : "rgba(245,241,234,0.25)",
                }}>
                  {item.href ? (lang === "hu" ? "Megtekintés →" : "Read →") : (lang === "hu" ? "Archívum" : "Archive")}
                </span>
              </Tag>
            );
          })}
        </motion.div>
      </div>
      <style>{`
        .press-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.25rem;
        }
      `}</style>
    </section>
  );
}
