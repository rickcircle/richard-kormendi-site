import { motion } from "framer-motion";
import { fadeUp } from "../utils/animations";

const services = [
  "Website Development",
  "WordPress",
  "Project Management",
  "Google Ads & Analytics",
];

export default function Digital() {
  return (
    <section style={{ padding: "8rem 2rem" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#999", textTransform: "uppercase", marginBottom: "2rem" }}>
            Digital
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 600, lineHeight: 1.2, marginBottom: "2rem" }}>
            14 years building things online.
          </h2>
          <p style={{ fontSize: "1.1rem", lineHeight: 1.8, color: "#444", marginBottom: "3rem" }}>
            Front-end development, digital project management, WordPress, Google Ads.
            Available for freelance work — websites, landing pages, digital setup for small businesses.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
            {services.map(service => (
              <div key={service} style={{ padding: "1.5rem", border: "1px solid #e0e0e0", borderRadius: "2px" }}>
                <p style={{ margin: 0, fontSize: "0.95rem", fontWeight: 500 }}>{service}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
