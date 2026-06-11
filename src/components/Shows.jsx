import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "../utils/animations";
import { useLang } from "../context/LanguageContext";
import { t } from "../i18n/translations";
import showsData from "../data/shows.json";

// Formspree endpoint — hozz létre free fiókot a https://formspree.io oldalon
// majd cseréld le ezt az URL-t: https://formspree.io/f/YOUR_FORM_ID
const BOOKING_FORM_URL = "https://formspree.io/f/mwvzvzrn";

const shows = showsData.shows;

export default function Shows() {
  const { lang } = useLang();
  const tx = t[lang].shows;

  const [form, setForm] = useState({ name: "", email: "", venue: "", date: "", type: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(BOOKING_FORM_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...form, _subject: `Booking inquiry from ${form.name}` }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="shows" style={{ padding: "8rem 2rem", background: "#f0ede8" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}>
          <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#e8963a", textTransform: "uppercase", marginBottom: "2rem" }}>
            {tx.label}
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 600, lineHeight: 1.2, marginBottom: "3rem" }}>
            {tx.heading}
          </h2>

          {shows.length === 0 ? (
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
              style={{ padding: "3rem 2rem", border: "1px solid #e4ddd5", borderRadius: "2px", textAlign: "center", marginBottom: "5rem" }}>
              <p style={{ fontSize: "1rem", color: "#888", marginBottom: "0.75rem" }}>{tx.noShows}</p>
              <p style={{ fontSize: "0.85rem", color: "#bbb" }}>{tx.noShowsSub}</p>
            </motion.div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0", marginBottom: "5rem" }}>
              {shows.map((show, i) => (
                <motion.div key={i}
                  variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
                  transition={{ delay: i * 0.08 }}
                  className="show-item"
                  style={{
                    display: "grid", gridTemplateColumns: "120px 1fr auto",
                    alignItems: "center", gap: "1.5rem",
                    padding: "1.5rem 0",
                    borderBottom: "1px solid #e8e2da",
                  }}>
                  <span style={{ fontSize: "0.85rem", color: "#999", fontVariantNumeric: "tabular-nums" }}>
                    {new Date(show.date).toLocaleDateString(lang === "hu" ? "hu-HU" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 500, fontSize: "0.95rem" }}>{show.venue}</p>
                    <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "#999" }}>{show.city}</p>
                  </div>
                  {show.ticketUrl && (
                    <a href={show.ticketUrl} target="_blank" rel="noreferrer"
                      style={{ fontSize: "0.8rem", letterSpacing: "0.08em", color: "#1a1a1a", textDecoration: "none", border: "1px solid #ccc", borderRadius: "2px", padding: "0.4rem 0.9rem", transition: "all 0.2s", whiteSpace: "nowrap" }}
                      onMouseOver={e => { e.currentTarget.style.background = "#e8963a"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#e8963a"; }}
                      onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1a1a1a"; e.currentTarget.style.borderColor = "#ccc"; }}>
                      Tickets
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Booking inquiry form */}
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
          style={{ borderTop: "1px solid #ddd", paddingTop: "4rem" }}>
          <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#e8963a", textTransform: "uppercase", marginBottom: "1.5rem" }}>
            {tx.bookingLabel}
          </p>
          <h3 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 600, marginBottom: "1rem" }}>
            {tx.bookingHeading}
          </h3>
          <p style={{ fontSize: "0.95rem", color: "#666", lineHeight: 1.7, marginBottom: "2.5rem" }}>
            {tx.bookingBody}
          </p>

          {status === "success" ? (
            <p style={{ padding: "1.5rem", background: "#f0faf0", border: "1px solid #c3e6cb", borderRadius: "2px", color: "#2d6a4f", fontSize: "0.95rem" }}>
              {tx.bookingSuccess}
            </p>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <input name="name" required value={form.name} onChange={handleChange}
                  placeholder={tx.bookingName}
                  style={inputStyle} />
                <input name="email" type="email" required value={form.email} onChange={handleChange}
                  placeholder={tx.bookingEmail}
                  style={inputStyle} />
              </div>
              <div className="form-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <input name="venue" value={form.venue} onChange={handleChange}
                  placeholder={tx.bookingVenue}
                  style={inputStyle} />
                <input name="date" type="date" value={form.date} onChange={handleChange}
                  placeholder={tx.bookingDate}
                  style={inputStyle} />
              </div>
              <select name="type" value={form.type} onChange={handleChange} style={inputStyle}>
                <option value="">{tx.bookingType}</option>
                {tx.bookingTypes.map(tp => <option key={tp} value={tp}>{tp}</option>)}
              </select>
              <textarea name="message" rows={4} value={form.message} onChange={handleChange}
                placeholder={tx.bookingMessage}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
              {status === "error" && (
                <p style={{ fontSize: "0.85rem", color: "#c0392b" }}>{tx.bookingError}</p>
              )}
              <button type="submit" disabled={status === "loading"}
                style={{
                  alignSelf: "flex-start",
                  padding: "0.85rem 2rem",
                  background: "#1a1a1a",
                  color: "#fff",
                  border: "none",
                  borderRadius: "2px",
                  fontSize: "0.9rem",
                  letterSpacing: "0.06em",
                  cursor: status === "loading" ? "not-allowed" : "pointer",
                  opacity: status === "loading" ? 0.7 : 1,
                  fontFamily: "inherit",
                  transition: "opacity 0.2s",
                }}>
                {status === "loading" ? "..." : tx.bookingSubmit}
              </button>
            </form>
          )}
        </motion.div>
      </div>
      <style>{`
        @media (max-width: 520px) {
          .show-item { grid-template-columns: 1fr !important; gap: 0.3rem !important; }
          .form-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

const inputStyle = {
  padding: "0.85rem 1rem",
  border: "1px solid #ddd",
  borderRadius: "2px",
  fontSize: "0.9rem",
  background: "#faf7f2",
  color: "#1a1a1a",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "inherit",
};
