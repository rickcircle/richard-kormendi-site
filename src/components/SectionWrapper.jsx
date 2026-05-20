import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/**
 * Minden szekciót becsomagoló komponens.
 * Belépéskor alulról "nyílik ki" a tartalom, és a háttér is halványan beúszik.
 */
export default function SectionWrapper({ id, bg = "#ffffff", children, style = {} }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ background: bg, ...style }}
    >
      <motion.div
        initial={{ y: 32, opacity: 0 }}
        animate={inView ? { y: 0, opacity: 1 } : { y: 32, opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
      >
        {children}
      </motion.div>
    </motion.section>
  );
}
