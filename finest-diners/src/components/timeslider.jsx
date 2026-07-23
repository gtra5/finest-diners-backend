import { useRef, useState, useCallback, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import img4 from "../assets/X818K.jpg";
import img5 from "../assets/49eQ3.jpg";
import img6 from "../assets/2Nb8G.jpg";
import img8 from "../assets/qO021.jpg";
import img9 from "../assets/lj8bt.jpg";

const TIMELINE = [
  {
    year: "2021",
    title: "Finest Diners is Founded",
    description: "Born out of frustration with cold, late deliveries — we set out to do it differently.",
    image: img4,
  },
  {
    year: "2022",
    title: "First 10,000 Orders",
    description: "Within our first year, we crossed 10,000 deliveries with a 97% satisfaction rate.",
    image: img5,
  },
  {
    year: "2023",
    title: "120+ Restaurant Partners",
    description: "Expanded our network to over 120 curated restaurant partners across the city.",
    image: img6,
  },
  {
    year: "2024",
    title: "Zero-Waste Packaging Launch",
    description: "Rolled out fully compostable packaging across all delivery orders.",
    image: img8,
  },
  {
    year: "2025",
    title: "40,000+ Customers Served",
    description: "Still obsessing over every detail — now serving tens of thousands every month.",
    image: img9,
  },
];

const N = TIMELINE.length;

const NAV_STYLE = {
  fontSize: "1.2rem",
  letterSpacing: "0.08em",
  background: "#6B7C2F",
  color: "#fff",
  border: "2px solid #fff",
  borderRadius: "999px",
  padding: "6px 32px",
  cursor: "pointer",
  boxShadow: "0 8px 32px rgba(107,124,47,0.35)",
  whiteSpace: "nowrap",
};

const baseButton = {
  position: "absolute",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  whiteSpace: "nowrap",
  borderRadius: "999px",
  zIndex: 9,
};

const readButtonStyle = {
  ...baseButton,
  bottom: "clamp(10px, 2.5vh, 20px)",
  left: "35%",
  transform: "translateX(-50%)",
  width: "max-content",
  maxWidth: "85%",
  fontSize: "clamp(0.75rem, 1.8vw, 1rem)",
  padding: "clamp(6px, 1.2vh, 12px) clamp(18px, 5vw, 36px)",
  letterSpacing: "0.06em",
};

const closeButtonStyle = {
  ...baseButton,
  top: "clamp(8px, 2vh, 12px)",
  right: "clamp(8px, 4vw, 12px)",
  minWidth: "44px",
  minHeight: "44px",
  padding: "8px",
  borderRadius: "12px",
};

// ─── Custom hook ──────────────────────────────────────────────────────────────
function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);

  return isMobile;
}

