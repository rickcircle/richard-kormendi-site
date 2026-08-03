import { motion } from "framer-motion";
import { fadeUp, staggerContainer, staggerItem } from "../utils/animations";
import { useLang } from "../context/LanguageContext";
import { t } from "../i18n/translations";

const ACCENT = "#c23b3b";

// Egységes sajtó-kártya formátum: { type: {en,hu}, outlet, song, quote: {en,hu}, role: {en,hu}|null, href }
const pressItems = [
  {
    type: { en: "Review", hu: "Kritika" },
    outlet: "Indie Dream",
    song: "Still I Go",
    quote: {
      en: "The vocal moment at 2:42 feels like the push you need to realize there's still so much left to do in life.",
      hu: "A 2:42-es pillanat éneke olyan, mint a lökés, amire szükséged van, hogy ráébredj: még oly sok mindent kell tenned az életben.",
    },
    role: { en: "Max Alegria", hu: "Max Alegria" },
    href: "https://www.indiedream.com.mx/2026/08/richard-kormendi-still-i-go.html",
  },
  {
    type: { en: "Review", hu: "Kritika" },
    outlet: "Kindline Magazine",
    song: "Fall Into You",
    quote: {
      en: "Delivers a cinematic dark-pop release that makes a powerful emotional statement. A hallmark of the track is Richard Körmendi's serious, conscious vocal delivery.",
      hu: "Filmszerű dark-pop kiadás, amely erőteljes érzelmi állásfoglalást fogalmaz meg. A dal egyik védjegye Körmendi Richárd komoly, tudatos énekhangja.",
    },
    role: null,
    href: "https://kindlinemagazine.com/richard-kormendi-takes-loves-deepest-surrender-on-latest-release-fall-into-you/",
  },
  {
    type: { en: "Listener", hu: "Hallgatói vélemény" },
    outlet: "Sagar Kari",
    song: "Fall Into You",
    quote: {
      en: "Fall Into You is a really beautiful song. There's so much pain and emotion in the track, and it comes through in a very raw and genuine way. The song feels unique in its own way, and the overall mood really stays with you. I liked how deeply emotional it feels without trying too hard. Really nice track overall!",
      hu: "A Fall Into You egy igazán gyönyörű dal. Rengeteg fájdalom és érzelem van benne, és ez nagyon nyers és őszinte módon jön át. A dal a maga módján egyedi, és az összhangulat tényleg veled marad. Tetszett, mennyire mélyen érzelmes anélkül, hogy túl erőltetett lenne. Összességében egy nagyon szép szám!",
    },
    role: null,
    href: null,
  },
  {
    type: { en: "Review", hu: "Kritika" },
    outlet: "Expansión Radial",
    song: "You Become My Only",
    quote: {
      en: "The vocal performance is one of the song's strongest elements, blending deep textures with bright, energetic tones — with an excellent balance between heaviness and clarity.",
      hu: "Az énekhang a dal egyik legerősebb eleme — mély textúrák és fényes, energikus tónusok keverednek benne, kiváló egyensúlyban a nyerseség és a tisztaság között.",
    },
    role: { en: "Oliver Zurita", hu: "Oliver Zurita" },
    href: "https://www.expansionradial.mx/richard-kormendi-you-become-my-only-hard-rock/",
  },
  {
    type: { en: "Feature", hu: "Cikk" },
    outlet: "MusicAlive.net",
    song: "Cold Urban Sighs",
    quote: {
      en: "Richard Körmendi's “Cold Urban Sighs” is a standout release — cinematic textures, raw emotion, and a voice that demands attention.",
      hu: "Körmendi Richárd „Cold Urban Sighs” című dala kiemelkedő megjelenés — filmszerű hangzás, nyers érzelmek és egy hang, amit lehetetlen figyelmen kívül hagyni.",
    },
    role: null,
    href: "https://musicalive.net/richard-kormendi-cold-urban-sighs/",
  },
  {
    type: { en: "Radio", hu: "Rádió" },
    outlet: "Tony Michaelides Show",
    song: null,
    quote: {
      en: "International radio play — featured on the Tony Michaelides Show, broadcast worldwide.",
      hu: "Nemzetközi rádiós lejátszás — a Tony Michaelides Show-ban hangzott el, világszerte sugározva.",
    },
    role: null,
    href: null,
  },
  {
    type: { en: "Playlist", hu: "Playlist" },
    outlet: "Nosso Som",
    song: "Enthralling",
    quote: {
      en: "Playlist feature — 40.9k followers.",
      hu: "Playlist szereplés — 40,9 ezer követő.",
    },
    role: null,
    href: "https://nossosom77.wixsite.com/nossosom/post/enthralling-mergulha-na-obsessão-com-intensidade-e-transforma-tensão-em-linguagem-sonora",
  },
];

export default function Press() {
  const { lang } = useLang();
  const tx = t[lang].press;

  return (
    <section id="press" style={{ padding: "8rem 2rem", background: "#0b0a08" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
          style={{ marginBottom: "3rem" }}>
          <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: ACCENT, textTransform: "uppercase", marginBottom: "1.5rem", textShadow: "0 0 16px rgba(194, 59, 59,0.3)" }}>
            {tx.label}
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 600, lineHeight: 1.2, color: "#f5f1ea" }}>
            {tx.heading}
          </h2>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
          className="press-grid">
          {pressItems.map((item, i) => {
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
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <span style={{
                    display: "inline-block", width: "fit-content",
                    fontSize: "0.65rem", letterSpacing: "0.08em", color: ACCENT,
                    textTransform: "uppercase", fontWeight: 700,
                    border: "1px solid rgba(194, 59, 59,0.35)", borderRadius: "999px",
                    padding: "3px 10px",
                  }}>
                    {item.type[lang]}
                  </span>
                  {item.song && (
                    <span style={{
                      display: "inline-block", width: "fit-content",
                      fontSize: "0.65rem", letterSpacing: "0.08em", color: "#fff",
                      textTransform: "uppercase", fontWeight: 700,
                      background: ACCENT, borderRadius: "999px",
                      padding: "3px 10px",
                    }}>
                      🎵 {item.song}
                    </span>
                  )}
                </div>

                <p style={{ margin: 0, fontWeight: 600, fontSize: "1.1rem", color: "#f5f1ea" }}>
                  {item.outlet}
                </p>

                <p style={{ margin: 0, fontSize: "0.9rem", color: "rgba(245,241,234,0.65)", lineHeight: 1.6, fontStyle: "italic" }}>
                  “{item.quote[lang]}”
                </p>

                {item.role && (
                  <p style={{ margin: 0, fontSize: "0.78rem", color: "rgba(245,241,234,0.4)" }}>
                    — {item.role[lang]}
                  </p>
                )}

                {item.href && (
                  <span style={{
                    marginTop: "auto", paddingTop: "0.5rem",
                    fontSize: "0.78rem", letterSpacing: "0.06em",
                    color: "rgba(245,241,234,0.6)",
                  }}>
                    {lang === "hu" ? "Teljes cikk →" : "Read full article →"}
                  </span>
                )}
              </Tag>
            );
          })}
        </motion.div>
      </div>
      <style>{`
        .press-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
        }
      `}</style>
    </section>
  );
}
