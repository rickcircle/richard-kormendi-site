import { motion } from "framer-motion";
import { fadeUp, staggerContainer, staggerItem } from "../utils/animations";
import { useLang } from "../context/LanguageContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { track } from "../utils/track";

// Ez az oldal NEM jelenik meg a navigációban — bookereknek / sajtónak szól
// Direct URL: /epk

import photoStudio    from "../assets/images/photo-golden-hour.jpg";
import photoBar       from "../assets/images/photo-bar-suit.jpg";
import photoGuitarist from "../assets/images/photo-guitarist.jpg";
import photoSession   from "../assets/images/photo-studio-portrait.jpg";

const ACCENT = "#d16b63";
const BG_1 = "#0b0a08";
const BG_2 = "#1f1113";
const CARD_BG = "#2b171a";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#f5f1ea";

const pressItems = [
  {
    outlet: "Indie Dream",
    quote: "“The vocal moment at 2:42 feels like the push you need to realize there's still so much left to do in life.”",
    quoteHu: "„A 2:42-es pillanat éneke olyan, mint a lökés, amire szükséged van, hogy ráébredj: még oly sok mindent kell tenned az életben.”",
    type: { en: "Review", hu: "Kritika" },
    song: "Still I Go",
    url: "https://www.indiedream.com.mx/2026/08/richard-kormendi-still-i-go.html",
  },
  {
    outlet: "Kindline Magazine",
    quote: "“Delivers a cinematic dark-pop release that makes a powerful emotional statement. A hallmark of the track is Richard Körmendi's serious, conscious vocal delivery.”",
    quoteHu: "„Filmszerű dark-pop kiadás, amely erőteljes érzelmi állásfoglalást fogalmaz meg. A dal egyik védjegye Körmendi Richárd komoly, tudatos énekhangja.”",
    type: { en: "Review", hu: "Kritika" },
    song: "Fall Into You",
    url: "https://kindlinemagazine.com/richard-kormendi-takes-loves-deepest-surrender-on-latest-release-fall-into-you/",
  },
  {
    outlet: "Sagar Kari",
    quote: "“Fall Into You is a really beautiful song. There's so much pain and emotion in the track, and it comes through in a very raw and genuine way. The song feels unique in its own way, and the overall mood really stays with you. I liked how deeply emotional it feels without trying too hard. Really nice track overall!”",
    quoteHu: "„A Fall Into You egy igazán gyönyörű dal. Rengeteg fájdalom és érzelem van benne, és ez nagyon nyers és őszinte módon jön át. A dal a maga módján egyedi, és az összhangulat tényleg veled marad. Tetszett, mennyire mélyen érzelmes anélkül, hogy túl erőltetett lenne. Összességében egy nagyon szép szám!”",
    type: { en: "Listener", hu: "Hallgatói vélemény" },
    song: "Fall Into You",
    url: null,
  },
  {
    outlet: "Expansión Radial",
    quote: "“The vocal performance is one of the song's strongest elements, blending deep textures with bright, energetic tones,” with “an excellent balance between heaviness and clarity.”",
    quoteHu: "„Az énekhang a dal egyik legerősebb eleme — mély textúrák és fényes, energikus tónusok keverednek benne”, kiváló egyensúlyban „a nyerseség és a tisztaság között”.",
    type: { en: "Review", hu: "Kritika" },
    song: "You Become My Only",
    url: "https://www.expansionradial.mx/richard-kormendi-you-become-my-only-hard-rock/",
  },
  {
    outlet: "MusicAlive.net",
    quote: "Richard Körmendi's “Cold Urban Sighs” is a standout release — cinematic textures, raw emotion, and a voice that demands attention.",
    quoteHu: "Körmendi Richárd „Cold Urban Sighs” című dala kiemelkedő megjelenés — filmszerű hangzás, nyers érzelmek és egy hang, amit lehetetlen figyelmen kívül hagyni.",
    type: { en: "Featured Artist", hu: "Kiemelt előadó" },
    song: "Cold Urban Sighs",
    url: "https://musicalive.net/richard-kormendi-cold-urban-sighs/",
  },
  {
    outlet: "Tony Michaelides Show",
    quote: "International radio play — featured on the Tony Michaelides Show, broadcast worldwide.",
    quoteHu: "Nemzetközi rádiós lejátszás — a Tony Michaelides Show-ban hangzott el, világszerte sugározva.",
    type: { en: "Radio Play", hu: "Rádiós lejátszás" },
    song: null,
    url: null,
  },
  {
    outlet: "Nosso Som",
    quote: "Playlist feature by Nosso Som for “Enthralling” — 40.9k followers.",
    quoteHu: "Playlist-megjelenés a Nosso Somtól az „Enthralling” című dalra — 40 900 követő.",
    type: { en: "Playlist Feature", hu: "Playlist megjelenés" },
    song: "Enthralling",
    url: "https://nossosom77.wixsite.com/nossosom",
  },
];

