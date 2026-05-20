import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer, staggerItem } from "../utils/animations";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Ez az oldal NEM jelenik meg a navigációban — freelance ügyfeleknek szól
// Direct URL: /hire

const HIRE_FORM_URL = "https://formspree.io/f/mwvzvzrn";

const packages = [
  {
    name: "Starter",
    price: "~€380",
    priceHu: "~150 000 Ft",
    desc: "Single-page website or landing page — fast, clean, and live within 2 weeks.",
    descHu: "Egyszeri egyoldalas weboldal vagy landing page — gyors, tiszta, 2 héten belül él.",
    items: [
      "1-page site or landing page",
      "Responsive design (mobile-first)",
      "Basic SEO setup",
      "Contact form",
      "Delivered in 2 weeks",
    ],
    itemsHu: [
      "1 oldalas site vagy landing page",
      "Reszponzív dizájn (mobile-first)",
      "Alapszintű SEO beállítás",
      "Kapcsolati form",
      "Átadás 2 héten belül",
    ],
  },
  {
    name: "Business",
    price: "~€760",
    priceHu: "~300 000 Ft",
    desc: "Multi-page WordPress site with SEO, analytics, and a month of support.",
    descHu: "Többoldalas WordPress site SEO-val, analitikával és 1 hónap supporttal.",
    highlight: true,
    items: [
      "Up to 5 pages",
      "WordPress + custom theme",
      "SEO audit & on-page optimisation",
      "Google Analytics 4 setup",
      "Performance optimisation",
      "1 month support included",
    ],
    itemsHu: [
      "Több aloldal (5-ig)",
      "WordPress + egyedi téma",
      "SEO audit & on-page optimalizálás",
      "Google Analytics 4 beállítás",
      "Teljesítmény-optimalizálás",
      "1 hónap support",
    ],
  },
  {
    name: "Custom",
    price: "Custom quote",
    priceHu: "Egyedi árajánlat",
    desc: "React development, Google Ads campaigns, complex projects, or long-term collaboration.",
    descHu: "React fejlesztés, Google Ads kampányok, összetettebb projektek vagy hosszú távú együttműködés.",
    items: [
      "React / Vite development",
      "Google Ads campaign setup & management",
      "Project management",
      "Technical SEO & Core Web Vitals",
      "Long-term partnership",
    ],
    itemsHu: [
      "React / Vite fejlesztés",
      "Google Ads kampány setup & kezelés",
      "Projekt menedzsment",
      "Technikai SEO & Core Web Vitals",
      "Hosszú távú együttműködés",
    ],
  },
];

const process = [
  { step: "01", en: "Discovery call", hu: "Feltérképezés", bodyEn: "We talk through your goals, timeline, and budget. No commitment, no sales pitch.", bodyHu: "Átbeszéljük a céljaidat, határidőt és büdzsét. Semmi kötelezettség, semmi sales." },
  { step: "02", en: "Proposal", hu: "Ajánlat", bodyEn: "I send a clear, itemised proposal within 48 hours. You approve — we start.", bodyHu: "48 órán belül küldök egy részletes ajánlatot. Jóváhagyod — elkezdjük." },
  { step: "03", en: "Build", hu: "Fejlesztés", bodyEn: "Regular updates, no surprises. You see the work in progress via a staging link.", bodyHu: "Rendszeres frissítések, nincsenek meglepetések. Staging linken látod a munkát menet közben." },
  { step: "04", en: "Launch", hu: "Élesítés", bodyEn: "Go live, handover, and training if needed. Plus a month of free support.", bodyHu: "Élesítés, átadás, betanítás ha kell. Plusz 1 hónap ingyenes support." },
];

