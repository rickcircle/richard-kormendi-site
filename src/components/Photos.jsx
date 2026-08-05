import { useRef } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "../utils/animations";
import { useLang } from "../context/LanguageContext";
import { t } from "../i18n/translations";
import photosData from "../data/photos.json";

import photo1    from "../assets/images/photo-esztergom-basilica.jpg";
import photo2    from "../assets/images/photo-neon-city.jpg";
import photo3    from "../assets/images/photo-bar-suit.jpg";
import photo4    from "../assets/images/photo-golden-hour.jpg";
import photo5    from "../assets/images/photo-img3896.jpg";
import photo6    from "../assets/images/photo-img3953.jpg";
import photo7    from "../assets/images/photo-guitarist.jpg";
import photo8    from "../assets/images/photo-studio-portrait.jpg";
import photoLast from "../assets/images/6751152D-9E3E-4556-883D-A15F0A63B04F_1_105_c.jpeg";

const staticPhotos = [
  { src: photo1,    alt: "Richard Körmendi portrait outdoors near Esztergom Basilica" },
  { src: photo2,    alt: "Richard Körmendi in a neon-lit city street" },
  { src: photo3,    alt: "Richard Körmendi at a bar in a black suit" },
  { src: photo4,    alt: "Richard Körmendi portrait in golden hour light" },
  { src: photo5,    alt: "Richard Körmendi with an electric guitar" },
  { src: photo6,    alt: "Richard Körmendi candid outdoor photo" },
  { src: photo7,    alt: "Richard Körmendi playing electric guitar in a studio" },
  { src: photo8,    alt: "Richard Körmendi in a recording studio" },
  { src: photoLast, alt: "Richard Körmendi behind the scenes" },
];

export default function Photos() {
  const { lang } = useLang();
  const tx = t[lang].photos;
  const scrollRef = useRef(null);

  // CMS-fotók ha vannak, egyébként statikus fallback
  const photos = photosData.photos.length > 0 ? photosData.photos : staticPhotos;

  const scroll = dir => scrollRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  return (
    <section id="photos" style={{ padding: "8rem 0", background: "#1f1113", overflow: "hidden" }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 2rem", marginBottom: "3rem" }}>
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.05 }}>
          <p style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "rgba(245,241,234,0.4)", textTransform: "uppercase", marginBottom: "2rem" }}>
            {tx.label}
          </p>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 600, lineHeight: 1.2, color: "#f5f1ea" }}>
            {tx.heading}
          </h2>
        </motion.div>
      </div>

      <div style={{ position: "relative" }}>
        <div ref={scrollRef} style={{ display: "flex", gap: "1rem", overflowX: "auto", scrollSnapType: "x mandatory", padding: "0 2rem", scrollbarWidth: "none" }}>
          {photos.map((photo, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.05 }} transition={{ duration: 0.6, delay: i * 0.1 }}
              style={{ flex: "0 0 300px", height: "400px", scrollSnapAlign: "start", borderRadius: "2px", overflow: "hidden", background: "rgba(255,255,255,0.05)", position: "relative" }}>
              <img src={photo.src} alt={photo.alt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              {photo.caption && (
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0.75rem 1rem", background: "linear-gradient(transparent, rgba(0,0,0,0.65))", color: "#fff", fontSize: "0.8rem", letterSpacing: "0.03em" }}>
                  {photo.caption}
                </div>
              )}
            </motion.div>
          ))}
        </div>
        {photos.length > 1 && (
          <>
            <button onClick={() => scroll(-1)} style={arrowStyle("left")} aria-label="Scroll left">‹</button>
            <button onClick={() => scroll(1)} style={arrowStyle("right")} aria-label="Scroll right">›</button>
          </>
        )}
      </div>
      <style>{`div::-webkit-scrollbar{display:none}`}</style>
    </section>
  );
}

function arrowStyle(side) {
  return { position: "absolute", top: "50%", [side]: "1rem", transform: "translateY(-50%)", background: "rgba(11,10,8,0.7)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: "40px", height: "40px", fontSize: "1.4rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, color: "#f5f1ea" };
}