const streamingLinks = [
  { name: "Spotify",     url: "https://open.spotify.com/artist/5UW4cZ0M83TG2nJWYvkVkp" },
  { name: "Apple Music", url: "https://music.apple.com/hu/artist/richard-körmendi/1877841316" },
  { name: "Tidal",       url: "https://tidal.com/artist/74624158" },
  { name: "YouTube",     url: "https://www.youtube.com/@richardkormendi6379" },
  { name: "Instagram",   url: "https://www.instagram.com/rickormendi/" },
];

const photos = [
  { src: photoStudio,    name: "richard-kormendi-portrait.jpg",  label: { en: "Portrait", hu: "Portré" } },
  { src: photoBar,       name: "richard-kormendi-bar.jpg",       label: { en: "Portrait, evening", hu: "Esti portré" } },
  { src: photoGuitarist, name: "richard-kormendi-guitarist.jpg", label: { en: "Performing", hu: "Előadás közben" } },
  { src: photoSession,   name: "richard-kormendi-session.jpg",   label: { en: "Recording session", hu: "Felvétel közben" } },
];

const riderItems = {
  en: [
    "PA system suitable for the venue size",
    "Monitor wedge or in-ear monitoring for 1 person",
    "Microphone: condenser or dynamic (e.g. Shure SM58 / Beta 87A)",
    "Microphone stand",
    "DI box for guitar/laptop playback (acoustic sets)",
    "Lighting: general stage wash, 1 spotlight preferred",
    "Sound check: min. 30 minutes before doors open",
  ],
  hu: [
    "A helyszín méretéhez illő PA rendszer",
    "Monitor ék vagy in-ear monitor 1 fő részére",
    "Mikrofon: kondenzátor vagy dinamikus (pl. Shure SM58 / Beta 87A)",
    "Mikrofonállvány",
    "DI box gitárhoz / laptop-lejátszáshoz (akusztikus fellépéseknél)",
    "Megvilágítás: általános szórt fény, lehetőség szerint 1 spot",
    "Hangpróba: legalább 30 perccel a kapunyitás előtt",
  ],
};

const shortBio = {
  en: "Richard Körmendi is a Hungarian singer-songwriter and classically trained tenor based in Esztergom, Hungary. He fronted the indie rock band Éberálom, performed in musical theatre, and in 2024 graduated in classical vocal performance from Partium Christian University in Oradea. His English-language solo project — alternative rock shaped by classical training — launched in 2026, with singles including “You Become My Only,” “Like An Ember,” and “Cold Urban Sighs” earning international radio play and press features.",
  hu: "Körmendi Richárd magyar énekes-dalszerző és klasszikus képzettségű tenor Esztergomból. Zenei pályáját az Éberálom nevű indie rock zenekar frontembereként kezdte, majd musicalekben is szerepelt, mielőtt 2024-ben klasszikus énekdiplomát szerzett a Nagyváradi Partiumi Keresztény Egyetemen. 2026-ban indította el angol nyelvű szólóprojektjét, amely klasszikus alapokra épülő alternatív rockot szólaltat meg; olyan kislemezei, mint a „You Become My Only”, a „Like An Ember” és a „Cold Urban Sighs”, nemzetközi rádiós figyelmet és sajtómegjelenéseket is hoztak neki.",
};

