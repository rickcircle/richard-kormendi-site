import { motion } from "framer-motion";
import { fadeUp, staggerContainer, staggerItem } from "../utils/animations";
import { useLang } from "../context/LanguageContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { track } from "../utils/track";

// Ez az oldal NEM jelenik meg a navigációban — casting rendezőknek / ügynökségeknek szól
// Direct URL: /casting

import heroPhoto      from "../assets/images/casting/casting-hero.jpg";
import lookDramatic   from "../assets/images/casting/casting-look-dramatic.jpg";
import lookEdgy       from "../assets/images/casting/casting-look-edgy.jpg";
import lookCasual     from "../assets/images/casting/casting-look-casual.jpg";
import lookSoft       from "../assets/images/casting/casting-look-soft.jpg";
import lookCinematic  from "../assets/images/casting/casting-look-cinematic.jpg";
import lookUrban      from "../assets/images/casting/casting-look-urban.jpg";
import lookFullBody   from "../assets/images/casting/casting-look-fullbody.jpg";
import lookWarm       from "../assets/images/casting/casting-look-warm.jpg";
import lookSerious    from "../assets/images/casting/casting-look-serious.jpg";

const ACCENT = "#e8963a";
const BG_1 = "#0b0a08";
const BG_2 = "#141210";
const CARD_BG = "#1c1814";
const BORDER = "rgba(255,255,255,0.08)";
const TEXT = "#f5f1ea";

const vitals = [
  { label: { en: "Height", hu: "Magasság" }, value: "186 cm / 6'1\"" },
  { label: { en: "Weight", hu: "Súly" }, value: "85 kg / 187 lbs" },
  { label: { en: "Hair", hu: "Haj" }, value: { en: "Dark Brown / Wavy", hu: "Sötétbarna / Hullámos" } },
  { label: { en: "Eyes", hu: "Szem" }, value: { en: "Green / Hazel", hu: "Zöld / Mogyoró" } },
  { label: { en: "Age Range", hu: "Játszható korosztály" }, value: "38 – 48" },
  { label: { en: "Languages", hu: "Nyelvek" }, value: { en: "English (Fluent), Hungarian (Native)", hu: "Angol (folyékony), Magyar (anyanyelv)" } },
  { label: { en: "Location", hu: "Tartózkodási hely" }, value: { en: "Hungary — EU passport, available internationally", hu: "Magyarország — EU útlevél, nemzetközileg elérhető" } },
];

const gallery = [
  { src: lookDramatic,  label: { en: "Dramatic", hu: "Drámai" } },
  { src: lookEdgy,      label: { en: "Intense", hu: "Intenzív" } },
  { src: lookSoft,      label: { en: "Leading Man", hu: "Főszereplő" } },
  { src: lookCinematic, label: { en: "Cinematic", hu: "Filmszerű" } },
  { src: lookCasual,    label: { en: "Natural", hu: "Természetes" } },
  { src: lookUrban,     label: { en: "Urban", hu: "Városi" } },
  { src: lookWarm,      label: { en: "Approachable", hu: "Közvetlen" } },
  { src: lookSerious,   label: { en: "Serious", hu: "Komoly" } },
  { src: lookFullBody,  label: { en: "Full Body", hu: "Teljes alak" } },
];

