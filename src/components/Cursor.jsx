import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// Egyedi kurzor — csak desktop-on jelenik meg (pointer: fine)
// mix-blend-mode: difference → világos és sötét háttérre egyaránt látható

export default function Cursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const followerX = useSpring(cursorX, { damping: 20, stiffness: 200 });
  const followerY = useSpring(cursorY, { damping: 20, stiffness: 200 });

  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Touch eszközökön nem kell
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setMounted(true);

    const onMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const onOver = (e) => {
      if (e.target.closest("a, button, [role='button']")) setHovered(true);
    };

    const onOut = (e) => {
      if (e.target.closest("a, button, [role='button']")) setHovered(false);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mouseout", onOut);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      <style>{`html, * { cursor: none !important; }`}</style>

      {/* Kis pont — exact tracking */}
      <motion.div
        style={{
          position: "fixed",
          top: 0, left: 0,
          width: 7, height: 7,
          borderRadius: "50%",
          background: "#fff",
          pointerEvents: "none",
          zIndex: 9999,
          mixBlendMode: "difference",
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />

      {/* Követő gyűrű — spring delay, link hover-re megnő */}
      <motion.div
        animate={{
          width: hovered ? 54 : 34,
          height: hovered ? 54 : 34,
          opacity: hovered ? 0.45 : 0.75,
        }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        style={{
          position: "fixed",
          top: 0, left: 0,
          borderRadius: "50%",
          border: "1.5px solid #fff",
          pointerEvents: "none",
          zIndex: 9998,
          mixBlendMode: "difference",
          x: followerX,
          y: followerY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
    </>
  );
}
