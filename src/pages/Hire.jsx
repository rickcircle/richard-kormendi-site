import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLang } from "../context/LanguageContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Globe, Search, BarChart2, ClipboardList,
  Bot, Wrench, Check, Phone, Mail, MapPin,
} from "lucide-react";

// ── Konstansok ────────────────────────────────────────────────────────────────
const HIRE_FORM_URL = "https://formspree.io/f/mwvzvzrn";
const A  = "#00d4ff";                        // accent
const AB = "rgba(0,212,255,0.10)";           // accent bg
const AD = "rgba(0,212,255,0.25)";           // accent border
const BG = "#111111";
const S1 = "#181818";                        // surface alt (látható váltás)
const BR = "#2e2e2e";                        // border (jól látható)

const ICON_MAP = { Globe, Search, BarChart2, ClipboardList, Bot, Wrench };

// ── Fordítások ────────────────────────────────────────────────────────────────
const TX = {
  en: {
    meta: {
      title: "Web Development Esztergom | Richard Körmendi – Freelance Web Developer",
      desc:  "Professional web development, SEO and Google Ads in Esztergom and remote. React, WordPress, AI tools. Request a free consultation!",
    },
    hero: {
      badge: "Freelance Web Developer",
      h1a: "A website",
      h1accent: "Google loves.",
      sub: "Freelance web developer and digital project manager. React, WordPress, SEO, Google Ads – everything that works online.",
      cta: "Request a free consultation",
      sec: "See packages",
    },
    services: {
      label: "Services",
      title: "What I build for you",
      items: [
        { icon: "Globe",        title: "Website Development",    desc: "React or WordPress – fast, mobile-first, SEO-ready from day one." },
        { icon: "Search",       title: "SEO Optimisation",       desc: "More organic traffic. Keyword research, on-page fixes, technical audit." },
        { icon: "BarChart2",    title: "Google Ads Management",  desc: "Paid campaigns that bring real leads, not just empty clicks." },
        { icon: "ClipboardList",title: "Project Management",     desc: "From brief to launch – I coordinate design, dev and content." },
        { icon: "Bot",          title: "AI Chatbot Integration", desc: "24/7 automated answers for the most common customer questions." },
        { icon: "Wrench",       title: "Monthly Maintenance",    desc: "Updates, speed monitoring, SEO reports. No surprises." },
      ],
    },
    why: {
      label: "Why me",
      title: "Built different.",
      items: [
        { num: "14", unit: "yrs", label: "Digital experience", desc: "Front-end development, SEO, WordPress, digital marketing — since 2010." },
        { num: "AI", unit: "",   label: "Augmented development", desc: "Faster delivery, smarter solutions. I use AI tools so you get more for your budget." },
        { num: "📍", unit: "",   label: "Local + remote",         desc: "Based in Esztergom. I work with clients locally and across the country." },
      ],
    },
    packages: {
      label: "Pricing",
      title: "Transparent packages.",
      note: "Prices include VAT. Custom quotes available on request.",
      items: [
        {
          name: "Starter", price: "150 000 Ft", period: "", highlight: false,
          desc: "Perfect for small businesses stepping online for the first time.",
          features: ["5-page website", "Mobile-first design", "SEO setup", "Google Business Profile", "1 month free support"],
          cta: "Get started",
        },
        {
          name: "Business", price: "280 000 Ft", period: "", highlight: true,
          desc: "Everything in Starter, plus the tools to grow faster.",
          features: ["Everything in Starter", "Google Ads campaign setup", "Copywriting (5 pages)", "Analytics + Search Console", "2 months free support"],
          cta: "Most popular",
        },
        {
          name: "Monthly", price: "45 000 Ft", period: "/mo", highlight: false,
          desc: "Ongoing support and growth for your existing site.",
          features: ["Monthly updates", "SEO monitoring + report", "Content refresh", "Google Ads management", "Cancel anytime"],
          cta: "Start retainer",
        },
      ],
    },
    workflow: {
      label: "How it works",
      title: "Simple process.",
      steps: [
        { num: "01", title: "Consultation", desc: "We discuss goals, timeline and budget. No commitment required." },
        { num: "02", title: "Planning",     desc: "A clear proposal arrives within 48 hours. You approve — we start." },
        { num: "03", title: "Development",  desc: "Regular updates on a live staging link. No surprises." },
        { num: "04", title: "Handover",     desc: "Go live, training if needed, 1 month free support included." },
      ],
    },
    contact: {
      label: "Contact",
      title: "Let's talk.",
      sub: "I reply within 24 hours. Or reach me directly:",
      namePh: "Your name",
      emailPh: "Email address",
      phonePh: "Phone number (optional)",
      msgPh: "Tell me about your project...",
      send: "Send message",
      sending: "Sending…",
      success: "Got it! I'll reply within 24 hours.",
      error: "Something went wrong. Please email directly.",
    },
  },

  hu: {
    meta: {
      title: "Weboldal készítés Esztergom | Körmendi Richard – Freelance Web Fejlesztő",
      desc:  "Profi weboldal készítés, SEO és Google Ads kezelés Esztergomban és online. React, WordPress, AI eszközök. Kérj ingyenes konzultációt!",
    },
    hero: {
      badge: "Freelance Web Fejlesztő",
      h1a: "Weboldal,",
      h1accent: "amit a Google is szeret.",
      sub: "Freelance web fejlesztő és digitális projektmenedzser. React, WordPress, SEO, Google Ads – mindent vállalok ami online működik.",
      cta: "Kérj ingyenes konzultációt",
      sec: "Csomagok",
    },
    services: {
      label: "Szolgáltatások",
      title: "Mit csinálok neked",
      items: [
        { icon: "Globe",        title: "Weboldal készítés",       desc: "React vagy WordPress – gyors, mobilbarát, SEO-kész az első naptól." },
        { icon: "Search",       title: "SEO optimalizálás",       desc: "Több organikus látogató. Kulcsszókutatás, on-page javítás, technikai audit." },
        { icon: "BarChart2",    title: "Google Ads kezelés",      desc: "Fizetett kampányok, amelyek valódi leadeket hoznak, nem csak kattintásokat." },
        { icon: "ClipboardList",title: "Projektmenedzsment",      desc: "Brieftől az átadásig – koordinálom a tervezést, fejlesztést és tartalmat." },
        { icon: "Bot",          title: "AI chatbot integráció",   desc: "24/7 automatikus válaszok a leggyakoribb ügyféli kérdésekre." },
        { icon: "Wrench",       title: "Havi karbantartás",       desc: "Frissítések, sebesség-monitorozás, SEO riportok. Meglepetés nélkül." },
      ],
    },
    why: {
      label: "Miért én",
      title: "Más megközelítés.",
      items: [
        { num: "14", unit: "év", label: "Digitális tapasztalat", desc: "Front-end fejlesztés, SEO, WordPress, digitális marketing — 2010 óta." },
        { num: "AI", unit: "",   label: "Augmented fejlesztés",  desc: "Gyorsabb átadás, okosabb megoldások. AI eszközöket használok, hogy többet kapj a keretedből." },
        { num: "📍", unit: "",   label: "Helyi + remote",         desc: "Esztergom-alapú. Dolgozom helyi ügyfelekkel és az ország más pontjain is." },
      ],
    },
    packages: {
      label: "Árak",
      title: "Átlátható csomagok.",
      note: "Az árak ÁFÁ-t tartalmaznak. Egyedi ajánlat is kérhető.",
      items: [
        {
          name: "Alap", price: "150 000 Ft", period: "", highlight: false,
          desc: "Tökéletes kis vállalkozásoknak, akik most lépnek online.",
          features: ["5 aloldalas weboldal", "Mobilbarát dizájn", "SEO beállítás", "Google Cégem optimalizálás", "1 hónap ingyenes support"],
          cta: "Elkezdeni",
        },
        {
          name: "Üzleti", price: "280 000 Ft", period: "", highlight: true,
          desc: "Minden ami az Alapban van, plusz növekedési eszközök.",
          features: ["Minden ami az Alapban van", "Google Ads kampány beállítás", "Szövegírás (5 oldal)", "Analytics + Search Console", "2 hónap ingyenes support"],
          cta: "Legnépszerűbb",
        },
        {
          name: "Havidíjas", price: "45 000 Ft", period: "/hó", highlight: false,
          desc: "Folyamatos támogatás és növekedés meglévő oldalakhoz.",
          features: ["Havi frissítések", "SEO monitorozás + riport", "Tartalom frissítés", "Google Ads kezelés", "Bármikor lemondható"],
          cta: "Retainer indítása",
        },
      ],
    },
    workflow: {
      label: "Hogyan dolgozom",
      title: "Egyszerű folyamat.",
      steps: [
        { num: "01", title: "Konzultáció", desc: "Átbeszéljük a céljaidat, határidőt és keretet. Semmi kötelezettség." },
        { num: "02", title: "Tervezés",    desc: "48 órán belül ajánlat. Jóváhagyod — nekiállunk." },
        { num: "03", title: "Fejlesztés",  desc: "Rendszeres frissítések staging linken. Nincs meglepetés." },
        { num: "04", title: "Átadás",      desc: "Élesítés, betanítás ha kell, 1 hónap ingyenes support." },
      ],
    },
    contact: {
      label: "Kapcsolat",
      title: "Beszéljünk.",
      sub: "24 órán belül válaszolok. Vagy érj el közvetlenül:",
      namePh: "Neved",
      emailPh: "Email cím",
      phonePh: "Telefonszám (nem kötelező)",
      msgPh: "Meséld el a projektedet…",
      send: "Üzenet küldése",
      sending: "Küldés…",
      success: "Megkaptam! 24 órán belül visszajelzek.",
      error: "Hiba történt. Írj emailt közvetlenül.",
    },
  },
};

