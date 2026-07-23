import { motion, useAnimationFrame } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const VIEWBOX_W = 1536;

function buildPath(offsets, h) {
  const [o1, o2, o3, o4] = offsets;
  const base = h * 0.462; // ~138.5 at 300h
  const low = h * 0.205; // ~61.4  at 300h
  const high = h * 0.528; // ~158.5 at 300h
  const mid = h * 0.35; // ~105   at 300h
  const alt = h * 0.457; // ~137   at 300h

  return `M${VIEWBOX_W},0 H-1 V${base + o1} \
S184.32,${low + o2} 460.8,${high + o3} \
S860.16,${mid + o4} 1121.28,${alt + o1} \
S1413.12,${mid - o2} ${VIEWBOX_W},${mid + o3} V0`;
}

export default function JellyWave({ fill = "#6B7C2F", className = "" }) {
  const [svgHeight, setSvgHeight] = useState(300);
  const [d, setD] = useState(() => buildPath([0, 0, 0, 0], 300));
  const svgHeightRef = useRef(300);
  const t = useRef(0);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = w < 480 ? 120 : w < 768 ? 180 : w < 1024 ? 220 : 300;
      svgHeightRef.current = h;
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
    setD(buildPath(offsets, svgHeightRef.current));
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
