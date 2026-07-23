import { useRef,  useState } from 'react';
import { motion, useMotionValue, useSpring, } from 'framer-motion';

const StickerPeel = ({
  imageSrc,
  rotate = 30,
  peelBackHoverPct = 30,
  peelBackActivePct = 40,
  width = 200,
  shadowIntensity = 0.6,
  lightingIntensity = 0.1,
  initialPosition = 'center',
  peelDirection = 0,
  className = ''
}) => {
  const defaultPadding = 10;
  const containerRef = useRef(null);
  const pointLightRef = useRef(null);
  const pointLightFlippedRef = useRef(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // Drag position
  const startX = typeof initialPosition === 'object' ? initialPosition.x ?? 0 : 0;
  const startY = typeof initialPosition === 'object' ? initialPosition.y ?? 0 : 0;

  const x = useMotionValue(startX);
  const y = useMotionValue(startY);

  // Drag rotation spring
  const dragRotation = useSpring(0, { stiffness: 200, damping: 20 });

  const handleDrag = (_, info) => {
    const rot = Math.max(-24, Math.min(24, info.delta.x * 0.4));
    dragRotation.set(rot);
  };

  const handleDragEnd = () => {
    dragRotation.set(0);
  };

  // Mouse light tracking
  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const lx = e.clientX - rect.left;
    const ly = e.clientY - rect.top;
    if (pointLightRef.current) {
      pointLightRef.current.setAttribute('x', lx);
      pointLightRef.current.setAttribute('y', ly);
    }
    const normalizedAngle = Math.abs(peelDirection % 360);
    if (pointLightFlippedRef.current) {
      if (normalizedAngle !== 180) {
        pointLightFlippedRef.current.setAttribute('x', lx);
        pointLightFlippedRef.current.setAttribute('y', rect.height - ly);
      } else {
        pointLightFlippedRef.current.setAttribute('x', -1000);
        pointLightFlippedRef.current.setAttribute('y', -1000);
      }
    }
  };

  // Clip path values
  const p = defaultPadding;
  const start = -p;
  const end = width + p;

  const peelHoverY = (peelBackHoverPct / 100) * (width + p * 2) - p;
  const peelActiveY = (peelBackActivePct / 100) * (width + p * 2) - p;

  const currentPeel = isActive ? peelActiveY : isHovered ? peelHoverY : start;

  const mainClip = `polygon(${start}px ${currentPeel}px, ${end}px ${currentPeel}px, ${end}px ${end}px, ${start}px ${end}px)`;
  const flapClip = isActive || isHovered
    ? `polygon(${start}px ${start}px, ${end}px ${start}px, ${end}px ${currentPeel}px, ${start}px ${currentPeel}px)`
    : `polygon(${start}px ${start}px, ${end}px ${start}px, ${end}px ${start}px, ${start}px ${start}px)`;

  const flapTop = isActive || isHovered
    ? `calc(-100% + ${2 * currentPeel}px - 1px)`
    : `calc(-100% - ${p * 2}px)`;

  const imageStyle = {
    transform: `rotate(${rotate - peelDirection}deg)`,
    width: `${width}px`,
    display: 'block',
  };

  const shadowImageStyle = {
    ...imageStyle,
    filter: 'url(#expandAndFill)',
  };

  const transition = { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] };

  return (
    <motion.div
      className={`absolute cursor-grab active:cursor-grabbing ${className}`}
      drag
      dragMomentum={true}
      dragElastic={0.08}
      style={{ x, y, touchAction: 'none' }}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
    >
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="pointLight">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feSpecularLighting
              result="spec"
              in="blur"
              specularExponent="100"
              specularConstant={lightingIntensity}
              lightingColor="white"
            >
              <fePointLight ref={pointLightRef} x="100" y="100" z="300" />
            </feSpecularLighting>
            <feComposite in="spec" in2="SourceGraphic" result="lit" />
            <feComposite in="lit" in2="SourceAlpha" operator="in" />
          </filter>

          <filter id="pointLightFlipped">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feSpecularLighting
              result="spec"
              in="blur"
              specularExponent="100"
              specularConstant={lightingIntensity * 7}
              lightingColor="white"
            >
              <fePointLight ref={pointLightFlippedRef} x="100" y="100" z="300" />
            </feSpecularLighting>
            <feComposite in="spec" in2="SourceGraphic" result="lit" />
            <feComposite in="lit" in2="SourceAlpha" operator="in" />
          </filter>

          <filter id="dropShadow">
            <feDropShadow
              dx="2"
              dy="4"
              stdDeviation={3 * shadowIntensity}
              floodColor="black"
              floodOpacity={shadowIntensity}
            />
          </filter>

          <filter id="expandAndFill">
            <feOffset dx="0" dy="0" in="SourceAlpha" result="shape" />
            <feFlood floodColor="rgb(179,179,179)" result="flood" />
            <feComposite operator="in" in="flood" in2="shape" />
          </filter>
        </defs>
      </svg>

      <motion.div
        ref={containerRef}
        className="relative select-none touch-none"
        style={{
          rotate: peelDirection,
          transformOrigin: 'center',
          WebkitUserSelect: 'none',
          userSelect: 'none',
          WebkitTouchCallout: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
        onMouseMove={handleMouseMove}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => { setIsHovered(false); setIsActive(false); }}
        onTapStart={() => setIsActive(true)}
        onTap={() => setIsActive(false)}
        onTapCancel={() => setIsActive(false)}
      >
        {/* Main sticker body */}
        <motion.div
          style={{
            clipPath: mainClip,
            filter: 'url(#dropShadow)',
            willChange: 'clip-path',
          }}
          animate={{ clipPath: mainClip }}
          transition={transition}
        >
          <div style={{ filter: 'url(#pointLight)' }}>
            <img
              src={imageSrc}
              alt=""
              style={imageStyle}
              draggable="false"
              onContextMenu={e => e.preventDefault()}
            />
          </div>
        </motion.div>

        {/* Flap shadow */}
        <div
          className="absolute top-4 left-2 w-full h-full opacity-40"
          style={{ filter: 'brightness(0) blur(8px)' }}
        >
          <motion.div
            style={{
              position: 'absolute',
              top: flapTop,
              transform: 'scaleY(-1)',
              willChange: 'clip-path, top',
            }}
            animate={{ clipPath: flapClip, top: flapTop }}
            transition={transition}
          >
            <img
              src={imageSrc}
              alt=""
              style={shadowImageStyle}
              draggable="false"
              onContextMenu={e => e.preventDefault()}
            />
          </motion.div>
        </div>

        {/* Flap front (peeled back face) */}
        <motion.div
          className="absolute w-full h-full left-0"
          style={{
            top: flapTop,
            transform: 'scaleY(-1)',
            willChange: 'clip-path, top',
          }}
          animate={{ clipPath: flapClip, top: flapTop }}
          transition={transition}
        >
          <div style={{ filter: 'url(#pointLightFlipped)' }}>
            <img
              src={imageSrc}
              alt=""
              style={shadowImageStyle}
              draggable="false"
              onContextMenu={e => e.preventDefault()}
            />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default StickerPeel;