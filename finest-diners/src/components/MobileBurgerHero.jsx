import { useEffect, useState } from "react";
import img1 from "../assets/image.png";

const UI_FONT = "'Bebas Neue', Impact, 'Arial Black', sans-serif";

export default function MobileBurgerHero({ containerRef }) {
  const [dimensions, setDimensions] = useState({ vw: 390, vh: 250 });

  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef?.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = Math.max(300, containerWidth * 0.27);

      setDimensions({
        vw: containerWidth,
        vh: containerHeight,
      });
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef?.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [containerRef]);

 const FONT_SIZE = Math.max(180, dimensions.vw * 0.3);
  const LINE_HEIGHT = FONT_SIZE * 1.0;

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
    <div className="relative w-full">
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 0.55",
          overflow: "hidden",
        }}
      >
        <svg
          viewBox={`0 0 ${dimensions.vw} ${dimensions.vh}`}
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <clipPath id="letterClipMobile">
              <text {...getTextProps(0)}>OUR  FOOD</text>
            </clipPath>
          </defs>

          {/* Background */}
          <rect width={dimensions.vw} height={dimensions.vh} fill="#6B7C2F" />

          {/* Dark shadow text rendered behind the image clip */}
          <text {...getTextProps(0)} fill="#111">OUR FOOD</text>

          {/* Image clipped to letter shapes, sits on top of shadow text */}
          <g clipPath="url(#letterClipMobile)">
            <image
              href={img1}
              x={0}
              y={0}
              width={dimensions.vw}
              height={dimensions.vh}
              preserveAspectRatio="xMidYMid slice"
            />
          </g>
        </svg>
      </div>
    </div>
  );
}