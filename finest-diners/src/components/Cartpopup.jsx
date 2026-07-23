import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const RESTAURANT_ID = import.meta.env.VITE_RESTAURANT_ID;

// ── Slide-in cart drawer ──
// Rendered once at the app root. Opens/closes based on CartContext's
// isCartOpen flag so it can be triggered from anywhere (e.g. the
// floating cart button) without navigating to a dedicated page.
const CartPopup = () => {
  const {
    cartItems,
    addItem,
    removeItem,
    clearCart,
    totalPrice,
    totalItems,
    restaurantId,
    isCartOpen,
    closeCart,
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Lock page scroll while the drawer is open
  useEffect(() => {
    document.body.style.overflow = isCartOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isCartOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeCart();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isCartOpen, closeCart]);

  const handleCheckout = () => {
    closeCart();
    if (!user) navigate('/login');
    else navigate('/checkout');
  };

  const handleNavLinkClick = () => closeCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/70 z-[60]"
          />

          {/* Panel */}
          <motion.div
            key="cart-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#0A0F0F] border-l border-neutral-800 z-[70] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 pt-6 pb-4 border-b border-neutral-800 flex-shrink-0">
              <div>
                <p className="section-label mb-1">YOUR ORDER</p>
                <h2 className="hero-title text-xl font-black tracking-tight text-white">CART</h2>
              </div>
              <button
                onClick={closeCart}
                aria-label="Close cart"
                className="w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* EMPTY STATE */}
            {cartItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <span className="text-5xl">🛒</span>
                <p className="section-label text-neutral-600">CART IS EMPTY</p>
                <p className="text-neutral-500 text-sm font-mono max-w-xs">
                  Browse the menu and add something you love.
                </p>
                <Link
                  to={`/menu/${RESTAURANT_ID}`}
                  onClick={handleNavLinkClick}
                  className="btn-primary mt-2"
                >
                  BROWSE MENU
                </Link>
              </div>
            ) : (
              <>
                {/* Items list */}
                <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.spoonacularId}
                      className="border border-neutral-800 flex items-center gap-3 p-3"
                      style={{ background: '#131313' }}
                    >
                      <img
                        src={item.imageUrl || 'https://via.placeholder.com/80'}
                        alt={item.name}
                        className="w-14 h-14 object-cover flex-shrink-0 border border-neutral-800"
                      />

                      <div className="flex-1 min-w-0">
                        <h3 className="hero-title font-bold text-xs text-white truncate">
                          {item.name}
                        </h3>
                        <p className="font-mono text-xs mt-1" style={{ color: '#c8f135' }}>
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="flex items-center gap-2 border border-neutral-800">
                          <button
                            onClick={() => removeItem(item.spoonacularId)}
                            className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-white transition-colors font-mono"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="text-xs font-mono font-bold w-4 text-center text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => addItem(item, restaurantId)}
                            className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-lime-400 transition-colors font-mono"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <p className="font-mono text-[11px] font-semibold text-white">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}

                  <Link
                    to={`/menu/${RESTAURANT_ID}`}
                    onClick={handleNavLinkClick}
                    className="inline-flex items-center gap-2 section-label text-neutral-500 hover:text-lime-400 transition-colors mt-1 text-xs"
                  >
                    ← CONTINUE SHOPPING
                  </Link>
                </div>

                {/* Summary + checkout */}
                <div className="border-t border-neutral-800 px-5 sm:px-6 py-5 flex-shrink-0">
                  <div className="flex justify-between text-xs font-mono text-neutral-500 mb-2">
                    <span>{totalItems} ITEM{totalItems !== 1 ? 'S' : ''} · DELIVERY</span>
                    <span style={{ color: '#c8f135' }}>FREE</span>
                  </div>

                  <div className="flex justify-between border-t border-neutral-800 pt-3 mb-4">
                    <span className="hero-title font-bold text-white text-sm">TOTAL</span>
                    <span className="font-mono font-bold text-white text-sm">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>

                  <button onClick={handleCheckout} className="btn-primary w-full text-center">
                    {user ? 'PROCEED TO CHECKOUT' : 'LOGIN TO CHECKOUT'}
                  </button>

                  <div className="flex items-center justify-between mt-3">
                    {!user ? (
                      <p className="text-neutral-600 text-[11px] font-mono">
                        Login required to place an order.
                      </p>
                    ) : (
                      <span />
                    )}
                    <button
                      onClick={clearCart}
                      className="text-neutral-600 hover:text-white text-[11px] font-mono transition-colors"
                    >
                      CLEAR CART
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartPopup;