import { useState } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "../utils/animations";
import { useLang } from "../context/LanguageContext";
import { t } from "../i18n/translations";

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
    } catch {
      setStatus("error");
    }
  };

  return (
    <section style={{ background: "#1a1a1a", padding: "6rem 2rem" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto", textAlign: "center" }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: "#555", textTransform: "uppercase", marginBottom: "1.5rem" }}>
            {tx.label}
          </p>
          <h2 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", fontWeight: 600, color: "#fff", marginBottom: "1rem" }}>
            {tx.heading}
          </h2>
          <p style={{ fontSize: "0.95rem", color: "#666", lineHeight: 1.7, marginBottom: "2.5rem" }}>
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
                    border: "1px solid #333",
                    borderRadius: "2px",
                    background: "#111",
                    color: "#fff",
                    fontSize: "0.9rem",
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                />
                <button type="submit" disabled={status === "loading"}
                  style={{
                    padding: "0.85rem 2rem",
                    background: "#fff",
                    color: "#1a1a1a",
                    border: "none",
                    borderRadius: "2px",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                    letterSpacing: "0.05em",
                    cursor: status === "loading" ? "not-allowed" : "pointer",
                    opacity: status === "loading" ? 0.7 : 1,
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                  }}>
                  {status === "loading" ? "..." : tx.cta}
                </button>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#444", marginTop: "1rem" }}>{tx.privacy}</p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
