import { motion } from "framer-motion";
import { fadeUp, staggerContainer, staggerItem } from "../utils/animations";
import { useLang } from "../context/LanguageContext";
import { t } from "../i18n/translations";
import { track } from "../utils/track";

const ACCENT = "#d16b63";
// Erősebb, telítettebb piros — kizárólag a kiemelt (legfontosabb) elemekhez, hogy
// tényleg elváljon a mindenhol használt lágyabb alap-pirostól.
const ACCENT_STRONG = "#e8342b";

// Egységes sajtó-kártya formátum: { type: {en,hu}, outlet, song, quote: {en,hu}, role: {en,hu}|null, href }
const pressItems = [
  {
    type: { en: "Review", hu: "Kritika" },
    outlet: "Ok Music Play",
    song: "You Become My Only",
    quote: {
      en: "The vocalist's expressive voice explodes into an intense chorus whose timbre recalls Serj Tankian, of System of a Down.",
      hu: "Az énekes kifejező hangja egy intenzív refrénben tör elő, melynek timbre-je Serj Tankianra, a System of a Down frontemberére emlékeztet.",
    },
    role: { en: "Lucas Henrique dos Santos", hu: "Lucas Henrique dos Santos" },
    href: "https://okmusicplay.com/2026/08/10/guia-de-descobertas-colepitz-ambimatix/",
  },
  {
    type: { en: "Feature", hu: "Cikk" },
    outlet: "Shock!",
    song: "My Burning Devotion",
    quote: {
      en: "Featured the release of “My Burning Devotion,” together with Richard's own reflection on returning to his rock roots after years of classical vocal training.",
      hu: "Bemutatta a „My Burning Devotion” megjelenését, Richárd saját visszatekintésével arra, hogyan tért vissza rock gyökereihez évek klasszikus énekképzése után.",
    },
    role: null,
    href: "https://www.shockmagazin.hu/ar/richard-kormendi-my-burning-devotion",
  },
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

// Az első elem a "szuper cikk" — teljes szélességű, kiemelt kártya, mindenki más fölött.
// A rá következő 2 elem a másodlagos, kiemelt (de kisebb) kártya, a többi a kompakt rácsban.
const HERO_COUNT = 1;
const SECONDARY_COUNT = 2;

export default function Press() {
  const { lang } = useLang();
  const tx = t[lang].press;
  const hero = pressItems[0];
  const secondary = pressItems.slice(HERO_COUNT, HERO_COUNT + SECONDARY_COUNT);
  const rest = pressItems.slice(HERO_COUNT + SECONDARY_COUNT);

  return (
    <section id="press" style={{ padding: "8rem 2rem", background: "#0b0a08" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
          style={{ marginBottom: "3rem" }}>
          <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: ACCENT, textTransform: "uppercase", marginBottom: "1.5rem", textShadow: "0 0 16px rgba(209, 107, 99,0.3)" }}>
            {tx.label}
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 600, lineHeight: 1.2, marginBottom: "0.85rem", color: "#f5f1ea" }}>
            {tx.heading}
          </h2>
          <p style={{ fontSize: "0.9rem", color: "rgba(245,241,234,0.45)" }}>
            🎙️ {pressItems.length} {lang === "hu" ? "sajtómegjelenés — és egyre több" : "press features — and counting"}
          </p>
        </motion.div>

        {/* Szuper cikk — egyetlen, teljes szélességű kártya, a legnagyobb vizuális hangsúllyal */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
          style={{ marginBottom: "1.75rem" }}>
          {(() => {
            const item = hero;
            const Tag = item.href ? motion.a : motion.div;
            return (
              <Tag
                {...(item.href ? { href: item.href, target: "_blank", rel: "noreferrer", onClick: () => track("click", { label: `press_hero: ${item.outlet}` }) } : {})}
                style={{
                  position: "relative", display: "block", overflow: "hidden",
                  padding: "3rem clamp(2rem, 6vw, 4.5rem)",
                  border: `1px solid rgba(232, 52, 43, 0.5)`,
                  borderRadius: "18px",
                  background: "linear-gradient(135deg, rgba(232, 52, 43, 0.16), rgba(255,255,255,0.02))",
                  boxShadow: "0 0 70px rgba(232, 52, 43, 0.3)",
                  textDecoration: "none",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 70px rgba(232, 52, 43, 0.4)"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 70px rgba(232, 52, 43, 0.3)"; }}
              >
                <span style={{
                  position: "absolute", top: "1rem", left: "1.5rem",
                  fontSize: "7rem", fontFamily: "Georgia, serif", lineHeight: 1,
                  color: "rgba(232, 52, 43, 0.22)", userSelect: "none",
                }}>
                  “
                </span>

                <p style={{
                  position: "relative", margin: "0 0 1.25rem", fontSize: "0.7rem",
                  letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 700,
                  color: ACCENT_STRONG,
                }}>
                  ★ {lang === "hu" ? "Kiemelt kritika" : "Top Press Quote"}
                </p>

                <div style={{ position: "relative", display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.1rem" }}>
                  <TypeBadge strong>{item.type[lang]}</TypeBadge>
                </div>

                {item.song && (
                  <p style={{
                    position: "relative", margin: "0 0 1.25rem",
                    fontSize: "clamp(1.6rem, 4.5vw, 2.6rem)", fontWeight: 800,
                    lineHeight: 1.1, letterSpacing: "-0.01em", color: "#fff",
                  }}>
                    🎵 {item.song}
                  </p>
                )}

                <p style={{ position: "relative", margin: "0 0 1.25rem", fontSize: "clamp(1.15rem, 2.2vw, 1.45rem)", lineHeight: 1.6, color: "#f5f1ea", fontStyle: "italic" }}>
                  “{item.quote[lang]}”
                </p>

                <p style={{ position: "relative", margin: 0, fontSize: "0.9rem", color: "rgba(245,241,234,0.55)" }}>
                  — <span style={{ color: "#f5f1ea", fontWeight: 600 }}>{item.outlet}</span>
                  {item.role && <span>, {item.role[lang]}</span>}
                </p>

                {item.href && (
                  <span style={{ position: "relative", display: "inline-block", marginTop: "1.25rem", fontSize: "0.85rem", letterSpacing: "0.06em", color: ACCENT_STRONG, fontWeight: 600 }}>
                    {lang === "hu" ? "Teljes cikk →" : "Read full article →"}
                  </span>
                )}
              </Tag>
            );
          })()}
        </motion.div>

        {/* Másodlagos megjelenések — nagyobb, feltűnőbb kártyák a szuper cikk alatt */}
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
          className="press-featured-grid" style={{ marginBottom: "1.25rem" }}>
          {secondary.map((item, i) => {
            const Tag = item.href ? motion.a : motion.div;
            return (
              <Tag key={i} variants={staggerItem}
                {...(item.href ? { href: item.href, target: "_blank", rel: "noreferrer", onClick: () => track("click", { label: `press: ${item.outlet}` }) } : {})}
                style={{
                  position: "relative",
                  display: "flex", flexDirection: "column", gap: "1rem",
                  padding: "2.25rem 2.25rem 2.25rem 2.75rem",
                  border: "1px solid rgba(232, 52, 43, 0.4)",
                  borderLeft: `5px solid ${ACCENT_STRONG}`,
                  borderRadius: "0 12px 12px 0",
                  background: "linear-gradient(135deg, rgba(232, 52, 43, 0.12), rgba(255,255,255,0.03))",
                  boxShadow: "0 0 44px rgba(232, 52, 43, 0.22)",
                  textDecoration: "none",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 44px rgba(232, 52, 43, 0.32)"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 0 44px rgba(232, 52, 43, 0.22)"; }}
              >
                <span style={{
                  position: "absolute", top: "0.9rem", left: "1.15rem",
                  fontSize: "3.5rem", fontFamily: "Georgia, serif", lineHeight: 1,
                  color: "rgba(232, 52, 43, 0.35)", userSelect: "none",
                }}>
                  “
                </span>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <TypeBadge strong>{item.type[lang]}</TypeBadge>
                  {item.song && <SongBadge strong>🎵 {item.song}</SongBadge>}
                </div>

                <p style={{ margin: 0, fontSize: "1.2rem", lineHeight: 1.65, color: "#f5f1ea", fontStyle: "italic", position: "relative" }}>
                  “{item.quote[lang]}”
                </p>

                <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(245,241,234,0.5)" }}>
                  — <span style={{ color: "#f5f1ea", fontWeight: 600 }}>{item.outlet}</span>
                  {item.role && <span>, {item.role[lang]}</span>}
                </p>

                {item.href && (
                  <span style={{ fontSize: "0.8rem", letterSpacing: "0.06em", color: ACCENT_STRONG, fontWeight: 600 }}>
                    {lang === "hu" ? "Teljes cikk →" : "Read full article →"}
                  </span>
                )}
              </Tag>
            );
          })}
        </motion.div>

        {/* További megjelenések — kompakt rács */}
        {rest.length > 0 && (
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
            className="press-grid">
            {rest.map((item, i) => {
              const Tag = item.href ? motion.a : motion.div;
              return (
                <Tag key={i} variants={staggerItem}
                  {...(item.href ? { href: item.href, target: "_blank", rel: "noreferrer", onClick: () => track("click", { label: `press: ${item.outlet}` }) } : {})}
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
                  onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(209, 107, 99,0.4)"; e.currentTarget.style.background = "rgba(209, 107, 99,0.05)"; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                >
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <TypeBadge outline>{item.type[lang]}</TypeBadge>
                    {item.song && <SongBadge>🎵 {item.song}</SongBadge>}
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
        )}
      </div>
      <style>{`
        .press-featured-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }
        .press-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.25rem;
        }
        @media (max-width: 760px) {
          .press-featured-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}

function TypeBadge({ children, strong }) {
  const color = strong ? ACCENT_STRONG : ACCENT;
  return (
    <span style={{
      display: "inline-block", width: "fit-content",
      fontSize: "0.65rem", letterSpacing: "0.08em", color,
      textTransform: "uppercase", fontWeight: 700,
      border: `1px solid ${strong ? "rgba(232, 52, 43, 0.5)" : "rgba(209, 107, 99,0.35)"}`,
      borderRadius: "999px",
      padding: "3px 10px",
    }}>
      {children}
    </span>
  );
}

function SongBadge({ children, strong }) {
  return (
    <span style={{
      display: "inline-block", width: "fit-content",
      fontSize: "0.65rem", letterSpacing: "0.08em", color: "#fff",
      textTransform: "uppercase", fontWeight: 700,
      background: strong ? ACCENT_STRONG : ACCENT, borderRadius: "999px",
      padding: "3px 10px",
    }}>
      {children}
    </span>
  );
}
