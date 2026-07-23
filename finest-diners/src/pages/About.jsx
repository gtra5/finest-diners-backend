import { motion, useAnimationFrame } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import HeroBg from "../assets/backgroundVectors.svg";
import img1 from "../assets/advertisment.jpg";
import img2 from "../assets/front-view-smiley-man-holding-pizza.jpg";
import img3 from "../assets/medium-shot-smiley-man-eating-bistro.jpg";
import TimelineSlider from "../components/timeslider";
import MobileCarousel from "../components/carousel";
import DesktopCarousel from "../components/desktopCarousel";

/* ─── Brand tokens ──────────────────────────────────────────── */
const OLIVE = "#6B7C2F";
const OLIVE_LIGHT = "#D4E2B9";
const OLIVE_DIM = "#3a4419";
const DARK = "#050A0A";
const SURFACE = "#0f1410";
const BORDER = "#1e251e";
const BG = "#050A0A";

/* ─── Data ──────────────────────────────────────────────────── */
const PILLARS = [
  {
    icon: "🌱",
    label: "SOURCING",
    title: "Farm to Table",
    body: "Every ingredient traced back to its origin. We partner directly with local farms who share our commitment to quality and sustainability.",
  },
  {
    icon: "👨‍🍳",
    label: "CRAFT",
    title: "Chef-Led Kitchens",
    body: "Our kitchens are led by experienced chefs who treat every order as a signature dish — not a conveyor-belt product.",
  },
  {
    icon: "⚡",
    label: "SPEED",
    title: "Precision Delivery",
    body: "Real-time tracking, optimised routing, and dedicated staff mean your food arrives hot and on time — every time.",
  },
  {
    icon: "♻️",
    label: "RESPONSIBILITY",
    title: "Zero-Waste Packaging",
    body: "All packaging is compostable or fully recyclable. We're working towards a net-zero delivery operation by 2027.",
  },
];

const TEAM = [
  {
    name: "Olokode Elijah",
    role: "Founder & CEO",
    emoji: "👩🏾‍💼",
    initials: "EO",
  },
  { name: "Liam Chen", role: "Head of Culinary", emoji: "👨🏻‍🍳", initials: "LC" },
  { name: "Sofia Ramos", role: "Operations Lead", emoji: "👩🏽‍💻", initials: "SR" },
  {
    name: "Daniel Müller",
    role: "Delivery Logistics",
    emoji: "🧑🏼‍🔧",
    initials: "DM",
  },
];

const STATS = [
  { value: "40k+", label: "Orders delivered" },
  { value: "98%", label: "On-time rate" },
  { value: "120+", label: "Restaurant partners" },
  { value: "2021", label: "Founded" },
];

/* ─── Wave constants ─────────────────────────────────────────── */
const VW = 1536;
const VH = 900;
const WAVE_HEIGHT = 300;
const BASE = VH - WAVE_HEIGHT;

function buildBottomWave([o1, o2, o3, o4]) {
  return [
    `M${VW},${BASE}`,
    `H-1`,
    `V${BASE + 138.553425 + o1}`,
    `S184.32,${BASE + 61.446575 + o2} 460.8,${BASE + 158.553425 + o3}`,
    `S860.16,${BASE + 105 + o4} 1121.28,${BASE + 137 + o1}`,
    `S1413.12,${BASE + 105 - o2} ${VW},${BASE + 105 + o3}`,
    `V${VH}`,
    `H0`,
    `V${BASE}`,
    `Z`,
  ].join(" ");
}

const IMAGES = [
  { id: 1, src: img1, label: "Our kitchen" },
  { id: 2, src: img2, label: "Happy customer" },
  { id: 3, src: img3, label: "Bistro vibes" },
];

const rotations = [-5, 1.5, -3];

const cardVariants = {
  hidden: (r) => ({ opacity: 0, y: 50, rotate: r, scale: 0.92 }),
  visible: (r) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: r,
    transition: { type: "spring", stiffness: 180, damping: 16 },
  }),
  hover: () => ({
    rotate: 0,
    scale: 1.05,
    y: -12,
    transition: { type: "spring", stiffness: 280, damping: 18 },
  }),
};