export default function Hire() {
  const [lang, setLang] = useState("en");
  const hu = lang === "hu";

  const [form, setForm] = useState({ name: "", email: "", company: "", budget: "", message: "" });
  const [status, setStatus] = useState("idle");

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(HIRE_FORM_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...form, _subject: `Hire inquiry from ${form.name}` }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#1a1a1a" }}>
      <Navbar />

      {/* Hero */}
      <section style={{ background: "#1a1a1a", color: "#fff", padding: "10rem 2rem 6rem", textAlign: "center" }}>
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: "#555", textTransform: "uppercase", marginBottom: "1.5rem" }}>
            {hu ? "Digitális szolgáltatások" : "Digital services"}
          </p>
          <h1 style={{ fontSize: "clamp(2.2rem, 6vw, 4rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: "1.5rem" }}>
            {hu ? "14 év.\nEpítsünk valamit." : "14 years.\nLet's build something."}
          </h1>
          <p style={{ fontSize: "1.1rem", color: "#666", lineHeight: 1.8, maxWidth: "540px", margin: "0 auto 3rem" }}>
            {hu
              ? "Front-end fejlesztés, WordPress, SEO, Google Ads. Kis- és középvállalkozásoknak, egyéni vállalkozóknak — aki eredményt akar, nem csak egy szép weboldalt."
              : "Front-end development, WordPress, SEO, Google Ads. For small businesses and freelancers who want results, not just a pretty website."
            }
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem" }}>
            <a href="#contact-form"
              style={{ padding: "0.9rem 2rem", background: "#fff", color: "#1a1a1a", textDecoration: "none", borderRadius: "2px", fontSize: "0.9rem", fontWeight: 500, letterSpacing: "0.05em" }}>
              {hu ? "Írd meg mire van szükséged" : "Tell me what you need"}
            </a>
            <button onClick={() => setLang(l => l === "en" ? "hu" : "en")}
              style={{ padding: "0.9rem 1.5rem", background: "none", border: "1px solid #333", color: "#555", borderRadius: "2px", fontSize: "0.85rem", cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.08em" }}>
              {hu ? "EN" : "HU"}
            </button>
          </div>
        </motion.div>
      </section>

      {/* Packages */}
      <section style={{ padding: "7rem 2rem", background: "#f7f6f3" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} style={{ marginBottom: "4rem" }}>
            <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#999", textTransform: "uppercase", marginBottom: "1.5rem" }}>
              {hu ? "Csomagok" : "Packages"}
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 600 }}>
              {hu ? "Átlátható árak." : "Transparent pricing."}
            </h2>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
            {packages.map(pkg => (
              <motion.div key={pkg.name} variants={staggerItem}
                style={{
                  background: pkg.highlight ? "#1a1a1a" : "#fff",
                  color: pkg.highlight ? "#fff" : "#1a1a1a",
                  padding: "2.5rem",
                  borderRadius: "2px",
                  border: pkg.highlight ? "none" : "1px solid #e8e8e8",
                }}>
                <p style={{ fontSize: "0.75rem", letterSpacing: "0.1em", color: pkg.highlight ? "#666" : "#bbb", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                  {pkg.name}
                </p>
                <p style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>
                  {hu ? pkg.priceHu : pkg.price}
                </p>
                <p style={{ fontSize: "0.9rem", color: pkg.highlight ? "#999" : "#666", lineHeight: 1.6, marginBottom: "2rem" }}>
                  {hu ? pkg.descHu : pkg.desc}
                </p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {(hu ? pkg.itemsHu : pkg.items).map(item => (
                    <li key={item} style={{ fontSize: "0.85rem", color: pkg.highlight ? "#888" : "#555", display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                      <span style={{ color: pkg.highlight ? "#555" : "#bbb", flexShrink: 0 }}>—</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Process */}
      <section style={{ padding: "7rem 2rem", background: "#fff" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }} style={{ marginBottom: "4rem" }}>
            <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#999", textTransform: "uppercase", marginBottom: "1.5rem" }}>
              {hu ? "Hogyan dolgozom" : "How it works"}
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 600 }}>
              {hu ? "Egyszerű folyamat." : "Simple process."}
            </h2>
          </motion.div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {process.map((step, i) => (
              <motion.div key={step.step}
                variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
                transition={{ delay: i * 0.1 }}
                style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: "2rem", padding: "2.5rem 0", borderBottom: i < process.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                <span style={{ fontSize: "0.75rem", letterSpacing: "0.1em", color: "#ddd", fontWeight: 600, paddingTop: "4px" }}>
                  {step.step}
                </span>
                <div>
                  <p style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                    {hu ? step.hu : step.en}
                  </p>
                  <p style={{ fontSize: "0.9rem", color: "#666", lineHeight: 1.7 }}>
                    {hu ? step.bodyHu : step.bodyEn}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact form */}
      <section id="contact-form" style={{ padding: "7rem 2rem", background: "#f0f2f5" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}>
            <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#999", textTransform: "uppercase", marginBottom: "1.5rem" }}>
              {hu ? "Kapcsolat" : "Get in touch"}
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 600, marginBottom: "1rem" }}>
              {hu ? "Számíts gyors válaszra." : "Expect a quick reply."}
            </h2>
            <p style={{ fontSize: "0.95rem", color: "#666", lineHeight: 1.7, marginBottom: "3rem" }}>
              {hu
                ? "48 órán belül válaszolok. Ha azonnali kérdésed van, írj emailt: richard.kormendi@gmail.com"
                : "I reply within 48 hours. For urgent questions, email directly: richard.kormendi@gmail.com"
              }
            </p>

            {status === "success" ? (
              <p style={{ padding: "1.5rem", background: "#f0faf0", border: "1px solid #c3e6cb", borderRadius: "2px", color: "#2d6a4f", fontSize: "0.95rem" }}>
                {hu ? "Megkaptam! 48 órán belül visszajelzek." : "Got it! I'll reply within 48 hours."}
              </p>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <input name="name" required value={form.name} onChange={handleChange}
                    placeholder={hu ? "Neved" : "Your name"} style={inputStyle} />
                  <input name="email" type="email" required value={form.email} onChange={handleChange}
                    placeholder={hu ? "Email cím" : "Email address"} style={inputStyle} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <input name="company" value={form.company} onChange={handleChange}
                    placeholder={hu ? "Cégnév / Projekt" : "Company / Project"} style={inputStyle} />
                  <select name="budget" value={form.budget} onChange={handleChange} style={inputStyle}>
                    <option value="">{hu ? "Büdzsé (opcionális)" : "Budget (optional)"}</option>
                    <option value="<€500">{hu ? "150 000 Ft alatt" : "Under €500"}</option>
                    <option value="€500–1500">{hu ? "150 000 – 600 000 Ft" : "€500 – €1 500"}</option>
                    <option value=">€1500">{hu ? "600 000 Ft felett" : "Over €1 500"}</option>
                  </select>
                </div>
                <textarea name="message" rows={5} required value={form.message} onChange={handleChange}
                  placeholder={hu ? "Miről szólna a projekt?" : "Tell me about the project..."} style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
                {status === "error" && (
                  <p style={{ fontSize: "0.85rem", color: "#c0392b" }}>
                    {hu ? "Hiba. Írj emailt közvetlenül." : "Something went wrong. Please email directly."}
                  </p>
                )}
                <button type="submit" disabled={status === "loading"}
                  style={{ alignSelf: "flex-start", padding: "0.9rem 2rem", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: "2px", fontSize: "0.9rem", fontWeight: 500, letterSpacing: "0.05em", cursor: status === "loading" ? "not-allowed" : "pointer", opacity: status === "loading" ? 0.7 : 1, fontFamily: "inherit" }}>
                  {status === "loading" ? "..." : (hu ? "Küldés" : "Send")}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

const inputStyle = {
  padding: "0.85rem 1rem",
  border: "1px solid #ddd",
  borderRadius: "2px",
  fontSize: "0.9rem",
  background: "#fff",
  color: "#1a1a1a",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "inherit",
};
