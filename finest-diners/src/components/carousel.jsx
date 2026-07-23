import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
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

export default function MobileCarousel() {
  return (
    <div className="w-full">
      <style>{`
        .pillars-swiper .swiper-pagination-bullet {
          background: #6B7C2F;
          opacity: 0.4;
          width: 8px;
          height: 8px;
        }
        .pillars-swiper .swiper-pagination-bullet-active {
          background: #6B7C2F;
          opacity: 1;
          width: 24px;
          border-radius: 4px;
        }
      `}</style>

      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        spaceBetween={16}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 1.15, spaceBetween: 20 },
          768: { slidesPerView: 1.3, spaceBetween: 24 },
        }}
        className="pillars-swiper w-full"
        style={{ paddingBottom: '48px' }}
      >
        {items.map((item) => (
          <SwiperSlide key={item.id}>
            <div
              className="relative overflow-hidden"
              style={{ height: '420px', borderRadius: '12px' }}
            >
              {/* Background image */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${item.backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/40" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-between p-6 z-10">
                <span className="text-white/70 font-bold tracking-widest text-sm">
                  {item.number}
                </span>

                <div>
                  <h2
                    className="text-white font-black uppercase leading-none mb-3"
                    style={{ fontSize: 'clamp(28px, 7vw, 48px)' }}
                  >
                    {item.title}
                  </h2>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}