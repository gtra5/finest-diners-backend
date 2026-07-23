import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import img1 from "../assets/bg-heritage.png";
import img2 from "../assets/bg-community.png";
import img3 from "../assets/bg-machines.png";
import img4 from "../assets/bg-creative.png";
import img5 from "../assets/bg-burger.png";

const items = [
  {
    id: 1,
    number: '01',
    title: 'HERITAGE',
    description: 'Since 1967, we\'ve been crafting automotive excellence with passion and precision. Our legacy spans generations of dedicated enthusiasts.',
    backgroundImage: img1,
  },
  {
    id: 2,
    number: '02',
    title: 'OUR COMMUNITY',
    description: 'Join thousands of car enthusiasts who share our passion for speed, style, and innovation. Together we create memories on every drive.',
    backgroundImage: img2,
  },
  {
    id: 3,
    number: '03',
    title: 'MACHINES',
    description: 'Petrol heads since way back, \'Speed & Custom\' Machines are part of our DNA. Encompassing anything on wheels and showcased through our fleet of purple custom classic cars peppered around the country.',
    backgroundImage: img3,
  },
  {
    id: 4,
    number: '04',
    title: 'CREATIVE SPIRIT',
    description: 'Innovation meets artistry in everything we do. From design to performance, we push boundaries and challenge conventions in the automotive world.',
    backgroundImage: img4,
  },
  {
    id: 5,
    number: '05',
    title: 'RADIO BURGER',
    description: 'The heart of our culture beats loud and clear. Where classic rock, vintage style, and automotive passion converge in perfect harmony.',
    backgroundImage: img5,
  },
];

export default function DesktopCarousel() {
  const [selectedId, setSelectedId] = useState(3);

  return (
    <div className="w-full flex items-center justify-center overflow-hidden" style={{ padding: '0 32px 48px' }}>
      <div className="flex gap-3 w-full justify-center" style={{ height: '520px' }}>
        {items.map((item) => {
          const isSelected = selectedId === item.id;
          const isCollapsed = !isSelected;

          return (
            <motion.button
              key={item.id}
              onClick={() => { if (item.id !== selectedId) setSelectedId(item.id); }}
              layout
              transition={{ layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }}
              className="relative overflow-hidden cursor-pointer flex-shrink-0"
              style={{
                flex: isSelected ? '1 1 auto' : '0 0 80px',
                height: '100%',
                borderRadius: '0px',
              }}
              whileTap={{ scale: isSelected ? 1 : 0.99 }}
            >
              {/* Collapsed background */}
              {!isSelected && (
                <div className="absolute inset-0 bg-[#050A0A]" />
              )}

              {/* Expanded background image */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${item.backgroundImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div className="absolute inset-0 bg-black/30" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Card content */}
              <div className="relative w-full h-full flex flex-col z-10">

                {/* Number */}
                <motion.div
                  animate={{ opacity: isSelected ? 0 : 1 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-3 left-0 right-0 flex justify-center"
                >
                  <span className="text-sm font-bold text-white tracking-widest">
                    {item.number}
                  </span>
                </motion.div>

                {/* Rotated title (collapsed) */}
                {isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-4"
                  >
                    <span
                      className="font-black text-white uppercase leading-none"
                      style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        transform: 'rotate(180deg)',
                        fontSize: '30px',
                      }}
                    >
                      {item.title}
                    </span>
                  </motion.div>
                )}

                {/* Title (expanded) */}
                <motion.div
                  animate={{ opacity: isSelected ? 1 : 0, y: isSelected ? 0 : 20 }}
                  transition={{ duration: 0.4, delay: isSelected ? 0.15 : 0 }}
                  className="absolute top-8 left-0 right-0 px-6 z-30"
                >
                  <h2 className="text-4xl xl:text-6xl font-black text-white drop-shadow-lg leading-none">
                    {item.title}
                  </h2>
                </motion.div>

                {/* Description (expanded) */}
                <motion.div
                  animate={{ opacity: isSelected ? 1 : 0, y: isSelected ? 0 : 20 }}
                  transition={{ duration: 0.4, delay: isSelected ? 0.2 : 0 }}
                  className="absolute bottom-16 left-0 right-0 px-6 xl:px-10 z-30 max-w-2xl"
                >
                  <p className="text-base xl:text-lg text-white/95 leading-relaxed drop-shadow-lg">
                    {item.description}
                  </p>
                </motion.div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}