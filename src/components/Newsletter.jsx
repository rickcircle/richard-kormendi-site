import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "../utils/animations";
import { useLang } from "../context/LanguageContext";
import { t } from "../i18n/translations";
import { track } from "../utils/track";

const ACCENT = "#c23b3b";

// Mailchimp feliratkozás a Vercel serverless proxyn keresztül (/api/subscribe.js)
// Env vars kellenek a Vercel dashboardon: MAILCHIMP_API_KEY + MAILCHIMP_LIST_ID
const NEWSLETTER_URL = "/api/subscribe";

export default function Newsletter() {
  const { lang } = useLang();
  const tx = t[lang].newsletter;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(NEWSLETTER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, _subject: "Newsletter signup" }),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) track("click", { label: "newsletter_signup" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="newsletter" style={{ background: "#0b0a08", padding: "6rem 2rem" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto", textAlign: "center" }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: "rgba(245,241,234,0.4)", textTransform: "uppercase", marginBottom: "1.5rem" }}>
            {tx.label}
          </p>
          <h2 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", fontWeight: 600, color: "#f5f1ea", marginBottom: "1rem" }}>
            {tx.heading}
          </h2>
          <p style={{ fontSize: "0.95rem", color: "rgba(245,241,234,0.5)", lineHeight: 1.7, marginBottom: "2.5rem" }}>
            {tx.body}
          </p>

          {status === "success" ? (
            <p style={{ fontSize: "1rem", color: "#a8d5b5" }}>{tx.success}</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={tx.placeholder}
                  style={{
                    flex: "1 1 260px",
                    padding: "0.85rem 1.1rem",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "2px",
                    background: "rgba(255,255,255,0.04)",
                    color: "#f5f1ea",
                    fontSize: "0.9rem",
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                />
                <button type="submit" disabled={status === "loading"}
                  style={{
                    padding: "0.85rem 2rem",
                    background: ACCENT,
                    color: "#fff",
                    border: "none",
                    borderRadius: "2px",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    letterSpacing: "0.05em",
                    cursor: status === "loading" ? "not-allowed" : "pointer",
                    opacity: status === "loading" ? 0.7 : 1,
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                    boxShadow: "0 0 20px rgba(194, 59, 59,0.3)",
                  }}>
                  {status === "loading" ? "..." : tx.cta}
                </button>
              </div>
              <p style={{ fontSize: "0.75rem", color: "rgba(245,241,234,0.35)", marginTop: "1rem" }}>{tx.privacy}</p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
