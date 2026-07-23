import { motion } from "framer-motion";

/**
 * Layered, animated scalloped-wave divider.
 * Stacks 3 copies of the same wave SVG, each looping its backgroundPositionX
 * at a different speed/opacity/direction for a parallax "waves" effect.
 *
 * loopDistance is height * 10 because the wave SVG's viewBox is 1000x100 —
 * with backgroundSize "auto 100%", the rendered tile width always equals
 * height * 10px, so shifting by exactly that distance loops seamlessly
 * no matter what height you pass in.
 */
export default function AnimatedWaveDivider({
  waveSvg,
  height = 100,
  className = "",
  layers = [
    { direction: 1, duration: 16, opacity: 0.28 }, // back, slow, right
    { direction: -1, duration: 11, opacity: 0.55 }, // mid, medium, left
    { direction: 1, duration: 8, opacity: 1 }, // front, fast, right
  ],
}) {
  const loopDistance = height * 10;

  return (
    <div
      className={`absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none ${className}`}
      style={{ height }}
    >
      {layers.map((layer, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          style={{
            backgroundImage: waveSvg,
            backgroundRepeat: "repeat-x",
            backgroundSize: "auto 100%",
            opacity: layer.opacity,
          }}
          animate={{
            backgroundPositionX: [0, layer.direction * loopDistance],
          }}
          transition={{
            duration: layer.duration,
            ease: "linear",
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
}