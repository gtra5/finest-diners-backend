import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Cart = ({ isOpen, onClose }) => {
  const { cartItems, removeItem, addItem, totalPrice, totalItems, restaurantId } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    if (!user) {
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Drawer */}
      <div className="relative bg-white w-full max-w-sm h-full flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-xl font-bold text-gray-800">Your Cart ({totalItems})</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">
            &times;
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cartItems.length === 0 ? (
            <p className="text-gray-400 text-center mt-10">Your cart is empty.</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.spoonacularId} className="flex items-center gap-3">
                <img
                  src={item.imageUrl || 'https://via.placeholder.com/60'}
                  alt={item.name}
                  className="w-14 h-14 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                  <p className="text-orange-500 text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeItem(item.spoonacularId)}
                    className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => addItem(item, restaurantId)}
                    className="w-7 h-7 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-600 font-bold flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-5 border-t">
            <div className="flex justify-between mb-4 text-gray-700 font-semibold">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
