import { motion } from "framer-motion";
import { fadeUp, staggerContainer, staggerItem } from "../utils/animations";
import { useLang } from "../context/LanguageContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Ez az oldal NEM jelenik meg a navigációban — bookereknek / sajtónak szól
// Direct URL: /epk

import photo1 from "../assets/images/photo-neon.jpg";
import photo2 from "../assets/images/photo-studio.jpg";
import photo3 from "../assets/images/photo-3.jpg";
import photo4 from "../assets/images/photo-4.jpg";

const pressItems = [
  {
    outlet: "MusicAlive.net",
    quote: "Richard Körmendi's Cold Urban Sighs is a standout release — cinematic textures, raw emotion, and a voice that demands attention.",
    quoteHu: "Richard Körmendi Cold Urban Sighs projektje kiemelkedő megjelenés — filmes hangzás, nyers érzelmek és egy hang, amelyet lehetetlen figyelmen kívül hagyni.",
    type: "Featured Artist",
    url: "https://musicalive.net/richard-kormendi-cold-urban-sighs/",
  },
  {
    outlet: "Tony Michaelides Show",
    quote: "International radio play — featured on the Tony Michaelides Show, broadcast worldwide.",
    quoteHu: "Nemzetközi rádiólejátszás — szerepelt a Tony Michaelides Show-ban, világszerte sugározva.",
    type: "Radio Play",
    url: null,
  },
  {
    outlet: "Nosso Som",
    quote: "Playlist feature by Nosso Som — 40.9k followers.",
    quoteHu: "Playlist-megjelenés a Nosso Som-tól — 40 900 követő.",
    type: "Playlist Feature",
    url: "https://nossosom77.wixsite.com/nossosom",
  },
];

const streamingLinks = [
  { name: "Spotify", url: "https://open.spotify.com/artist/5UW4cZ0M83TG2nJWYvkVkp" },
  { name: "Apple Music", url: "https://music.apple.com/hu/artist/richard-körmendi/1877841316" },
  { name: "YouTube", url: "https://www.youtube.com/@richardkormendi6379" },
  { name: "Tidal", url: "https://tidal.com/artist/74624158" },
];

const photos = [
  { src: photo1, name: "richard-kormendi-neon.jpg", label: "Neon city" },
  { src: photo2, name: "richard-kormendi-studio.jpg", label: "Studio portrait" },
  { src: photo3, name: "richard-kormendi-3.jpg", label: "Portrait 3" },
  { src: photo4, name: "richard-kormendi-4.jpg", label: "Portrait 4" },
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
    "A helyszín méretéhez megfelelő PA rendszer",
    "Monitor ék vagy in-ear monitor 1 személyre",
    "Mikrofon: kondenzátor vagy dinamikus (pl. Shure SM58 / Beta 87A)",
    "Mikrofon állvány",
    "DI box gitárhoz / laptop playbackhez (akusztikus fellépéseknél)",
    "Megvilágítás: általános szétszórt fény + lehetőség szerint 1 spot",
    "Hangpróba: minimum 30 perccel a kapunyitás előtt",
  ],
};

