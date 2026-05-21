import { motion } from "framer-motion";
import { useMagnetic } from "../hooks/useMagnetic";

// Újrafelhasználható mágneses link/gomb wrapper
// Használat: <MagneticLink href="..." style={...}>Szöveg</MagneticLink>

export default function MagneticLink({ href, onClick, style, children, strength, ...rest }) {
  const magnetic = useMagnetic(strength);

  const Tag = href ? motion.a : motion.button;

  return (
    <Tag
      ref={magnetic.ref}
      href={href}
      onClick={onClick}
      onMouseMove={magnetic.onMouseMove}
      onMouseLeave={magnetic.onMouseLeave}
      style={{ ...style, ...magnetic.style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
