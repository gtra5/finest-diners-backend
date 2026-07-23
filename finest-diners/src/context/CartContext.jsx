import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  const addItem = (item, restId) => {
    // Prevent mixing items from different restaurants
    if (restaurantId && restaurantId !== restId) {
      const confirmed = window.confirm(
        'Your cart has items from another restaurant. Clear cart and add new item?'
      );
      if (!confirmed) return;
      setCartItems([]);
    }

    setRestaurantId(restId);
    setCartItems((prev) => {
      const existing = prev.find((i) => i.spoonacularId === item.spoonacularId);
      if (existing) {
        return prev.map((i) =>
          i.spoonacularId === item.spoonacularId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (spoonacularId) => {
    setCartItems((prev) => {
      const updated = prev
        .map((i) => (i.spoonacularId === spoonacularId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0);
      if (updated.length === 0) setRestaurantId(null);
      return updated;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurantId(null);
  };

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        restaurantId,
        addItem,
        removeItem,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);