import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';
import { AuthProvider  } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import OrderTracking from './pages/OrderTracking';
import About from './pages/About';
import MyOrders from './pages/MyOrders';
import Header from './components/header';
import Footer from './components/footer';
import CartPopup from './components/Cartpopup';

// ── Floating, draggable cart button ──
// Starts anchored to the bottom-right corner and can be dragged
// anywhere within the viewport. A tap (no drag) opens the cart popup.
const CartButton = () => {
  const { totalItems, openCart } = useCart();
  const constraintsRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const didDrag = useRef(false);

  const handleDragStart = (event, info) => {
    didDrag.current = false;
    dragStart.current = { x: info.point.x, y: info.point.y };
  };

  const handleDrag = (event, info) => {
    const dx = Math.abs(info.point.x - dragStart.current.x);
    const dy = Math.abs(info.point.y - dragStart.current.y);
    if (dx > 5 || dy > 5) didDrag.current = true;
  };

  const handleClick = () => {
    if (!didDrag.current) openCart();
  };

  return (
    <div
      ref={constraintsRef}
      className="fixed inset-0 pointer-events-none z-50"
    >
      <motion.button
        type="button"
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.08}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onClick={handleClick}
        whileTap={{ scale: 0.95 }}
        aria-label="View cart"
        className="pointer-events-auto absolute bottom-6 right-6 w-14 h-14 rounded-full bg-white shadow-lg shadow-black/20 flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        <ShoppingCart className="w-6 h-6" style={{ color: '#6B7C2F' }} />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#6B7C2F] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </motion.button>
    </div>
  );
};

const AppLayout = () => (
  <div className="min-h-screen bg-[#050A0A]">
    <Header />
    <Routes>
      <Route path="/"                   element={<Home />} />
      <Route path="/menu/:restaurantId" element={<Menu />} />
      <Route path="/login"              element={<Login />} />
      <Route path="/register"           element={<Register />} />
      <Route path="/about"              element={<About />} />
      <Route
        path="/checkout"
        element={<ProtectedRoute><Checkout /></ProtectedRoute>}
      />
      <Route
        path="/orders/:id"
        element={<ProtectedRoute><OrderTracking /></ProtectedRoute>}
      />
      <Route
        path="/orders"
        element={<ProtectedRoute><MyOrders /></ProtectedRoute>}
      />
    </Routes>
    <Footer/>
    <CartButton />
    <CartPopup />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppLayout />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;