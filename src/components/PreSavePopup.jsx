import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "../context/LanguageContext";
import { track } from "../utils/track";
import coverMyBurningDevotion from "../assets/images/cover-my-burning-devotion.jpg";

const ACCENT = "#c23b3b";
const SEEN_KEY = "rk_popup_mbd_seen";
const SHOW_DELAY_MS = 4000;
const MBD_URL = "https://distrokid.com/hyperfollow/richardkrmendi/my-burning-devotion";

// Csak egyszer, böngészőnként (localStorage) — nem IP alapján: az IP megosztott/változó
// (mobilnet, VPN, közös wifi), a localStorage megbízhatóbban azonosítja ugyanazt a látogatót,
// és nem igényel semmilyen IP-tárolást, ami eddig sem volt a rendszer része.
export default function PreSavePopup() {
  const { lang } = useLang();
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("rk_owner") === "1") return;
      if (localStorage.getItem(SEEN_KEY) === "1") return;
    } catch {
      return;
    }
    const id = setTimeout(() => setShow(true), SHOW_DELAY_MS);
    return () => clearTimeout(id);
  }, []);

  const dismiss = () => {
    setShow(false);
    try { localStorage.setItem(SEEN_KEY, "1"); } catch { /* noop */ }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={dismiss}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1.5rem",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={e => e.stopPropagation()}
            style={{
              position: "relative", width: "min(360px, 100%)",
              background: "#150b0c", border: "1px solid rgba(194,59,59,0.4)",
              borderRadius: "16px", overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(194,59,59,0.2)",
            }}
          >
            <button
              onClick={dismiss}
              aria-label="Close"
              style={{
                position: "absolute", top: "0.75rem", right: "0.75rem", zIndex: 2,
                width: "28px", height: "28px", borderRadius: "50%",
                border: "none", background: "rgba(0,0,0,0.5)", color: "#fff",
                fontSize: "1.1rem", lineHeight: 1, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              ×
            </button>

            <img
              src={coverMyBurningDevotion}
              alt="My Burning Devotion"
              style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", display: "block" }}
            />

            <div style={{ padding: "1.5rem" }}>
              <span style={{
                display: "inline-block", fontSize: "0.65rem", letterSpacing: "0.1em",
                color: "#fff", background: ACCENT, borderRadius: "999px",
                padding: "3px 10px", textTransform: "uppercase", fontWeight: 700,
                marginBottom: "0.85rem",
              }}>
                {lang === "hu" ? "Hamarosan" : "Coming Soon"}
              </span>
              <h3 style={{ margin: "0 0 0.5rem", color: "#fff", fontSize: "1.2rem", fontWeight: 700 }}>
                My Burning Devotion
              </h3>
              <p style={{ margin: "0 0 1.25rem", color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                {lang === "hu"
                  ? "Az új kislemezem hamarosan érkezik — foglald le előre most, hogy elsők között hallgathasd."
                  : "My next single is on its way — pre-save it now to be among the first to hear it."}
              </p>
              <a
                href={MBD_URL}
                target="_blank" rel="noreferrer"
                onClick={() => { track("click", { label: "popup_presave_burning_devotion" }); dismiss(); }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  padding: "0.85rem", background: ACCENT, color: "#fff",
                  borderRadius: "8px", textDecoration: "none", fontWeight: 600,
                  fontSize: "0.9rem", letterSpacing: "0.03em",
                  boxShadow: "0 0 24px rgba(194,59,59,0.35)",
                }}
              >
                {lang === "hu" ? "Előrendelés most →" : "Pre-Save Now →"}
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