const longBio = {
  en: "Richard Körmendi is a Hungarian singer-songwriter and classically trained tenor based in Esztergom, Hungary. He first found his voice fronting the indie rock band Éberálom and performing in musical theatre, before pursuing classical training at Partium Christian University in Oradea, where he graduated in vocal performance in 2024.\n\nIn 2026, Richard launched his English-language solo project — dark, cinematic alternative rock shaped by years of classical discipline. Singles such as “You Become My Only,” “Like An Ember,” “Enthralling,” and “Cold Urban Sighs” pair raw, indie-rooted energy with a trained tenor's control, while instrumental pieces like “Light In The Dark” and “The Absent” explore the same mood through piano and cello alone.\n\nThe project has picked up international attention early on: a feature on MusicAlive.net, radio play on the Tony Michaelides Show, and a playlist placement by Nosso Som (40.9k followers). Richard is based in Hungary and available for bookings, collaborations, and press inquiries.",
  hu: "Körmendi Richárd magyar énekes-dalszerző és klasszikus képzettségű tenor Esztergomból. Zenei pályáját az Éberálom nevű indie rock zenekar frontembereként és musical-előadóként kezdte, majd klasszikus énektanulmányokba fogott a Nagyváradi Partiumi Keresztény Egyetemen, ahol 2024-ben diplomázott.\n\n2026-ban indította el angol nyelvű szólóprojektjét: sötét, filmszerű alternatív rockot, amelyben évek klasszikus fegyelme találkozik a nyers, indie gyökerű energiával. Olyan kislemezei, mint a „You Become My Only”, a „Like An Ember”, az „Enthralling” és a „Cold Urban Sighs” a képzett tenor kontrolljával szólaltatják meg ezt a kettősséget, míg az olyan instrumentális darabok, mint a „Light In The Dark” és „The Absent” ugyanezt a hangulatot zongorán és csellón keresztül idézik meg.\n\nA projekt már a kezdetektől nemzetközi figyelmet kapott: bemutatkozott a MusicAlive.net-en, rádióban hallható volt a Tony Michaelides Show-ban, és felkerült a Nosso Som playlistjére (40 900 követő). Richárd Magyarországon él, és nyitott fellépésekre, együttműködésekre és sajtómegkeresésekre egyaránt.",
};