export default function Casting() {
  const { lang } = useLang();
  const hu = lang === "hu";

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: TEXT, background: BG_1 }}>
      <Navbar />

      {/* Hero */}
      <section style={{ background: BG_1, padding: "10rem 2rem 5rem" }}>
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(240px, 380px) 1fr", gap: "3rem", alignItems: "center" }}
          className="casting-hero-grid">
          <div style={{ borderRadius: "10px", overflow: "hidden", border: `1px solid ${BORDER}`, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
            <img src={heroPhoto} alt="Richard Körmendi" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }} />
          </div>
          <div>
            <p style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: ACCENT, textTransform: "uppercase", marginBottom: "1.5rem", textShadow: "0 0 16px rgba(232,150,58,0.3)" }}>
              {hu ? "Casting anyag" : "Casting Profile"}
            </p>
            <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.4rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: "0.75rem", color: TEXT }}>
              Richard Körmendi
            </h1>
            <p style={{ fontSize: "1.05rem", color: "rgba(245,241,234,0.55)", marginBottom: "1.75rem" }}>
              {hu ? "Színész · Voiceover" : "Actor · Voiceover"}
            </p>
            <p style={{ fontSize: "1rem", color: "rgba(245,241,234,0.75)", lineHeight: 1.8, marginBottom: "2.5rem", maxWidth: "480px" }}>
              {hu
                ? "Magyarországi színpadi tapasztalattal rendelkező, klasszikus énekképzésű színész, markáns, filmszerű jelenléttel. Nyitott nemzetközi film-, sorozat- és reklámfilmes felkérésekre."
                : "European-based actor with a striking, cinematic presence and stage experience in Hungary. Classically trained voice. Open to international film, TV, and commercial work."}
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <a href="mailto:richard.kormendi@gmail.com?subject=Casting%20Inquiry"
                onClick={() => track("click", { label: "casting_contact_cta" })}
                style={{ padding: "0.9rem 2rem", background: ACCENT, color: "#fff", border: "none", borderRadius: "4px", fontSize: "0.9rem", fontWeight: 600, letterSpacing: "0.05em", textDecoration: "none", boxShadow: "0 0 24px rgba(232,150,58,0.3)" }}>
                {hu ? "Kapcsolatfelvétel" : "Contact / Request CV"}
              </a>
              <a href="#photos"
                style={{ padding: "0.9rem 2rem", background: "transparent", color: TEXT, border: `1px solid ${BORDER}`, borderRadius: "4px", fontSize: "0.9rem", fontWeight: 500, letterSpacing: "0.05em", textDecoration: "none" }}>
                {hu ? "Fotók megtekintése" : "View Photos"}
              </a>
            </div>
          </div>
        </motion.div>
        <style>{`
          @media (max-width: 720px) {
            .casting-hero-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* Vital Stats */}
      <section style={{ padding: "5rem 2rem", background: BG_2 }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1px", background: BORDER, border: `1px solid ${BORDER}`, borderRadius: "10px", overflow: "hidden" }}>
            {vitals.map(v => (
              <motion.div key={v.label.en} variants={staggerItem} style={{ padding: "1.5rem", background: CARD_BG }}>
                <p style={{ fontSize: "0.65rem", letterSpacing: "0.12em", color: ACCENT, textTransform: "uppercase", marginBottom: "0.5rem" }}>
                  {hu ? v.label.hu : v.label.en}
                </p>
                <p style={{ fontSize: "0.95rem", color: TEXT, margin: 0, lineHeight: 1.5 }}>
                  {typeof v.value === "string" ? v.value : (hu ? v.value.hu : v.value.en)}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Showreel / placeholder */}
      <section style={{ padding: "7rem 2rem", background: BG_1 }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}>
            <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: ACCENT, textTransform: "uppercase", marginBottom: "2rem", textShadow: "0 0 16px rgba(232,150,58,0.3)" }}>
              {hu ? "Bemutató anyag" : "Showreel"}
            </p>
            <div style={{
              aspectRatio: "16/9", borderRadius: "10px", border: `1px dashed ${BORDER}`,
              background: CARD_BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem",
            }}>
              <span style={{ fontSize: "2rem", opacity: 0.3 }}>▶</span>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "rgba(245,241,234,0.4)", letterSpacing: "0.05em" }}>
                {hu ? "Hamarosan" : "Coming Soon"}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section id="photos" style={{ padding: "7rem 2rem", background: BG_2, scrollMarginTop: "80px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} style={{ marginBottom: "3rem" }}>
            <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: ACCENT, textTransform: "uppercase", textShadow: "0 0 16px rgba(232,150,58,0.3)" }}>
              {hu ? "Fotók" : "Photo Gallery"}
            </p>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
            {gallery.map(photo => (
              <motion.div key={photo.src} variants={staggerItem} style={{ position: "relative", borderRadius: "8px", overflow: "hidden", border: `1px solid ${BORDER}` }}>
                <img src={photo.src} alt={hu ? photo.label.hu : photo.label.en}
                  style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }} />
                <span style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, padding: "0.6rem",
                  fontSize: "0.7rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(245,241,234,0.8)",
                  background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)",
                }}>
                  {hu ? photo.label.hu : photo.label.en}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stage Experience */}
      <section style={{ padding: "7rem 2rem", background: BG_1 }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}>
            <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: ACCENT, textTransform: "uppercase", marginBottom: "1.5rem", textShadow: "0 0 16px rgba(232,150,58,0.3)" }}>
              {hu ? "Színpadi tapasztalat" : "Stage Experience"}
            </p>
            <div style={{ padding: "1.75rem 2rem", background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: "10px" }}>
              <p style={{ fontSize: "0.95rem", color: "rgba(245,241,234,0.8)", lineHeight: 1.8, margin: 0 }}>
                {hu
                  ? "Főszerepek kisebb magyarországi színházi társulatoknál, klasszikus énekképzéssel párosítva."
                  : "Lead roles with regional theatre companies in Hungary, paired with classical vocal training."}
              </p>
              <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "rgba(245,241,234,0.4)" }}>
                {hu ? "Részletes szerep- és produkciólista kérésre." : "Detailed production and role list available on request."}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact */}
      <section style={{ padding: "8rem 2rem", background: BG_2, textAlign: "center" }}>
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}>
            <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: ACCENT, textTransform: "uppercase", marginBottom: "1.5rem", textShadow: "0 0 16px rgba(232,150,58,0.3)" }}>
              {hu ? "Kapcsolat" : "Contact"}
            </p>
            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 600, marginBottom: "2rem", color: TEXT }}>
              {hu ? "Casting megkeresések" : "Casting Inquiries"}
            </h2>
            <div style={{ display: "inline-flex", flexDirection: "column", gap: "1rem", textAlign: "left" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", letterSpacing: "0.1em", color: "rgba(245,241,234,0.4)", textTransform: "uppercase", width: "90px", flexShrink: 0 }}>Email</span>
                <a href="mailto:richard.kormendi@gmail.com?subject=Casting%20Inquiry" onClick={() => track("click", { label: "casting_email" })} style={{ color: TEXT, fontSize: "0.95rem", textDecoration: "none", borderBottom: `1px solid ${BORDER}` }}>
                  richard.kormendi@gmail.com
                </a>
              </div>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", letterSpacing: "0.1em", color: "rgba(245,241,234,0.4)", textTransform: "uppercase", width: "90px", flexShrink: 0 }}>Instagram</span>
                <a href="https://www.instagram.com/rickormendi/" target="_blank" rel="noopener noreferrer" onClick={() => track("click", { label: "casting_instagram" })} style={{ color: TEXT, fontSize: "0.95rem", textDecoration: "none", borderBottom: `1px solid ${BORDER}` }}>
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
            <p style={{ marginTop: "3rem", fontSize: "0.8rem", color: "rgba(245,241,234,0.35)" }}>
              {hu ? "Klasszikus képzettségű énekes-dalszerzőként is aktív — " : "Also active as a classically trained singer-songwriter — "}
              <a href="/epk" style={{ color: "rgba(245,241,234,0.55)", textDecoration: "underline" }}>{hu ? "sajtóanyag" : "press kit"}</a>
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