/* ─── Component ─────────────────────────────────────────────── */
export default function About() {
  const pathRef = useRef(null);
  const t = useRef(0);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  useEffect(() => {
    const check = () => setIsMobileOrTablet(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useAnimationFrame((_, delta) => {
    t.current += delta / 1000;
    const time = t.current;
    const d = buildBottomWave([
      Math.sin(time * 0.7) * 18,
      Math.sin(time * 0.5 + 1.2) * 22,
      Math.sin(time * 0.9 + 2.4) * 14,
      Math.sin(time * 0.6 + 0.8) * 20,
    ]);
    if (pathRef.current) pathRef.current.setAttribute("d", d);
  });

  const initialD = buildBottomWave([0, 0, 0, 0]);

  return (
    <div
      className="min-h-screen text-white w-full max-w-screen-xl mx-auto"
      style={{ background: DARK, fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        className="relative px-6 lg:px-12 pt-16 pb-0 overflow-hidden"
        style={{ background: OLIVE, minHeight: 680 }}
      >
        {/* Background texture */}
        <img
          src={HeroBg}
          alt=""
          className="absolute  inset-0 w-full h-full object-cover pointer-events-none"
          style={{ mixBlendMode: "multiply" }}
        />

        {/* Top row */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
          <div>
            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="text-xs tracking-[0.25em] font-semibold mb-4"
              style={{ color: OLIVE_DIM }}
            >
              WHO WE ARE
            </motion.p>

            {/* Giant headline */}
            <div className="overflow-hidden">
              <motion.h1
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="font-black leading-none tracking-tighter"
                style={{
                  fontSize: "clamp(72px, 14vw, 164px)",
                  color: "#fff",
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: 0.88,
                }}
              >
                ABOUT
                <br />
                <span style={{ color: OLIVE_DIM }}>US.</span>
              </motion.h1>
            </div>
          </div>

          {/* Aside copy */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-sm leading-relaxed font-mono max-w-sm lg:max-w-xs pb-2"
            style={{ color: OLIVE_LIGHT }}
          >
            We started Finest Diners with a single belief — that great food
            shouldn't be a compromise. No soggy containers. No mystery
            ingredients. Restaurant-quality meals, delivered with the same care
            they were cooked with.
          </motion.p>
        </div>

        {/* Polaroid photo row */}
        <div className="relative z-10 flex gap-6 justify-center pb-10">
          {IMAGES.map((item, i) => (
            <motion.div
              key={item.id}
              custom={rotations[i]}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              transition={{ delay: 0.2 + i * 0.12 }}
              className="relative cursor-pointer flex-shrink-0"
              style={{
                width: 260,
                background: "#fff",
                padding: "10px 10px 36px",
                boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
              }}
            >
              <img
                src={item.src}
                alt={item.label}
                style={{
                  width: "100%",
                  height: 320,
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <p
                className="text-center text-[10px] tracking-widest mt-3 font-semibold"
                style={{ color: "#555" }}
              >
                {item.label.toUpperCase()}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Jelly wave into dark */}
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 5 }}
        >
          <motion.path ref={pathRef} d={initialD} fill={DARK} />
        </svg>
      </section>

      {/* ── STORY ────────────────────────────────────────────── */}
      <section
        className="relative px-6 lg:px-16 py-24 border-b overflow-hidden"
        style={{ borderColor: BORDER, background: BG }}
      >
        {/* Faint background watermark */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{ opacity: 0.03, zIndex: 0 }}
        >
          <span
            style={{
              fontSize: "clamp(120px, 25vw, 400px)",
              fontWeight: 900,
              color: OLIVE,
              fontFamily: "Arial Black, sans-serif",
              letterSpacing: "-0.08em",
              whiteSpace: "nowrap",
            }}
          >
            Finest Diners
          </span>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* <StickerPeel
            imageSrc={logo}
            width={200}
            rotate={0}
            peelBackHoverPct={30}
            peelBackActivePct={40}
            shadowIntensity={0.5}
            lightingIntensity={0.1}
            initialPosition={{ x: -100, y: 100 }}
            peelDirection={0}
          /> */}
          <h1
            className="uppercase"
            style={{
              fontSize: "clamp(40px, 8vw, 120px)",
              fontWeight: 900,
              color: "#e7e3e3",
              letterSpacing: "-0.07em",
              whiteSpace: "nowrap",
              lineHeight: 1,
              pointerEvents: "none",
              userSelect: "none",
              fontFamily: "Arial Black, sans-serif",
              textAlign: "center",
              // pulls carousel up to overlap slightly if desired
              zIndex: 0,
            }}
          >
            our story
          </h1>
          <TimelineSlider />

          {/* Bottom rule + tagline */}
        </div>
      </section>
      {/* ── TEAM ─────────────────────────────────────────────── */}
      <section
        className="px-6 lg:px-12 py-16 border-b"
        style={{ borderColor: BORDER }}
      >
        <div className="flex justify-between items-baseline mb-12">
          <h2
            className="font-black text-xs tracking-[0.3em] uppercase"
            style={{ color: OLIVE_LIGHT }}
          >
            THE TEAM
          </h2>
          <span className="text-xs font-mono" style={{ color: "#3a4a3a" }}>
            PEOPLE BEHIND THE PRODUCT
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {TEAM.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="flex flex-col items-center gap-4 p-6 border text-center"
              style={{ background: SURFACE, borderColor: BORDER }}
            >
              {/* Initials avatar with olive ring */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-sm"
                style={{
                  background: OLIVE_DIM,
                  color: OLIVE_LIGHT,
                  border: `2px solid ${OLIVE}`,
                  letterSpacing: "0.05em",
                }}
              >
                {member.initials}
              </div>
              <div>
                <p className="font-bold text-white text-sm">{member.name}</p>
                <p
                  className="text-[10px] tracking-widest mt-1 uppercase font-mono"
                  style={{ color: "#5a6a5a" }}
                >
                  {member.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      {/* ── OUR PILLARS ──────────────────────────────────────── */}
      <section
        className="px-8 py-8 bg-white"
        style={{ borderColor: BORDER, backgroundImage: `url(${HeroBg})` }}
      >
        {/* Heading */}
        <div
          style={{
            fontSize: "clamp(28px, 6vw, 100px)",
            fontWeight: 900,
            color: "#414040",
            letterSpacing: "-0.05em",
            lineHeight: 1,
            pointerEvents: "none",
            userSelect: "none",
            fontFamily: "Arial Black, sans-serif",
            textAlign: "center",
            marginBottom: isMobileOrTablet
              ? "24px"
              : "clamp(-20px, -3vw, -40px)",
            zIndex: 0,
            padding: "0 clamp(12px, 4vw, 48px)",
            wordBreak: "break-word",
            overflowWrap: "break-word",
            whiteSpace: "normal",
          }}
        >
          OUR BRAND PILLARS
        </div>

        <div className="mt-10">
          {isMobileOrTablet ? <MobileCarousel /> : <DesktopCarousel />}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section
        className="relative px-6 lg:px-12 py-24 overflow-hidden"
        style={{ background: DARK, borderTop: `1px solid ${BORDER}` }}
      >
        {/* Olive glow blob */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: OLIVE,
            opacity: 0.07,
            filter: "blur(120px)",
            top: "50%",
            left: "50%",
            transform: "translate(-60%, -50%)",
            zIndex: 0,
          }}
        />

        {/* Background texture */}
        <img
          src={HeroBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ opacity: 0.04, zIndex: 0 }}
        />
        

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-end justify-between gap-12">
          {/* Left: text */}
          <div>
            <motion.p
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-[9px] tracking-[0.35em] font-semibold mb-4 uppercase"
              style={{ color: OLIVE }}
            >
              Ready to order?
            </motion.p>

            <div className="overflow-hidden">
              <motion.h2
                initial={{ y: "100%" }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                className="font-black leading-none tracking-tighter"
                style={{
                  fontSize: "clamp(52px, 9vw, 120px)",
                  color: "#fff",
                  fontFamily: "Arial Black, sans-serif",
                  lineHeight: 0.9,
                }}
              >
                EXPERIENCE
                <br />
                <span style={{ color: OLIVE }}>IT.</span>
              </motion.h2>
            </div>
          </div>

          {/* Right: stat strip + button */}
          <div className="flex flex-col items-start lg:items-end gap-8">
            {/* Mini stats */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex gap-8"
            >
              {[
                { value: "40k+", label: "Orders" },
                { value: "98%", label: "On-time" },
                { value: "120+", label: "Partners" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col">
                  <span
                    className="font-black leading-none"
                    style={{
                      fontSize: "clamp(22px, 3vw, 36px)",
                      color: "#fff",
                      fontFamily: "Arial Black, sans-serif",
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {s.value}
                  </span>
                  <span
                    className="text-[9px] tracking-[0.25em] uppercase font-semibold mt-1"
                    style={{ color: "#3a4a3a" }}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Divider */}
            <div
              style={{
                width: "100%",
                height: 1,
                background: BORDER,
              }}
            />

            {/* Button */}
            <motion.a
              href="/"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.4 }}
              whileHover={{ x: 6 }}
              whileTap={{ scale: 0.97 }}
              className="group flex items-center gap-4 font-black tracking-tighter"
              style={{
                fontFamily: "Arial Black, sans-serif",
                fontSize: "clamp(18px, 2.5vw, 28px)",
                color: "#fff",
                textDecoration: "none",
              }}
            >
              EXPLORE MENU
              <span
                className="flex items-center justify-center transition-colors"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  border: `1.5px solid ${OLIVE}`,
                  color: OLIVE,
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                →
              </span>
            </motion.a>
          </div>
        </div>
      
      </section>
      
    </div>
  );
}
