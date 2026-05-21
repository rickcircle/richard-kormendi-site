import { useRef } from "react";
import { useMotionValue, useSpring } from "framer-motion";

// Mágneses effekt hook — a gomb enyhén a kurzor felé mozdul hover-kor
// Használat: const magnetic = useMagnetic(); → <motion.div {...magnetic} />

export function useMagnetic(strength = 0.35) {
  const ref = useRef(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { damping: 12, stiffness: 180 });
  const springY = useSpring(y, { damping: 12, stiffness: 180 });

  const onMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * strength);
    y.set((e.clientY - centerY) * strength);
  };

  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return {
    ref,
    onMouseMove,
    onMouseLeave,
    style: { x: springX, y: springY },
  };
}
