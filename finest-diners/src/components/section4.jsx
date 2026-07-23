import { motion } from "framer-motion";
import img1 from "../assets/advertisment.jpg";
import img2 from "../assets/front-view-smiley-man-holding-pizza.jpg";
import img3 from "../assets/medium-shot-smiley-man-eating-bistro.jpg";

// Decorative floating food elements
import burgerImg from "../assets/bugers.png";
import saladImg from "../assets/salad (3).png";
import pepperImg from "../assets/pepper.png";
import pizzaSliceImg from "../assets/pizza (2).png";
import tomatoSlicesImg from "../assets/tomatotes.png";
import cabbageImg from "../assets/cabbage.png";

const OLIVE = "#6B7C2F";
const OLIVE_DIM = "#3a4419";
const OLIVE_LIGHT = "#D4E2B9";
const BG = "#050A0A";

const Advertisment = [
  { id: 1, image: img1, label: "ADVERTISMENT 1" },
  { id: 2, image: img2, label: "ADVERTISMENT 2" },
  { id: 3, image: img3, label: "ADVERTISMENT 3" },
];

// Scattered decorative food images. `blur` controls depth-of-field feel,
// `opacity` + `blur` together push some pieces into the background and
// keep others crisp and eye-catching in the foreground.
const FLOATERS = [
  {
    image: burgerImg,
    top: "6%",
    left: "4%",
    size: "clamp(120px, 15vw, 260px)",
    rotate: -18,
    blur: 0,
    opacity: 0.95,
    zIndex: 2,
  },
  {
    image: tomatoSlicesImg,
    top: "10%",
    right: "6%",
    size: "clamp(110px, 14vw, 230px)",
    rotate: 12,
    blur: 6,
    opacity: 0.45,
    zIndex: 0,
  },
  {
    image: pepperImg,
    top: "38%",
    left: "1%",
    size: "clamp(90px, 11vw, 180px)",
    rotate: 25,
    blur: 4,
    opacity: 0.5,
    zIndex: 0,
  },
  {
    image: saladImg,
    top: "34%",
    right: "2%",
    size: "clamp(140px, 17vw, 300px)",
    rotate: -10,
    blur: 0,
    opacity: 1,
    zIndex: 2,
  },
  {
    image: pizzaSliceImg,
    bottom: "8%",
    left: "5%",
    size: "clamp(115px, 14vw, 240px)",
    rotate: 15,
    blur: 0,
    opacity: 0.95,
    zIndex: 2,
  },
  {
    image: cabbageImg,
    bottom: "4%",
    right: "4%",
    size: "clamp(95px, 12vw, 200px)",
    rotate: -8,
    blur: 5,
    opacity: 0.4,
    zIndex: 0,
  },
];

const cardVariants = {
  hidden: (rotate) => ({ opacity: 0, y: 40, scale: 0.9, rotate }),
  visible: (rotate) => ({
    opacity: 1, y: 0, scale: 1, rotate,
    transition: { type: "spring", stiffness: 200, damping: 18 },
  }),
  hover: (rotate) => ({
    rotate: rotate * 0.3, scale: 1.06, y: -10,
    transition: { type: "spring", stiffness: 300, damping: 20 },
  }),
};

const rotations = [-6, 2.5, -3];

const STATS = [
  { value: "400+", label: "Reviews this month" },
  { value: "#1", label: "Rated on delivery" },
  { value: "Daily", label: "Fresh sourcing" },
];

