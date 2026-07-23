import { Menu, X, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const RESTAURANT_ID = import.meta.env.VITE_RESTAURANT_ID;

const navItems = [
  { label: "Home", to: "/" },
  { label: "Menus", to: `/menu/${RESTAURANT_ID}` },
  { label: "About", to: "/about" },
  { label: "My Order", to: "/orders" },
];

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  // Lock background scroll while the menu (and its blur backdrop) is open —
  // otherwise the page can still scroll underneath a blurred, "frozen"-looking panel.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&display=swap');`}</style>

      {/* Blurs/dims everything behind the header + menu panel. Sits at a
          lower z-index than the header wrapper below, so the logo/toggle/
          panel stay crisp while the rest of the page blurs. */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-md"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Fixed to the viewport so it floats over whatever page content sits
          beneath it (the hero video on Home, plain content elsewhere). */}
      <div className="fixed top-0 inset-x-0 z-50">
        <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <header className="w-full flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5">
            {/* ── Logo ── */}
            <Link to="/">
              <motion.div
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="text-white text-2xl sm:text-3xl lg:text-4xl font-black italic tracking-tight"
                style={{ fontFamily: '"DM Serif Display", serif' }}
              >
                Finest Diners
              </motion.div>
            </Link>

            {/* ── Toggle pill (Menu / Close) ── */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full px-5 py-2.5 border transition-colors"
              style={{
                background: menuOpen ? "transparent" : "#F5F0E6",
                borderColor: menuOpen ? "rgba(255,255,255,0.5)" : "transparent",
                color: menuOpen ? "#F5F0E6" : "#3f4a1c",
              }}
              aria-label="Toggle menu"
            >
              <span
                className="text-sm font-bold tracking-wide"
                style={{ fontFamily: "'Baloo 2', sans-serif" }}
              >
                {menuOpen ? "CLOSE" : "MENU"}
              </span>
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </header>

          {/* ── Nav panel — fixed at exactly 300px wide, right-aligned under the toggle ── */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.98 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="relative mt-2 ml-auto rounded-[1.75rem] overflow-hidden px-6 py-8"
                style={{ background: "#4B5A22", width: "300px" }}
              >
                {/* decorative circular icon */}
                <div
                  className="hidden md:flex absolute left-[-20px] top-10
                    w-11 h-11 rounded-full items-center justify-center shadow-lg"
                  style={{ background: "#F5F0E6" }}
                >
                  <Leaf className="w-5 h-5" style={{ color: "#4B5A22" }} />
                </div>

                {/* Nav links */}
                <nav className="flex flex-col gap-1">
                  {navItems.map((item, index) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      className="py-1.5 text-2xl uppercase tracking-tight leading-tight transition-opacity hover:opacity-70"
                      style={{
                        fontFamily: "'Baloo 2', sans-serif",
                        fontWeight: 700,
                        color: index === 0 ? "#F5F0E6" : "rgba(245,240,230,0.85)",
                      }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <hr
                  className="my-6 border-t"
                  style={{ borderColor: "rgba(245,240,230,0.2)" }}
                />

                {/* Tagline / auth footer */}
                <div className="flex flex-col gap-4">
                  <p
                    className="text-[10px] uppercase tracking-[0.15em] font-semibold leading-relaxed"
                    style={{
                      fontFamily: "'Baloo 2', sans-serif",
                      color: "rgba(245,240,230,0.6)",
                    }}
                  >
                    Curated Menus · Delivered With Care
                  </p>

                  {user ? (
                    <div className="flex flex-col gap-3">
                      <p
                        className="text-xs"
                        style={{ color: "rgba(245,240,230,0.7)" }}
                      >
                        Signed in as{" "}
                        <span style={{ color: "#F5F0E6" }}>{user.name}</span>
                      </p>
                      <button
                        onClick={handleLogout}
                        className="rounded-full py-2 px-6 text-sm font-semibold border transition-colors hover:bg-white/10 w-fit"
                        style={{ borderColor: "rgba(245,240,230,0.3)", color: "#F5F0E6" }}
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <Link
                        to="/login"
                        onClick={() => setMenuOpen(false)}
                        className="text-center rounded-full py-2.5 px-6 text-sm font-semibold border transition-colors hover:bg-white/10"
                        style={{ borderColor: "rgba(245,240,230,0.3)", color: "#F5F0E6" }}
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setMenuOpen(false)}
                        className="text-center rounded-full py-2.5 px-6 text-sm font-semibold transition hover:opacity-90"
                        style={{ background: "#F5F0E6", color: "#3f4a1c" }}
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}