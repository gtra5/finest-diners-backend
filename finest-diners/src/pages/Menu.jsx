import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import FoodCard from "../components/FoodCard";
import CustomerReview from "../components/customerReview";

const Menu = () => {
  const { restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
 

  const scallopedWaveFlipped =
    'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100"><g transform="matrix(1 0 0 -1 0 100)"><path d="M0 0v60c9 0 18-3 25-10 13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s37 13 50 0c14-14 37-14 50 0 7 7 16 10 25 10V0H0Z" fill="%23050A0A"></path></g></svg>\')';

  const scallopedWaveNormal =
    'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100"><path d="M0 0v60c9 0 18-3 25-10 13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s36 14 50 0c13-14 36-14 50 0s37 13 50 0c14-14 37-14 50 0 7 7 16 10 25 10V0H0Z" fill="%23050A0A"></path></svg>\')';

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get(`/food/menu/${restaurantId}`);
        setRestaurant(data.restaurant);
        setMenu(data.menu);
      } catch (err) {
        const msg = err.response?.data?.message || err.message;
        setError(`Failed to load menu: ${msg}`);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [restaurantId]);

  const categories = [
    "All",
    ...new Set(menu.map((item) => item.category).filter(Boolean)),
  ].filter((cat) => cat !== "Main");

  const filtered =
    activeCategory === "All"
      ? menu
      : menu.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen text-white w-full max-w-screen-xl mx-auto">
      {/* ── PAGE HEADER ── */}
      <section className="px-4 sm:px-6 lg:px-8 pt-12 pb-8 bg-[#556B2F] min-h-screen relative flex flex-col justify-center items-center text-center gap-2">
        {restaurant?.name && (
          <h1 className="hero-title font-semibold tracking-widest text-2xl sm:text-4xl">
            {restaurant.name}
          </h1>
        )}
        {restaurant?.cuisine && (
          <p className="section-label text-white/70">
            {restaurant.cuisine.toUpperCase()}
          </p>
        )}

        <div
          className="absolute bottom-0 left-0 w-full pointer-events-none"
          style={{
            backgroundImage: scallopedWaveFlipped,
            backgroundRepeat: "repeat-x",
            backgroundSize: "auto 100%",
            backgroundPosition: "0 0",
            height: "100px",
          }}
        />
      </section>

     {/* ── CATEGORY FILTER ── */}
{categories.length > 1 && (
  <section className="px-4 sm:px-6 lg:px-8 py-5 border-b border-neutral-800">
    <div className="flex gap-2 flex-wrap">
      {categories.map((cat) => {
        const isActive = activeCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-5 py-2 text-xs font-mono tracking-widest uppercase transition-all duration-200 active:scale-95 ${
              isActive
                ? "bg-[#556B2F] text-[#FFFFFF]"
                : "bg-white text-[#556B2F] hover:bg-lime-300"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  </section>
)}

      {/* ── FOOD GRID ── */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10 relative pb-16 sm:pb-20">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
          <h2 className="hero-title font-semibold tracking-widest text-xs sm:text-sm">
            {activeCategory === "All"
              ? "FULL INDEX"
              : activeCategory.toUpperCase()}
          </h2>
          {!loading && !error && (
            <span className="section-label text-neutral-600">
              {filtered.length} ITEMS
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
            <p className="section-label">LOADING MENU...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <p className="text-red-400 text-sm font-mono text-center">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              RETRY
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span className="text-4xl">🍽️</span>
            <p className="section-label text-neutral-600">
              NO ITEMS IN THIS CATEGORY
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {filtered.map((food) => (
              <FoodCard
                key={food.spoonacularId}
                food={food}
                restaurantId={restaurantId}
              />
            ))}
          </div>
        )}
      </section>

      {/* scalloped wave divider — overlaps down onto the white section below it */}
      <div
        className="relative z-10 w-full h-20 sm:h-28 -mb-20 sm:-mb-28 pointer-events-none"
        style={{
          backgroundImage: scallopedWaveNormal,
          backgroundRepeat: "repeat-x",
          backgroundSize: "auto 100%",
        }}
      />
      <CustomerReview/>

     
    </div>
  );
};

export default Menu;
