import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import img1 from "../assets/bugers.png";
import { MoveRight } from "lucide-react";
import img2 from "../assets/chicken_2_compressed.png";
import api from "../services/api";
import JellyWave from "./ui/jelly";
import MobileBurgerHero from "../components/MobileBurgerHero";

const STRIP_IMAGES = [img1, img2, img1, img1, img1, img1, img1, img1, img1];
const RESTAURANT_ID = import.meta.env.VITE_RESTAURANT_ID;

const DESKTOP_LINES = ["OUR FOOD"];

export default function BurgerFuelHero() {
  const [offset, setOffset] = useState(0);
  const [Trending, setTrending] = useState([]);
  const [Loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [dimensions, setDimensions] = useState({
    vw: 1300,
    vh: 350,
    tileW: 400,
  });
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const containerRef = useRef(null);
  const SPEED = 40;
  const BG = "#050A0A";

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const mobile = containerWidth < 640;
      setIsMobile(mobile);

      const tileWidth = Math.max(200, containerWidth * 0.3);
      const containerHeight = Math.max(300, containerWidth * 0.27);

      setDimensions({
        vw: containerWidth,
        vh: containerHeight,
        tileW: tileWidth,
      });
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    api
      .get(`/food/menu/${RESTAURANT_ID}`)
      .then(({ data }) => setTrending(data.menu.slice(7, 10)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isMobile) return; // no animation on mobile
    const STRIP_TOTAL_W = dimensions.tileW * STRIP_IMAGES.length;
    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = (ts - startRef.current) / 1000;
      setOffset((elapsed * SPEED) % STRIP_TOTAL_W);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [dimensions.tileW, isMobile]);

  const allImages = [...STRIP_IMAGES, ...STRIP_IMAGES];

  const FONT_SIZE = Math.max(120, dimensions.vw * 0.3);
  const LINE_HEIGHT = FONT_SIZE * 1.05;
  const UI_FONT = "'Bebas Neue', Impact, 'Arial Black', sans-serif";

  const getTextProps = (lineIndex) => ({
    x: dimensions.vw / 2,
    y: FONT_SIZE * 0.82 + lineIndex * LINE_HEIGHT,
    textAnchor: "middle",
    style: {
      fontFamily: UI_FONT,
      fontSize: FONT_SIZE,
      fontWeight: 900,
    },
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
      `}</style>

      <div className="bg-[#6B7C2F] font-sans overflow-x-hidden">
        <section
          className="relative flex flex-col justify-center overflow-hidden pt-[max(30px,4vh)] md:pt-[max(68px,8vh)]"
          style={{ minHeight: "100vh" }}
        >
          {/* ── MOBILE: delegated to MobileBurgerHero ── */}
          {isMobile && <MobileBurgerHero containerRef={containerRef} />}

          {/* ── DESKTOP: animated scrolling strip ── */}
          {!isMobile && (
            <div
              ref={containerRef}
              className="relative w-full px-3 sm:px-4 md:px-6"
            >
              <svg
                viewBox={`0 0 ${dimensions.vw} ${dimensions.vh}`}
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                className="w-full block"
                style={{
                  maxHeight: "clamp(200px, 60vh, 500px)",
                  aspectRatio: `${dimensions.vw} / ${dimensions.vh}`,
                }}
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <clipPath id="letterClip">
                    {DESKTOP_LINES.map((line, i) => (
                      <text key={i} {...getTextProps(i)}>
                        {line}
                      </text>
                    ))}
                  </clipPath>
                </defs>

                <rect
                  width={dimensions.vw}
                  height={dimensions.vh}
                  fill="#6B7C2F"
                />

                {DESKTOP_LINES.map((line, i) => (
                  <text key={i} {...getTextProps(i)} fill="#111">
                    {line}
                  </text>
                ))}

                <g clipPath="url(#letterClip)">
                  <g transform={`translate(${-offset}, 0)`}>
                    {allImages.map((src, i) => (
                      <image
                        key={`${src}-${i}`}
                        href={src}
                        x={i * dimensions.tileW}
                        y={0}
                        width={dimensions.tileW}
                        height={dimensions.vh}
                        preserveAspectRatio="xMidYMid slice"
                      />
                    ))}
                  </g>
                </g>
              </svg>
            </div>
          )}

          {/* ── Hidden ref div for mobile dimension tracking ── */}
          {isMobile && (
            <div
              ref={containerRef}
              style={{
                position: "absolute",
                width: "100%",
                pointerEvents: "none",
                opacity: 0,
              }}
            />
          )}

          {/* Bottom row */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between px-4 sm:px-6 md:px-10 py-4 sm:py-6 gap-6 sm:gap-8">
            <div className="flex flex-col shrink-0">
              <h1
                className="text-[#111] leading-none text-4xl  md:text-[clamp(20px,5vw,56px)]"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  lineHeight: "1",
                }}
              >
                Burgers Packed{" "}
                <em
                  style={{
                    fontFamily: "Inter,sans-serif",
                    fontStyle: "italic",
                    fontWeight: 900,
                    fontSize: "0.58em",
                  }}
                >
                  &
                </em>
                <br />
                Stacked With Flavour
              </h1>
              <p
                style={{
                  fontSize: 15,
                  color: BG,
                  opacity: 0.68,
                  lineHeight: 1.75,
                }}
                className="max-w-xl md:max-w-lg"
              >
                No shortcuts. No reheated nonsense. Every item on the menu gets
                the same obsessive treatment whether it costs $10 or $25, it
                ships out like it matters.
              </p>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  marginTop: "clamp(18px, 3.5vw, 30px)",
                  width: "280px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "clamp(8px, 1.5vw, 14px)",
                  background: "#fff",
                  color: "#000",
                  border: "2px solid #4e6020",
                  borderRadius: 999,
                  padding: "10px 14px 10px clamp(16px, 2.5vw, 22px)",
                  fontSize: "clamp(0.82rem, 1.8vw, 1.15rem)",
                  fontFamily: UI_FONT,
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: "0 6px 28px rgba(107,124,47,0.28)",
                }}
              >
                <span className="hidden sm:inline">
                  Learn more about our food
                </span>
                <span className="sm:hidden">Learn more </span>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#000",
                    borderRadius: "50%",
                    width: "clamp(28px, 4vw, 36px)",
                    height: "clamp(28px, 4vw, 36px)",
                    flexShrink: 0,
                  }}
                >
                  <MoveRight size={15} color="#fff" strokeWidth={2.2} />
                </span>
              </motion.button>
            </div>

            {/* Trending cards */}
            {!Loading && Trending.length > 0 && (
              <div className="flex gap-3 sm:gap-4 overflow-x-auto min-w-0 pb-2 overflow-auto no-scrollbar">
                {Trending.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col items-start gap-2 rounded-lg sm:rounded-2xl p-2 sm:p-3 shrink-0 bg-black bg-opacity-20"
                    style={{ width: "clamp(140px, 35vw, 230px)" }}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full object-cover rounded"
                      style={{ height: "clamp(90px, 20vw, 150px)" }}
                    />
                    <h3
                      className="text-white leading-tight line-clamp-2"
                      style={{
                        fontFamily: "Mouse Memoirs, serif",
                        fontSize: "clamp(1rem, 3vw, 1.3rem)",
                      }}
                    >
                      {item.name}
                    </h3>
                    <button
                      className="text-xs sm:text-sm text-lime-300 hover:text-white transition-colors"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      View in menu →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