export default function Epk() {
  const { lang } = useLang();
  const hu = lang === "hu";

  const shortBio = {
    en: "Richard Körmendi is a Hungarian singer-songwriter and classically trained tenor based in Esztergom, Hungary. Frontman of indie rock band Éberálom and creator of the English-language project Cold Urban Sighs — releasing cinematic alternative rock for international audiences.",
    hu: "Körmendi Richárd magyar énekes-dalszerző és klasszikusan képzett tenor Esztergomból. Az Éberálom indie rock banda frontembere és a Cold Urban Sighs angol nyelvű projekt alkotója — filmszerű alternatív rock zenét készít nemzetközi közönség számára.",
  };

  const longBio = {
    en: "Richard Körmendi is a Hungarian singer-songwriter, classically trained tenor, and digital professional based in Esztergom, Hungary. He studied classical singing at Partium Christian University in Oradea, graduating in 2024. As the frontman of indie rock band Éberálom and a performer in musical theatre, Richard has developed a stage presence that bridges classical training and contemporary alternative rock. In 2026, he launched Cold Urban Sighs — an English-language project rooted in cinematic alternative rock, with debut singles Release Me and My Remedy gaining international traction through radio play on the Tony Michaelides Show, a feature on MusicAlive.net, and playlist placement by Nosso Som (40.9k followers). Alongside his music career, Richard brings 14 years of experience in front-end development, SEO, and digital marketing.",
    hu: "Körmendi Richárd magyar énekes-dalszerző, klasszikusan képzett tenor és digitális szakember, aki Esztergomban él. A Partiumi Keresztény Egyetemen végezte klasszikus énekes tanulmányait Nagyváradon, diplomát 2024-ben szerzett. Az Éberálom indie rock banda frontembereként és musical-színházi előadóként olyan színpadi jelenlétet fejlesztett ki, amely ötvözi a klasszikus képzettséget és a kortárs alternatív rockot. 2026-ban elindította a Cold Urban Sighs angol nyelvű projektet — filmszerű alternatív rock zenével, amelynek első kislemezei (Release Me, My Remedy) nemzetközi figyelmet kaptak a Tony Michaelides Show rádiójátszásával, a MusicAlive.net-es bemutatóval és a Nosso Som playlist-elhelyezéssel (40 900 követő). Zenei karrierje mellett 14 éves tapasztalattal rendelkezik front-end fejlesztés, SEO és digitális marketing területén.",
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#1a1a1a" }}>
      <Navbar />

      {/* Hero */}
      <section style={{ background: "#1a1a1a", color: "#fff", padding: "10rem 2rem 6rem", textAlign: "center" }}>
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: "#555", textTransform: "uppercase", marginBottom: "1.5rem" }}>
            {hu ? "Sajtóanyag" : "Electronic Press Kit"}
          </p>
          <h1 style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: "1rem" }}>
            Richard Körmendi
          </h1>
          <p style={{ fontSize: "1.05rem", color: "#666", lineHeight: 1.7, maxWidth: "520px", margin: "0 auto 2.5rem" }}>
            {hu
              ? "Énekes-dalszerző · Klasszikus tenor · Cold Urban Sighs"
              : "Singer-songwriter · Classical tenor · Cold Urban Sighs"}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
            <button
              onClick={() => window.print()}
              style={{ padding: "0.9rem 2rem", background: "#fff", color: "#1a1a1a", border: "none", borderRadius: "2px", fontSize: "0.9rem", fontWeight: 500, letterSpacing: "0.05em", cursor: "pointer" }}>
              {hu ? "Letöltés PDF-ként" : "Download as PDF"}
            </button>
            <a href="mailto:richard.kormendi@gmail.com"
              style={{ padding: "0.9rem 2rem", background: "transparent", color: "#fff", border: "1px solid #333", borderRadius: "2px", fontSize: "0.9rem", fontWeight: 500, letterSpacing: "0.05em", textDecoration: "none" }}>
              {hu ? "Booking kapcsolat" : "Booking contact"}
            </a>
          </div>
        </motion.div>
      </section>

      {/* Bio */}
      <section style={{ padding: "7rem 2rem", background: "#f7f6f3" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}>
            <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#999", textTransform: "uppercase", marginBottom: "3rem" }}>
              {hu ? "Biográfia" : "Biography"}
            </p>

            {/* Short bio */}
            <div style={{ marginBottom: "3rem", padding: "2rem", background: "#fff", border: "1px solid #e8e8e8", borderRadius: "2px" }}>
              <p style={{ fontSize: "0.7rem", letterSpacing: "0.12em", color: "#bbb", textTransform: "uppercase", marginBottom: "1rem" }}>
                {hu ? "Rövid bio (copy-paste)" : "Short bio (copy-paste)"}
              </p>
              <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "#333" }}>
                {hu ? shortBio.hu : shortBio.en}
              </p>
            </div>

            {/* Long bio */}
            <div style={{ padding: "2rem", background: "#fff", border: "1px solid #e8e8e8", borderRadius: "2px" }}>
              <p style={{ fontSize: "0.7rem", letterSpacing: "0.12em", color: "#bbb", textTransform: "uppercase", marginBottom: "1rem" }}>
                {hu ? "Hosszú bio" : "Full bio"}
              </p>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.9, color: "#444" }}>
                {hu ? longBio.hu : longBio.en}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Press */}
      <section style={{ padding: "7rem 2rem", background: "#fff" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} style={{ marginBottom: "3rem" }}>
            <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#999", textTransform: "uppercase" }}>
              {hu ? "Sajtómegjelenések" : "Press"}
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {pressItems.map((item) => (
              <motion.div key={item.outlet} variants={staggerItem}
                style={{ padding: "2rem", border: "1px solid #f0f0f0", borderRadius: "2px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                  <p style={{ fontWeight: 600, fontSize: "1rem" }}>{item.outlet}</p>
                  <span style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "#999", textTransform: "uppercase", border: "1px solid #e8e8e8", padding: "0.2rem 0.6rem", borderRadius: "2px" }}>
                    {item.type}
                  </span>
                </div>
                <p style={{ fontSize: "0.9rem", color: "#555", lineHeight: 1.7, fontStyle: "italic", marginBottom: item.url ? "1rem" : 0 }}>
                  "{hu ? item.quoteHu : item.quote}"
                </p>
                {item.url && (
                  <a href={item.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: "0.8rem", color: "#1a1a1a", letterSpacing: "0.05em" }}>
                    {hu ? "Cikk megtekintése →" : "View article →"}
                  </a>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Photos */}
      <section style={{ padding: "7rem 2rem", background: "#f7f6f3" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} style={{ marginBottom: "3rem" }}>
            <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#999", textTransform: "uppercase" }}>
              {hu ? "Letölthető fotók" : "Press photos"}
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
            {photos.map((photo) => (
              <motion.div key={photo.name} variants={staggerItem} style={{ position: "relative", borderRadius: "2px", overflow: "hidden" }}>
                <img src={photo.src} alt={photo.label}
                  style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }} />
                <a href={photo.src} download={photo.name}
                  style={{ display: "block", marginTop: "0.5rem", fontSize: "0.75rem", color: "#666", letterSpacing: "0.05em", textDecoration: "none", textAlign: "center" }}>
                  ↓ {photo.label}
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Streaming */}
      <section style={{ padding: "7rem 2rem", background: "#fff" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}>
            <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#999", textTransform: "uppercase", marginBottom: "2.5rem" }}>
              {hu ? "Streaming platformok" : "Listen"}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
              {streamingLinks.map((link) => (
                <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer"
                  style={{ padding: "0.75rem 1.5rem", border: "1px solid #e8e8e8", borderRadius: "2px", fontSize: "0.9rem", color: "#1a1a1a", textDecoration: "none", letterSpacing: "0.03em" }}>
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Technical Rider */}
      <section style={{ padding: "7rem 2rem", background: "#1a1a1a", color: "#fff" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}>
            <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#555", textTransform: "uppercase", marginBottom: "1.5rem" }}>
              {hu ? "Technikai rider" : "Technical rider"}
            </p>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 600, marginBottom: "2.5rem" }}>
              {hu ? "Helyszíni igények" : "Stage requirements"}
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
              {(hu ? riderItems.hu : riderItems.en).map((item, i) => (
                <li key={i} style={{ display: "flex", gap: "1rem", alignItems: "flex-start", fontSize: "0.95rem", color: "#aaa", lineHeight: 1.6 }}>
                  <span style={{ color: "#444", flexShrink: 0, paddingTop: "2px" }}>—</span>
                  {item}
                </li>
              ))}
            </ul>
            <p style={{ marginTop: "3rem", fontSize: "0.85rem", color: "#555", lineHeight: 1.7 }}>
              {hu
                ? "Kérdések vagy speciális igények esetén keress emailen: richard.kormendi@gmail.com"
                : "For questions or special requirements, reach out: richard.kormendi@gmail.com"}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact */}
      <section style={{ padding: "7rem 2rem", background: "#f7f6f3" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}>
            <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#999", textTransform: "uppercase", marginBottom: "1.5rem" }}>
              {hu ? "Kapcsolat" : "Contact"}
            </p>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 600, marginBottom: "2rem" }}>
              {hu ? "Booking & sajtó" : "Booking & press"}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", letterSpacing: "0.1em", color: "#bbb", textTransform: "uppercase", width: "80px", flexShrink: 0 }}>Email</span>
                <a href="mailto:richard.kormendi@gmail.com" style={{ color: "#1a1a1a", fontSize: "0.95rem" }}>
                  richard.kormendi@gmail.com
                </a>
              </div>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", letterSpacing: "0.1em", color: "#bbb", textTransform: "uppercase", width: "80px", flexShrink: 0 }}>Instagram</span>
                <a href="https://www.instagram.com/rickormendi/" target="_blank" rel="noopener noreferrer" style={{ color: "#1a1a1a", fontSize: "0.95rem" }}>
                  @rickormendi
                </a>
              </div>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", letterSpacing: "0.1em", color: "#bbb", textTransform: "uppercase", width: "80px", flexShrink: 0 }}>Location</span>
                <span style={{ color: "#555", fontSize: "0.95rem" }}>Esztergom, Hungary</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* Print styles */}
      <style>{`
        @media print {
          nav, footer, button { display: none !important; }
          body { font-size: 12pt; color: #000 !important; background: #fff !important; }
          section { padding: 2rem 1rem !important; background: #fff !important; color: #000 !important; page-break-inside: avoid; }
          a { color: #000 !important; }
          h1, h2 { color: #000 !important; }
        }
      `}</style>
    </div>
  );
}