export default function Epk() {
  const { lang } = useLang();
  const hu = lang === "hu";

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: TEXT, background: BG_1 }}>
      <Navbar />

      {/* Hero */}
      <section style={{ background: BG_1, color: TEXT, padding: "10rem 2rem 6rem", textAlign: "center" }}>
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: ACCENT, textTransform: "uppercase", marginBottom: "1.5rem", textShadow: "0 0 16px rgba(209, 107, 99,0.3)" }}>
            {hu ? "Sajtóanyag" : "Electronic Press Kit"}
          </p>
          <h1 style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: "1rem", color: TEXT }}>
            Richard Körmendi
          </h1>
          <p style={{ fontSize: "1.05rem", color: "rgba(245,241,234,0.55)", lineHeight: 1.7, maxWidth: "520px", margin: "0 auto 2.5rem" }}>
            {hu ? "Énekes-dalszerző · Klasszikus képzettségű tenor" : "Singer-Songwriter · Classically Trained Tenor"}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            <button
              onClick={() => { track("click", { label: "epk_pdf_download" }); window.print(); }}
              style={{ padding: "0.9rem 2rem", background: ACCENT, color: "#fff", border: "none", borderRadius: "4px", fontSize: "0.9rem", fontWeight: 600, letterSpacing: "0.05em", cursor: "pointer", boxShadow: "0 0 24px rgba(209, 107, 99,0.3)" }}>
              {hu ? "Letöltés PDF-ként" : "Download as PDF"}
            </button>
            <a href="mailto:richard.kormendi@gmail.com"
              onClick={() => track("click", { label: "epk_booking_contact" })}
              style={{ padding: "0.9rem 2rem", background: "transparent", color: TEXT, border: `1px solid ${BORDER}`, borderRadius: "4px", fontSize: "0.9rem", fontWeight: 500, letterSpacing: "0.05em", textDecoration: "none" }}>
              {hu ? "Booking kapcsolat" : "Booking contact"}
            </a>
          </div>
        </motion.div>
      </section>

      {/* Bio */}
      <section style={{ padding: "8rem 2rem", background: BG_2 }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}>
            <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: ACCENT, textTransform: "uppercase", marginBottom: "3rem", textShadow: "0 0 16px rgba(209, 107, 99,0.3)" }}>
              {hu ? "Életrajz" : "Biography"}
            </p>

            {/* Short bio */}
            <div style={{ marginBottom: "1.25rem", padding: "2rem", background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: "10px" }}>
              <p style={{ fontSize: "0.7rem", letterSpacing: "0.12em", color: "rgba(245,241,234,0.4)", textTransform: "uppercase", marginBottom: "1rem" }}>
                {hu ? "Rövid bio (másolható)" : "Short bio (copy-paste)"}
              </p>
              <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "rgba(245,241,234,0.85)" }}>
                {hu ? shortBio.hu : shortBio.en}
              </p>
            </div>

            {/* Long bio */}
            <div style={{ padding: "2rem", background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: "10px" }}>
              <p style={{ fontSize: "0.7rem", letterSpacing: "0.12em", color: "rgba(245,241,234,0.4)", textTransform: "uppercase", marginBottom: "1rem" }}>
                {hu ? "Részletes bio" : "Full bio"}
              </p>
              {(hu ? longBio.hu : longBio.en).split("\n\n").map((para, i) => (
                <p key={i} style={{ fontSize: "0.95rem", lineHeight: 1.9, color: "rgba(245,241,234,0.75)", margin: i === 0 ? "0 0 1.2rem" : "0 0 1.2rem" }}>
                  {para}
                </p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Press */}
      <section style={{ padding: "8rem 2rem", background: BG_1 }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} style={{ marginBottom: "3rem" }}>
            <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: ACCENT, textTransform: "uppercase", textShadow: "0 0 16px rgba(209, 107, 99,0.3)" }}>
              {hu ? "Sajtómegjelenések" : "Press"}
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
            className="epk-press-grid">
            {pressItems.map(item => (
              <motion.div key={item.outlet} variants={staggerItem}
                style={{ display: "flex", flexDirection: "column", gap: "0.85rem", padding: "1.75rem", background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}`, borderRadius: "10px" }}>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <span style={{
                    display: "inline-block", width: "fit-content",
                    fontSize: "0.65rem", letterSpacing: "0.08em", color: ACCENT,
                    textTransform: "uppercase", fontWeight: 700,
                    border: "1px solid rgba(209, 107, 99,0.35)", borderRadius: "999px",
                    padding: "3px 10px",
                  }}>
                    {hu ? item.type.hu : item.type.en}
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
                <p style={{ margin: 0, fontWeight: 600, fontSize: "1.05rem", color: TEXT }}>{item.outlet}</p>
                <p style={{ fontSize: "0.9rem", color: "rgba(245,241,234,0.6)", lineHeight: 1.7, fontStyle: "italic", margin: 0 }}>
                  "{hu ? item.quoteHu : item.quote}"
                </p>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                    onClick={() => track("click", { label: `epk_press: ${item.outlet}` })}
                    style={{ fontSize: "0.78rem", color: "rgba(245,241,234,0.5)", letterSpacing: "0.05em", textDecoration: "none", marginTop: "auto", paddingTop: "0.25rem" }}>
                    {hu ? "Cikk megtekintése →" : "View article →"}
                  </a>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
        <style>{`
          .epk-press-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; }
        `}</style>
      </section>

      {/* Photos */}
      <section style={{ padding: "8rem 2rem", background: BG_2 }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} style={{ marginBottom: "3rem" }}>
            <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: ACCENT, textTransform: "uppercase", textShadow: "0 0 16px rgba(209, 107, 99,0.3)" }}>
              {hu ? "Letölthető fotók" : "Press photos"}
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            {photos.map(photo => (
              <motion.div key={photo.name} variants={staggerItem} style={{ position: "relative", borderRadius: "8px", overflow: "hidden", border: `1px solid ${BORDER}` }}>
                <img src={photo.src} alt={hu ? photo.label.hu : photo.label.en}
                  style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }} />
                <a href={photo.src} download={photo.name}
                  onClick={() => track("click", { label: `epk_photo_download: ${photo.name}` })}
                  style={{ display: "block", padding: "0.6rem", fontSize: "0.75rem", color: "rgba(245,241,234,0.6)", letterSpacing: "0.05em", textDecoration: "none", textAlign: "center", background: CARD_BG }}>
                  ↓ {hu ? photo.label.hu : photo.label.en}
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Streaming */}
      <section style={{ padding: "8rem 2rem", background: BG_1 }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}>
            <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: ACCENT, textTransform: "uppercase", marginBottom: "2.5rem", textShadow: "0 0 16px rgba(209, 107, 99,0.3)" }}>
              {hu ? "Streaming platformok" : "Listen"}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              {streamingLinks.map(link => {
                const primary = link.name === "Spotify";
                return (
                  <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer"
                    onClick={() => track("click", { label: `epk_stream: ${link.name}` })}
                    style={{
                      padding: "0.75rem 1.5rem",
                      border: `1px solid ${primary ? ACCENT : BORDER}`,
                      borderRadius: "8px", fontSize: "0.9rem",
                      color: primary ? "#fff" : TEXT,
                      fontWeight: primary ? 700 : 400,
                      textDecoration: "none", letterSpacing: "0.03em",
                      background: primary ? ACCENT : "rgba(255,255,255,0.03)",
                      boxShadow: primary ? "0 0 24px rgba(209, 107, 99,0.3)" : "none",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = "#fff"; }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = primary ? ACCENT : "rgba(255,255,255,0.03)";
                      e.currentTarget.style.borderColor = primary ? ACCENT : BORDER;
                      e.currentTarget.style.color = primary ? "#fff" : TEXT;
                    }}>
                    {link.name}
                  </a>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Technical Rider */}
      <section style={{ padding: "8rem 2rem", background: BG_2 }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}>
            <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: ACCENT, textTransform: "uppercase", marginBottom: "1.5rem", textShadow: "0 0 16px rgba(209, 107, 99,0.3)" }}>
              {hu ? "Technikai rider" : "Technical rider"}
            </p>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 600, marginBottom: "2.5rem", color: TEXT }}>
              {hu ? "Helyszíni igények" : "Stage requirements"}
            </h2>
            <div style={{ padding: "1.75rem 2rem", background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: "10px" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
                {(hu ? riderItems.hu : riderItems.en).map((item, i) => (
                  <li key={i} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", fontSize: "0.95rem", color: "rgba(245,241,234,0.7)", lineHeight: 1.6 }}>
                    <span style={{ color: ACCENT, flexShrink: 0, paddingTop: "2px" }}>—</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <p style={{ marginTop: "2rem", fontSize: "0.85rem", color: "rgba(245,241,234,0.4)", lineHeight: 1.7 }}>
              {hu
                ? "Kérdés vagy speciális igény esetén keress bátran emailben: richard.kormendi@gmail.com"
                : "For questions or special requirements, reach out: richard.kormendi@gmail.com"}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact */}
      <section style={{ padding: "8rem 2rem", background: BG_1, textAlign: "center" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}>
            <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: ACCENT, textTransform: "uppercase", marginBottom: "1.5rem", textShadow: "0 0 16px rgba(209, 107, 99,0.3)" }}>
              {hu ? "Kapcsolat" : "Contact"}
            </p>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 600, marginBottom: "2rem", color: TEXT }}>
              {hu ? "Booking & sajtó" : "Booking & press"}
            </h2>
            <div style={{ display: "inline-flex", flexDirection: "column", gap: "1rem", textAlign: "left" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", letterSpacing: "0.1em", color: "rgba(245,241,234,0.4)", textTransform: "uppercase", width: "90px", flexShrink: 0 }}>Email</span>
                <a href="mailto:richard.kormendi@gmail.com" onClick={() => track("click", { label: "epk_booking_contact" })} style={{ color: TEXT, fontSize: "0.95rem", textDecoration: "none", borderBottom: `1px solid ${BORDER}` }}>
                  richard.kormendi@gmail.com
                </a>
              </div>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", letterSpacing: "0.1em", color: "rgba(245,241,234,0.4)", textTransform: "uppercase", width: "90px", flexShrink: 0 }}>Instagram</span>
                <a href="https://www.instagram.com/rickormendi/" target="_blank" rel="noopener noreferrer" onClick={() => track("click", { label: "epk_instagram" })} style={{ color: TEXT, fontSize: "0.95rem", textDecoration: "none", borderBottom: `1px solid ${BORDER}` }}>
                  @rickormendi
                </a>
              </div>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", letterSpacing: "0.1em", color: "rgba(245,241,234,0.4)", textTransform: "uppercase", width: "90px", flexShrink: 0 }}>
                  {hu ? "Székhely" : "Location"}
                </span>
                <span style={{ color: "rgba(245,241,234,0.7)", fontSize: "0.95rem" }}>
                  {hu ? "Esztergom, Magyarország" : "Esztergom, Hungary"}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* Print styles — nyomtatáskor/PDF-nél olvasható, tinta-takarékos világos oldal */}
      <style>{`
        @media print {
          nav, footer, button { display: none !important; }
          body { font-size: 12pt; color: #000 !important; background: #fff !important; }
          section { padding: 2rem 1rem !important; background: #fff !important; color: #000 !important; page-break-inside: avoid; }
          a { color: #000 !important; }
          h1, h2 { color: #000 !important; }
          p, li, span { color: #000 !important; }
        }
      `}</style>
    </div>
  );
}