export default function TimelineSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [openOverlay, setOpenOverlay] = useState(false);
  const swiperRef = useRef(null);
  const isMobile = useIsMobile();

  const handleSlideChange = useCallback((swiper) => {
    setActiveIndex(swiper.realIndex);
    setOpenOverlay(false);
  }, []);

  const handlePrev = useCallback(() => swiperRef.current?.slidePrev(), []);
  const handleNext = useCallback(() => swiperRef.current?.slideNext(), []);

  return (
    <section className="w-full overflow-hidden">
      {/* Timeline scrubber */}
      <div className="relative flex items-center justify-center px-6 sm:px-14 py-4">
        <div className="flex items-center justify-between w-full relative z-10">
          {TIMELINE.map((t, i) => (
            <button
              key={t.year}
              onClick={() => {
                swiperRef.current?.slideTo(i);
                setOpenOverlay(false);
              }}
              className="flex flex-col items-center gap-1"
            >
              <div
                style={{
                  width: 1,
                  height: i === activeIndex ? 18 : 10,
                  background: i === activeIndex ? "#fff" : "#444",
                  transition: "all .3s",
                }}
              />
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: i === activeIndex ? 13 : 11,
                  fontWeight: i === activeIndex ? 700 : 400,
                  color: i === activeIndex ? "#fff" : "#444",
                  transition: "all .3s",
                }}
              >
                {t.year}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Swiper */}
      <Swiper
        modules={[Navigation]}
        onBeforeInit={(swiper) => { swiperRef.current = swiper; }}
        onSlideChange={handleSlideChange}
        slidesPerView={1}
        loop={true}
        className="w-full"
      >
        {TIMELINE.map((item, i) => {
          const prev = TIMELINE[(i - 1 + N) % N];
          const next = TIMELINE[(i + 1) % N];
          const isActive = i === activeIndex;

          return (
            <SwiperSlide key={item.year}>
              <div className="flex flex-col items-center py-6 sm:py-8 px-0">

                {/* Title — desktop only (mobile title lives in card) */}
                {!isMobile && (
                  <h3
                    className="text-white font-black uppercase text-center mb-5 px-4"
                    style={{
                      fontSize: "clamp(14px, 3vw, 28px)",
                      fontFamily: "Arial Black, sans-serif",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {item.title}
                  </h3>
                )}

                {/* Image row */}
                <div className="relative w-full flex items-center justify-center">

                  {/* Left peek */}
                  <div
                    className="absolute left-0 top-0 bottom-0 overflow-hidden pointer-events-none"
                    style={{ width: "clamp(60px, 12vw, 160px)", opacity: 0.5 }}
                  >
                    <img src={prev.image} alt="" className="w-full h-full object-cover" />
                  </div>

                  {/* ── MOBILE / TABLET: Card layout ───────────────────────── */}
                  {isMobile ? (
                    <Motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        width: "min(480px, 76vw)",
                        borderRadius: "16px",
                        overflow: "hidden",
                        boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
                        zIndex: 10,
                        position: "relative",
                      }}
                    >
                      {/* Card image — top half */}
                      <div style={{ aspectRatio: "16/9", width: "100%" }}>
                        <img
                          src={item.image}
                          alt={item.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      </div>

                      {/* Card text — bottom half */}
                      <div
                        style={{
                          background: "#6B7C2F",
                          padding: "clamp(14px, 5vw, 24px)",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#9b6edb",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            marginBottom: 6,
                            fontFamily: "monospace",
                          }}
                        >
                          {item.year}
                        </p>
                        <p
                          style={{
                            fontSize: "clamp(14px, 4vw, 18px)",
                            fontWeight: 900,
                            color: "#fff",
                            fontFamily: "Arial Black, sans-serif",
                            marginBottom: 10,
                            lineHeight: 1.2,
                          }}
                        >
                          {item.title}
                        </p>
                        <p
                          style={{
                            fontSize: "clamp(12px, 3.2vw, 14px)",
                            color: "#d4e8a0",
                            fontFamily: "monospace",
                            lineHeight: 1.7,
                            margin: 0,
                          }}
                        >
                          {item.description}
                        </p>
                      </div>
                    </Motion.div>
                  ) : (
                    /* ── DESKTOP: Original overlay layout ───────────────────── */
                    <div
                      style={{
                        position: "relative",
                        width: "min(580px, 76vw)",
                        aspectRatio: "16/9",
                        overflow: "hidden",
                        borderRadius: "2px",
                        zIndex: 10,
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover block"
                      />

                      {/* Read More / Close buttons */}
                      <AnimatePresence mode="wait" initial={false}>
                        {isActive && !openOverlay && (
                          <Motion.button
                            key="read"
                            onClick={() => setOpenOverlay(true)}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.25 }}
                            style={{
                              ...readButtonStyle,
                              ...NAV_STYLE,
                              padding: "clamp(6px, 1.2vh, 12px) clamp(18px, 5vw, 36px)",
                              fontSize: "clamp(0.75rem, 1.8vw, 1rem)",
                            }}
                            aria-label="Read more"
                          >
                            Read More
                          </Motion.button>
                        )}

                        {isActive && openOverlay && (
                          <Motion.button
                            key="close"
                            onClick={() => setOpenOverlay(false)}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.25 }}
                            style={{
                              ...closeButtonStyle,
                              ...NAV_STYLE,
                              background: "#FFFFFF",
                              border: "2px solid #6B7C2F",
                              backdropFilter: "blur(8px)",
                            }}
                            aria-label="Close overlay"
                          >
                            <X size={16} color="#000" />
                          </Motion.button>
                        )}
                      </AnimatePresence>

                      {/* Description overlay */}
                      <Motion.div
                        className="absolute inset-0 flex flex-col justify-end rounded-sm"
                        animate={{ opacity: openOverlay && isActive ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          background: "#6B7C2F",
                          pointerEvents: openOverlay && isActive ? "auto" : "none",
                          zIndex: 6,
                          padding: "clamp(12px, 4%, 20px)",
                        }}
                      >
                        <p style={{ fontSize: "clamp(9px, 1.5vw, 11px)", fontWeight: 700, color: "#9b6edb", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 5 }}>
                          {item.year}
                        </p>
                        <p style={{ fontSize: "clamp(12px, 2vw, 15px)", fontWeight: 900, color: "#fff", fontFamily: "Arial Black, sans-serif", marginBottom: 10, lineHeight: 1.2 }}>
                          {item.title}
                        </p>
                        <p style={{ fontSize: "clamp(10px, 1.5vw, 12px)", color: "#b0a0cc", fontFamily: "monospace", lineHeight: 1.6, margin: 0 }}>
                          {item.description}
                        </p>
                      </Motion.div>
                    </div>
                  )}

                  {/* Right peek */}
                  <div
                    className="absolute right-0 top-0 bottom-0 overflow-hidden pointer-events-none"
                    style={{
                      width: "clamp(60px, 12vw, 160px)",
                      opacity: 0.5,
                      maskImage: "linear-gradient(to left, rgba(0,0,0,0.7), transparent)",
                      WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,0.7), transparent)",
                    }}
                  >
                    <img src={next.image} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}

        {/* Nav buttons */}
        <div className="flex items-end justify-center gap-4 mt-6">
          <Motion.button
            onClick={handlePrev}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ ...NAV_STYLE, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(8px, 1%, 12px)", minWidth: "44px", minHeight: "44px" }}
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </Motion.button>

          <Motion.button
            onClick={handleNext}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ ...NAV_STYLE, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(8px, 1%, 12px)", minWidth: "44px", minHeight: "44px" }}
            aria-label="Next slide"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </Motion.button>
        </div>
      </Swiper>
    </section>
  );
}