function Section4() {
  return (
    <section
      style={{
        background: "white",
        paddingTop: "clamp(48px, 8vw, 100px)",
        paddingBottom: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      

      {/* Floating decorative food images */}
      {FLOATERS.map((f, i) => (
        <motion.img
          key={i}
          aria-hidden
          src={f.image}
          initial={{ opacity: 0, scale: 0.8, rotate: f.rotate }}
          whileInView={{ opacity: f.opacity, scale: 1, rotate: f.rotate }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute",
            top: f.top,
            bottom: f.bottom,
            left: f.left,
            right: f.right,
            width: f.size,
            height: "auto",
            filter: `blur(${f.blur}px)`,
            pointerEvents: "none",
            zIndex: f.zIndex,
            userSelect: "none",
          }}
        />
      ))}

      {/* Copy + stats */}
      <div
        style={{
          padding: "0 clamp(24px, 6vw, 96px)",
          position: "relative",
          zIndex: 1,
          marginBottom: "clamp(40px, 6vw, 80px)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "clamp(32px, 5vw, 64px)",
            alignItems: "center",
          }}
        >
          {/* Left: copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 9,
                letterSpacing: "0.35em",
                fontWeight: 600,
                textTransform: "uppercase",
                color: OLIVE,
                marginBottom: 16,
              }}
            >
              Why Finest Diners
            </p>
            <h2
              style={{
                fontFamily: "Arial Black, sans-serif",
                fontWeight: 900,
                fontSize: "clamp(36px, 5vw, 70px)",
                color: BG,
                lineHeight: 0.92,
                letterSpacing: "-0.04em",
                marginBottom: 24,
              }}
            >
              CRAFTED FOR
              <br />
              <span style={{ color: OLIVE_DIM }}>THE STREETS.</span>
            </h2>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "clamp(13px, 1.5vw, 16px)",
                lineHeight: 1.8,
                color: "#3a3a3a",
                maxWidth: 400,
                marginBottom: 36,
              }}
            >
              Every dish is a study in contrast. Premium ingredients,
              stripped-down execution. No tablecloths. No pretension.
              Just food that earns its price tag on every single bite.
            </p>

              <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-12 py-2 sm:py-3 md:py-4"
          style={{
            fontFamily: "Mouse Memoirs, serif",
            fontSize: "clamp(0.875rem, 2vw, 1.3rem)",
            letterSpacing: "0.08em",
            background: "#6B7C2F",
            color: "#fff",
            border: "2px solid #fff",
            borderRadius: "999px",
            cursor: "pointer",
            boxShadow: "0 8px 32px rgba(107,124,47,0.35)",
          }}
        >
          Order Now
        </motion.button>
          </motion.div>

          {/* Right: stats */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "clamp(16px, 3vw, 24px)",
            }}
          >
            {STATS.map(({ value, label }) => (
              <div
                key={label}
                style={{ borderTop: `2px solid ${OLIVE}`, paddingTop: 16 }}
              >
                <div
                  style={{
                    fontFamily: "Arial Black, sans-serif",
                    fontWeight: 900,
                    fontSize: "clamp(20px, 3vw, 36px)",
                    color: BG,
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                    marginBottom: 8,
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 10,
                    color: "#888",
                    lineHeight: 1.45,
                    letterSpacing: "0.05em",
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Polaroid photos */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "clamp(12px, 2vw, 20px)",
          justifyContent: "center",
          padding: "0 clamp(16px, 4vw, 48px)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {Advertisment.map((item, i) => (
          <motion.div
            key={item.id}
            custom={rotations[i]}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            whileHover="hover"
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
            style={{
              cursor: "pointer",
              boxShadow: "4px 6px 28px rgba(0,0,0,0.15)",
              background: "#fff",
              padding: "8px 8px 32px",
              width: "clamp(150px, 26vw, 280px)",
              flexShrink: 0,
            }}
          >
            <img
              src={item.image}
              alt={item.label}
              style={{
                width: "100%",
                height: "clamp(150px, 20vw, 340px)",
                objectFit: "cover",
                display: "block",
              }}
            />
            <p
              style={{
                textAlign: "center",
                fontSize: 9,
                letterSpacing: "0.25em",
                marginTop: 10,
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
                color: "#888",
                textTransform: "uppercase",
              }}
            >
              {item.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Wave → olive */}
      <div style={{ lineHeight: 1, marginTop: "clamp(32px, 5vw, 60px)" }}>
        <svg
          viewBox="0 0 1440 110"
          preserveAspectRatio="none"
          style={{
            width: "100%",
            height: "clamp(55px, 8vw, 110px)",
            display: "block",
          }}
          fill={OLIVE}
        >
          <path d="M0,58 C280,118 540,2 840,78 C1080,138 1280,18 1440,58 L1440,110 L0,110 Z" />
        </svg>
      </div>
    </section>
  );
}

export default Section4;