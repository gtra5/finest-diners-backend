import { motion, useAnimationFrame } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const VIEWBOX_W = 1536;
const VIEWBOX_H = 300;

function buildPath(offsets, h) {
  const [o1, o2, o3, o4] = offsets;
  const base = h * 0.46; // ~138px at 300h
  const mid = h * 0.35; // ~105px at 300h
  const alt = h * 0.528; // ~158px at 300h
  const alt2 = h * 0.457; // ~137px at 300h

  return `M${VIEWBOX_W},0 H-1 V${base + o1} \
S184.32,${base - 77 + o2} 460.8,${alt + o3} \
S860.16,${mid + o4} 1121.28,${alt2 + o1} \
S1413.12,${mid - o2} ${VIEWBOX_W},${mid + o3} V0`;
}

export default function JellyWave2({ fill = "#050A0A", className = "" }) {
  const [svgHeight, setSvgHeight] = useState(VIEWBOX_H);
  const [d, setD] = useState(() => buildPath([0, 0, 0, 0], VIEWBOX_H));
  const t = useRef(0);

  // Adjust wave height based on viewport width
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h =
        w < 480
          ? 120 // mobile
          : w < 768
            ? 180 // tablet
            : w < 1024
              ? 220 // small desktop
              : 300; // full desktop
      setSvgHeight(h);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useAnimationFrame((_, delta) => {
    t.current += delta / 1000;
    const time = t.current;

    const offsets = [
      Math.sin(time * 0.7) * 18,
      Math.sin(time * 0.5 + 1.2) * 22,
      Math.sin(time * 0.9 + 2.4) * 14,
      Math.sin(time * 0.6 + 0.8) * 20,
    ];

    setD(buildPath(offsets, svgHeight));
  });

  return (
    <svg
      className={`pointer-events-none block w-full ${className}`}
      width="100%"
      height={svgHeight}
      viewBox={`0 0 ${VIEWBOX_W} ${svgHeight}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMax slice" // ← "slice" instead of "meet"
      aria-hidden="true"
      style={{ display: "block", marginTop: "-2px" }} // ← kills the inline gap
    >
      <motion.path d={d} fill={fill} />
    </svg>
  );
}