// ── Segéd animációk ───────────────────────────────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

// ── Fő komponens ──────────────────────────────────────────────────────────────
export default function Hire() {
  const { lang } = useLang();
  const tx = TX[lang] ?? TX.en;

  const [form, setForm]     = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState("idle");

  // Meta frissítés
  useEffect(() => {
    const prev = document.title;
    document.title = tx.meta.title;
    const el = document.querySelector('meta[name="description"]');
    const prevDesc = el?.getAttribute("content") || "";
    el?.setAttribute("content", tx.meta.desc);
    return () => {
      document.title = prev;
      el?.setAttribute("content", prevDesc);
    };
  }, [tx]);

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
    } catch { setStatus("error"); }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: BG, color: "#fff", minHeight: "100vh" }}>
      <Navbar />

      {/* ══════════════════════════════════════════════════════════
          1. HERO
      ══════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden", padding: "8rem 2rem 6rem" }}>

        {/* Háttér gradiens */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: `radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,212,255,0.07) 0%, transparent 70%)` }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(to right, transparent, ${A}40, transparent)` }} />

        <div style={{ maxWidth: "860px", margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <motion.div variants={fadeUp} initial="hidden" animate="visible">

            {/* Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.35rem 1rem", border: `1px solid ${AD}`, borderRadius: "999px", fontSize: "0.75rem", letterSpacing: "0.12em", color: A, textTransform: "uppercase", marginBottom: "2rem" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: A, boxShadow: `0 0 8px ${A}` }} />
              {tx.hero.badge}
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: "clamp(2.6rem, 7vw, 5rem)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em", marginBottom: "1.5rem", color: "#fff" }}>
              {tx.hero.h1a}{" "}
              <span style={{ color: A }}>{tx.hero.h1accent}</span>
            </h1>

            {/* Subtitle */}
            <p style={{ fontSize: "clamp(1rem, 2.2vw, 1.2rem)", color: "#888", lineHeight: 1.8, maxWidth: "580px", margin: "0 auto 2.5rem" }}>
              {tx.hero.sub}
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
              <a href="#contact-form" style={{ padding: "0.9rem 2rem", background: A, color: "#000", borderRadius: "6px", fontSize: "0.92rem", fontWeight: 700, letterSpacing: "0.03em", textDecoration: "none", transition: "opacity 0.2s" }}
                onMouseOver={e => e.currentTarget.style.opacity = "0.88"}
                onMouseOut={e => e.currentTarget.style.opacity = "1"}>
                {tx.hero.cta}
              </a>
              <a href="#packages" style={{ padding: "0.9rem 2rem", background: "transparent", color: "#fff", border: `1px solid ${BR}`, borderRadius: "6px", fontSize: "0.92rem", fontWeight: 500, textDecoration: "none", transition: "border-color 0.2s" }}
                onMouseOver={e => e.currentTarget.style.borderColor = A}
                onMouseOut={e => e.currentTarget.style.borderColor = BR}>
                {tx.hero.sec}
              </a>
            </div>

          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          2. SZOLGÁLTATÁSOK
      ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "7rem 2rem", background: S1, borderTop: `1px solid ${BR}` }}>
        <div style={{ maxWidth: "1040px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} style={{ marginBottom: "3.5rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: A, textTransform: "uppercase", marginBottom: "0.75rem", fontWeight: 600 }}>
              {tx.services.label}
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
              {tx.services.title}
            </h2>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1px", background: BR, borderRadius: "12px", overflow: "hidden", border: `1px solid ${BR}` }}>
            {tx.services.items.map((svc, i) => {
              const Icon = ICON_MAP[svc.icon];
              return (
                <motion.div key={i} variants={fadeUp}
                  style={{ background: "#1c1c1c", padding: "2rem", cursor: "default", transition: "background 0.2s" }}
                  onMouseOver={e => e.currentTarget.style.background = "#252525"}
                  onMouseOut={e => e.currentTarget.style.background = "#1c1c1c"}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: AB, border: `1px solid ${AD}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                    {Icon && <Icon size={18} color={A} />}
                  </div>
                  <p style={{ fontSize: "1rem", fontWeight: 600, color: "#fff", marginBottom: "0.5rem" }}>{svc.title}</p>
                  <p style={{ fontSize: "0.85rem", color: "#999", lineHeight: 1.6 }}>{svc.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          3. MIÉRT ÉN
      ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "7rem 2rem", background: BG, borderTop: `1px solid ${BR}` }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} style={{ marginBottom: "3.5rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: A, textTransform: "uppercase", marginBottom: "0.75rem", fontWeight: 600 }}>
              {tx.why.label}
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
              {tx.why.title}
            </h2>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "2rem" }}>
            {tx.why.items.map((item, i) => (
              <motion.div key={i} variants={fadeUp}
                style={{ padding: "2.5rem 2rem", background: "#1c1c1c", border: `1px solid ${BR}`, borderRadius: "12px", textAlign: "center" }}>
                <div style={{ fontSize: item.num.length > 2 ? "2rem" : "3rem", fontWeight: 800, color: A, lineHeight: 1, marginBottom: "0.25rem", letterSpacing: "-0.02em" }}>
                  {item.num}
                  <span style={{ fontSize: "1rem", fontWeight: 400, color: "#888", marginLeft: "0.25rem" }}>{item.unit}</span>
                </div>
                <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "#fff", margin: "0.75rem 0 0.5rem" }}>{item.label}</p>
                <p style={{ fontSize: "0.82rem", color: "#999", lineHeight: 1.6 }}>{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          4. CSOMAGOK
      ══════════════════════════════════════════════════════════ */}
      <section id="packages" style={{ padding: "7rem 2rem", background: S1, borderTop: `1px solid ${BR}` }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} style={{ marginBottom: "3.5rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: A, textTransform: "uppercase", marginBottom: "0.75rem", fontWeight: 600 }}>
              {tx.packages.label}
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
              {tx.packages.title}
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#777" }}>{tx.packages.note}</p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", alignItems: "start" }}>
            {tx.packages.items.map((pkg, i) => (
              <motion.div key={i} variants={fadeUp}
                style={{
                  padding: "2.5rem 2rem",
                  background: pkg.highlight ? AB : "#1c1c1c",
                  border: `1px solid ${pkg.highlight ? AD : BR}`,
                  borderRadius: "12px",
                  position: "relative",
                  boxShadow: pkg.highlight ? `0 0 40px rgba(0,212,255,0.08)` : "none",
                }}>
                {pkg.highlight && (
                  <div style={{ position: "absolute", top: "-1px", left: "50%", transform: "translateX(-50%)", background: A, color: "#000", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0.25rem 0.9rem", borderRadius: "0 0 6px 6px" }}>
                    ★ {pkg.cta}
                  </div>
                )}
                <p style={{ fontSize: "0.75rem", letterSpacing: "0.12em", color: pkg.highlight ? A : "#aaa", textTransform: "uppercase", fontWeight: 600, marginBottom: "1rem" }}>
                  {pkg.name}
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "2rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>{pkg.price}</span>
                  {pkg.period && <span style={{ fontSize: "0.9rem", color: "#555" }}>{pkg.period}</span>}
                </div>
                <p style={{ fontSize: "0.85rem", color: "#999", lineHeight: 1.6, marginBottom: "1.75rem" }}>{pkg.desc}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 2rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  {pkg.features.map(f => (
                    <li key={f} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start", fontSize: "0.85rem", color: "#aaa" }}>
                      <Check size={14} color={A} style={{ flexShrink: 0, marginTop: "2px" }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="#contact-form"
                  style={{
                    display: "block", textAlign: "center", padding: "0.8rem",
                    background: pkg.highlight ? A : "transparent",
                    color: pkg.highlight ? "#000" : A,
                    border: `1px solid ${pkg.highlight ? A : AD}`,
                    borderRadius: "6px", fontSize: "0.88rem", fontWeight: 600,
                    textDecoration: "none", transition: "opacity 0.2s",
                  }}
                  onMouseOver={e => e.currentTarget.style.opacity = "0.85"}
                  onMouseOut={e => e.currentTarget.style.opacity = "1"}>
                  {pkg.highlight ? pkg.cta : pkg.cta}
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          5. MUNKAFOLYAMAT
      ══════════════════════════════════════════════════════════ */}
      <section style={{ padding: "7rem 2rem", background: BG, borderTop: `1px solid ${BR}` }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} style={{ marginBottom: "3.5rem", textAlign: "center" }}>
            <p style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: A, textTransform: "uppercase", marginBottom: "0.75rem", fontWeight: 600 }}>
              {tx.workflow.label}
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>
              {tx.workflow.title}
            </h2>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}
            className="workflow-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0" }}>
            {tx.workflow.steps.map((step, i) => (
              <motion.div key={i} variants={fadeUp}
                style={{ position: "relative", padding: "0 1.5rem 0 0", paddingRight: i < 3 ? "1.5rem" : 0 }}>
                {/* Összekötő vonal */}
                {i < 3 && (
                  <div style={{ position: "absolute", top: "19px", left: "calc(40px + 1rem)", right: 0, height: "1px", background: `linear-gradient(to right, ${AD}, transparent)` }} />
                )}
                {/* Szám badge */}
                <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: AB, border: `1px solid ${AD}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem", flexShrink: 0 }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: A, letterSpacing: "0.05em" }}>{step.num}</span>
                </div>
                <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "#fff", marginBottom: "0.5rem" }}>{step.title}</p>
                <p style={{ fontSize: "0.82rem", color: "#888", lineHeight: 1.6 }}>{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          6. CONTACT FORM
      ══════════════════════════════════════════════════════════ */}
      <section id="contact-form" style={{ padding: "7rem 2rem", background: S1, borderTop: `1px solid ${BR}` }}>
        <div style={{ maxWidth: "620px", margin: "0 auto" }}>
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }}>
            <p style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: A, textTransform: "uppercase", marginBottom: "0.75rem", fontWeight: 600 }}>
              {tx.contact.label}
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
              {tx.contact.title}
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#555", marginBottom: "2.5rem" }}>
              {tx.contact.sub}
            </p>

            {/* Közvetlen elérhetőségek */}
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
              {[
                { Icon: Mail,  text: "richard.kormendi@gmail.com", href: "mailto:richard.kormendi@gmail.com" },
                { Icon: Phone, text: "+36 30 148 0917",            href: "tel:+36301480917" },
                { Icon: MapPin,text: "Esztergom",                   href: null },
              ].map(({ Icon, text, href }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Icon size={14} color={A} />
                  {href
                    ? <a href={href} style={{ fontSize: "0.85rem", color: "#888", textDecoration: "none" }}
                        onMouseOver={e => e.currentTarget.style.color = A}
                        onMouseOut={e => e.currentTarget.style.color = "#888"}>{text}</a>
                    : <span style={{ fontSize: "0.85rem", color: "#888" }}>{text}</span>
                  }
                </div>
              ))}
            </div>

            {/* Form */}
            {status === "success" ? (
              <div style={{ padding: "1.5rem", background: AB, border: `1px solid ${AD}`, borderRadius: "8px", color: A, fontSize: "0.95rem" }}>
                {tx.contact.success}
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="hire-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <input name="name" required value={form.name} onChange={handleChange}
                    placeholder={tx.contact.namePh} style={inputStyle} />
                  <input name="email" type="email" required value={form.email} onChange={handleChange}
                    placeholder={tx.contact.emailPh} style={inputStyle} />
                </div>
                <input name="phone" value={form.phone} onChange={handleChange}
                  placeholder={tx.contact.phonePh} style={inputStyle} />
                <textarea name="message" rows={5} required value={form.message} onChange={handleChange}
                  placeholder={tx.contact.msgPh}
                  style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
                {status === "error" && (
                  <p style={{ fontSize: "0.85rem", color: "#ff4e42" }}>{tx.contact.error}</p>
                )}
                <button type="submit" disabled={status === "loading"}
                  style={{
                    alignSelf: "flex-start", padding: "0.9rem 2.25rem",
                    background: status === "loading" ? "#222" : A,
                    color: status === "loading" ? "#555" : "#000",
                    border: "none", borderRadius: "6px", fontSize: "0.92rem", fontWeight: 700,
                    cursor: status === "loading" ? "not-allowed" : "pointer",
                    fontFamily: "inherit", transition: "opacity 0.2s",
                  }}>
                  {status === "loading" ? tx.contact.sending : tx.contact.send}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />

      <style>{`
        @media (max-width: 540px) {
          .hire-grid-2 { grid-template-columns: 1fr !important; }
          .workflow-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 360px) {
          .workflow-grid { grid-template-columns: 1fr !important; }
        }
        input::placeholder, textarea::placeholder { color: #3a3a3a; }
        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: ${AD} !important;
          box-shadow: 0 0 0 3px rgba(0,212,255,0.07);
        }
      `}</style>
    </div>
  );
}

// ── Input stílus ──────────────────────────────────────────────────────────────
const inputStyle = {
  padding: "0.85rem 1rem",
  background: "#0f0f0f",
  border: `1px solid #2a2a2a`,
  borderRadius: "6px",
  fontSize: "0.9rem",
  color: "#fff",
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
};
