import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useMotionValueEvent,
  useMotionValue,
  useSpring,
} from "framer-motion";
import HeroVideo from "../../public/Food_boxes_animate_and_close_202607111921.mp4";

// How much extra scroll distance (in viewport heights) the hero "eats up"
// while it stays pinned and the video scrubs. Bigger = slower/longer scrub.
const SCROLL_LENGTH_VH = 250;

// Staggered fade-up used for the hero copy on mount.
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

// A button that eases toward the cursor while it's nearby, then springs
// back to rest — a light-touch "magnetic" hover, not a gimmick.
function MagneticButton({
  children,
  className,
  strength = 0.3,
  style,
  ...props
}) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 12, mass: 0.15 });
  const springY = useSpring(y, { stiffness: 150, damping: 12, mass: 0.15 });

  const handleMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY, ...style }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export default function CravHero() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [duration, setDuration] = useState(0);

  // scrollYProgress goes 0 -> 1 as the window scrolls the section's top
  // from the top of the viewport to the section's bottom hitting the
  // bottom of the viewport — i.e. exactly the span it stays pinned for.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Grab the real duration once the video's metadata has loaded, and make
  // sure it isn't trying to play on its own — scroll is driving it now.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.pause();

    const handleLoadedMetadata = () => setDuration(video.duration || 0);
    if (video.readyState >= 1) {
      handleLoadedMetadata();
    }
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () =>
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
  }, []);

  // Track the latest desired progress cheaply (no seeking here) — this
  // can fire many times per scroll frame and just updates a ref.
  const targetProgress = useRef(0);
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    targetProgress.current = latest;
  });

  // Actually drive the video in its own rAF loop, decoupled from scroll
  // event frequency. Crucially: only issue a new seek once the previous
  // one has finished (video.seeking === false). Without this guard, fast
  // scrolling fires seeks faster than the decoder can keep up, they queue
  // up, and playback visibly lags behind the scroll position.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !duration) return;

    let rafId;

    const tick = () => {
      if (!video.seeking) {
        const targetTime = targetProgress.current * duration;
        if (Math.abs(video.currentTime - targetTime) > 0.02) {
          video.currentTime = targetTime;
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [duration]);

  const scallopedWaveBottom =
    "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 1000 100\"><g transform=\"matrix(1 0 0 -1 0 100)\"><path d=\"M0 0v60c9 0 18-3 25-10 13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s37 13 50 0c14-14 37-14 50 0 7 7 16 10 25 10V0H0Z\" fill=\"%23050A0A\"></path></g></svg>')";

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,500;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap');`}</style>

      {/* Tall wrapper: gives the scroll-scrub effect room to play out */}
      <section
        ref={sectionRef}
        className="relative w-full bg-[#6B7C2F]"
        style={{ height: `${SCROLL_LENGTH_VH}vh` }}
      >
        {/* Pinned viewport-height stage — this is what stays on screen
            while the user scrolls through the section above */}
        <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
          >
            <source src={HeroVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Soft scrim so the finer serif type stays legible over the video */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/25 z-[5] pointer-events-none" />

          <motion.div
            className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
            }}
          >
            <motion.span
              variants={fadeUp}
              className="uppercase tracking-[0.35em] text-white/70 text-xs sm:text-sm mb-5 font-medium"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Curated Menus · Delivered With Care
            </motion.span>

            <motion.h1
              variants={fadeUp}
              className="text-white text-6xl sm:text-8xl leading-[1.05] tracking-tight font-normal"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Exceptional Flavor,
              <br />
              <span className="italic font-light">Delivered.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-7 max-w-md text-white/80 text-base sm:text-lg font-light leading-relaxed"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Chef-crafted dishes made from the finest seasonal ingredients —
              brought to your door, always at its best.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-col sm:flex-row gap-4 items-center"
            >
              <MagneticButton
                className="bg-[#F5F0E6] text-[#1a1f14] font-medium px-10 py-3.5 rounded-full tracking-wide text-sm"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Order Now
              </MagneticButton>
              <MagneticButton
                className="border border-white/50 text-white font-medium px-10 py-3.5 rounded-full tracking-wide text-sm backdrop-blur-sm hover:border-white transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                View the Menu
              </MagneticButton>
            </motion.div>
          </motion.div>

          <div
            className="absolute bottom-0 left-0 w-full pointer-events-none"
            style={{
              backgroundImage: scallopedWaveBottom,
              backgroundRepeat: "repeat-x",
              backgroundSize: "auto 100%",
              backgroundPosition: "0 0",
              height: "100px",
            }}
          />
        </div>
      </section>
    </>
  );
}