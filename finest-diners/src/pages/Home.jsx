const RESTAURANT_ID = import.meta.env.VITE_RESTAURANT_ID;
import api from "../services/api";
import { useState, useEffect, useRef } from "react";
import FoodCard from "../components/FoodCard";
import Herosection from "../components/herosection";

import BurgerFuelHero from "../components/advertisement";
import Section4 from "../components/section4";
import {
  Flame,
  Leaf,
  Fish,
  Coffee,
  Plus,
  Star,
  Clock,
  
} from "lucide-react";

const OLIVE = "#6B7C2F";
const OLIVE_DIM = "#3a4419";
const OLIVE_LIGHT = "#D4E2B9";

const CARD = "#0f1410";
const BORDER = "#1e251e";
const CATS = [
  { icon: <Flame size={15} />, label: "Hot & Spicy" },
  { icon: <Leaf size={15} />, label: "Plant-Based" },
  { icon: <Fish size={15} />, label: "Seafood" },
  { icon: <Coffee size={15} />, label: "Drinks" },
  { icon: <Star size={15} />, label: "Bestsellers" },
  { icon: <Clock size={15} />, label: "Quick Picks" },
  { icon: <Plus size={15} />, label: "New Drops" },
];

export default function Home() {
  const heroRef = useRef(null);
  const [foods, setFoods] = useState([]);
  const [flashSale, setFlashSale] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");


  useEffect(() => {
    api
      .get(`/food/menu/${RESTAURANT_ID}`)
      .then(({ data }) => {
        setFoods(data.menu.slice(0, 4));
        setFlashSale(data.menu.slice(4, 6));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    el.style.opacity = 0;
    el.style.transform = "translateY(24px)";
    requestAnimationFrame(() => {
      el.style.transition = "opacity 0.9s ease, transform 0.9s ease";
      el.style.opacity = 1;
      el.style.transform = "translateY(0)";
    });
  }, []);

  return (
    <div className="min-h-screen text-white w-full max-w-screen-xl mx-auto">
      <div className="flex flex-col w-full">
        {/* ── HERO ── */}
        <div ref={heroRef}>
          <Herosection />
        </div>

        {/* ── CATEGORIES ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10 border-b border-neutral-800">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-4 sm:mb-6">
            <h2 className="hero-title font-semibold tracking-widest text-xs sm:text-sm">
              TECHNICAL CATEGORIES
            </h2>
            <button className="section-label hover:text-white transition-colors text-xs sm:text-sm">
              BROWSE FULL INDEX →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
           {CATS.map(({ icon, label }) => (
              <button
                key={label}
                onClick={() => setActiveFilter(label)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 22px",
                  background: activeFilter === label ? OLIVE_DIM : CARD,
                  border: `1px solid ${activeFilter === label ? OLIVE : BORDER}`,
                  color: activeFilter === label ? OLIVE_LIGHT : "#7a8a7a",
                  fontSize: 12,
                  letterSpacing: "0.06em",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "all 0.15s",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                <span style={{ color: activeFilter === label ? OLIVE_LIGHT : OLIVE }}>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* ── FEATURED SUBSCRIPTIONS ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10 border-b border-neutral-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {[
              {
                label: "PROTOCOL FILE — 01",
                title: "Prime Harvest\nSubscription",
                img: flashSale[0]?.imageUrl || null,
                name: flashSale[0]?.name || "",
              },
              {
                label: "PROTOCOL FILE — 02",
                title: "Gourmet Curated\nArchitecture",
                img: flashSale[1]?.imageUrl || null,
                name: flashSale[1]?.name || "",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="relative overflow-hidden group cursor-pointer"
                style={{ height: "clamp(160px, 28vw, 220px)" }}
              >
                {item.img ? (
                  <img
                    src={item.img}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
                )}

                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.88) 40%, rgba(0,0,0,0.15) 100%)",
                  }}
                />

                <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end">
                  <p className="section-label mb-1 sm:mb-2 text-xs">
                    {item.label}
                  </p>
                  <h3 className="hero-title font-bold text-lg sm:text-2xl leading-tight mb-3 sm:mb-4 whitespace-pre-line">
                    {item.name || item.title}
                  </h3>
                  <button
                    className="btn-primary self-start text-xs"
                    onClick={() =>
                      (window.location.href = `/menu/${RESTAURANT_ID}`)
                    }
                  >
                    ORDER NOW
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── OUR PRODUCTS ── */}
        <section>
          <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10 border-b border-neutral-800">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-4 sm:mb-6">
              <h2 className="hero-title font-semibold tracking-widest text-xs sm:text-sm">
                OUR PRODUCTS
              </h2>
              <button
                className="h-8 px-3 border border-neutral-700 flex items-center justify-center hover:border-lime-400 transition-colors text-xs sm:text-sm whitespace-nowrap"
                onClick={() =>
                  (window.location.href = `/menu/${RESTAURANT_ID}`)
                }
              >
                View All →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {loading ? (
                <p className="text-neutral-500 text-xs col-span-full">
                  Loading inventory...
                </p>
              ) : (
                foods.map((food) => (
                  <FoodCard
                    key={food.spoonacularId}
                    food={food}
                    restaurantId={RESTAURANT_ID}
                  />
                ))
              )}
            </div>
          </div>
          <div style={{ lineHeight: 0, marginTop: 60 }}>
            <svg
              viewBox="0 0 1440 110"
              preserveAspectRatio="none"
              style={{ width: "100%", height: 110, display: "block" }}
              fill={"#ffffff"}
            >
              <path d="M0,58 C280,118 540,2 840,78 C1080,138 1280,18 1440,58 L1440,110 L0,110 Z" />
            </svg>
          </div>
        </section>
        <Section4 />

        <section>
          <BurgerFuelHero />
        </section>
      </div>
    </div>
  );
}
