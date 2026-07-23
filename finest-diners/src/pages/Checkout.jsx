import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useGeolocation } from '../hooks/useGeolocation';
import api, { initializePayment } from '../services/api';

const Checkout = () => {
  const { cartItems, totalPrice, restaurantId, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getCurrentLocation, loading: locationLoading, error: locationError } = useGeolocation();

  const [address, setAddress] = useState(user?.address || '');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [latitude, setLatitude] = useState(user?.latitude || '');
  const [longitude, setLongitude] = useState(user?.longitude || '');

  // Handle Paystack callback
  useEffect(() => {
    const reference = searchParams.get('reference');
    if (reference) {
      handlePaymentVerification(reference);
    }
  }, [searchParams]);

  const handlePaymentVerification = async (reference) => {
    try {
      setLoading(true);
      const response = await api.get(`/payments/verify/${reference}`);
      if (response.data.success) {
        clearCart();
        navigate(`/orders/${response.data.order._id}`);
      } else {
        setError('Payment verification failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      setLatitude(location.latitude);
      setLongitude(location.longitude);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const items = cartItems.map((item) => ({
        food: item._id || item.spoonacularId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      }));

      // Create order first
      const { data: order } = await api.post('/orders', {
        restaurant: restaurantId,
        items,
        deliveryAddress: address,
        paymentMethod,
        notes,
        latitude: latitude || null,
        longitude: longitude || null,
      });

      // If card payment, initialize Paystack
      if (paymentMethod === 'card') {
        const paymentData = await initializePayment(
          order._id,
          totalPrice,
          user.email
        );

        if (paymentData.success && paymentData.authorization_url) {
          // Redirect to Paystack payment page
          window.location.href = paymentData.authorization_url;
          return;
        } else {
          throw new Error('Failed to initialize payment');
        }
      }

      // For cash payment, proceed directly
      clearCart();
      navigate(`/orders/${order._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <p className="text-neutral-500 font-mono text-sm">
          Your cart is empty.{' '}
          <a href="/" className="text-lime-400 hover:underline">Go back</a>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white w-full max-w-screen-xl mx-auto">

      {/* ── PAGE HEADER ── */}
      <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-6 border-b border-neutral-800">
        <p className="section-label mb-2">FINALISE ORDER</p>
        <h1 className="hero-title text-3xl sm:text-4xl font-black tracking-tight">CHECKOUT</h1>
      </section>

      <div className="px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-6">

        {/* ── FORM ── */}
        <div className="flex-1">
          {error && (
            <div className="border border-red-800 bg-red-950 text-red-400 text-xs font-mono px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Delivery address */}
            <div
              className="border border-neutral-800 p-5"
              style={{ background: '#131313' }}
            >
              <p className="section-label mb-4">DELIVERY ADDRESS</p>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                placeholder="123 Main St, City, State"
                className="w-full bg-neutral-900 border border-neutral-700 text-white text-sm font-mono px-4 py-3 focus:outline-none focus:border-lime-400 transition-colors placeholder-neutral-600"
              />
            </div>

            {/* Location coordinates */}
            <div
              className="border border-neutral-800 p-5"
              style={{ background: '#131313' }}
            >
              <p className="section-label mb-4">DELIVERY COORDINATES <span className="text-neutral-600">(OPTIONAL)</span></p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="number"
                  step="any"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="Latitude"
                  className="w-full bg-neutral-900 border border-neutral-700 text-white text-sm font-mono px-4 py-3 focus:outline-none focus:border-lime-400 transition-colors placeholder-neutral-600"
                />
                <input
                  type="number"
                  step="any"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="Longitude"
                  className="w-full bg-neutral-900 border border-neutral-700 text-white text-sm font-mono px-4 py-3 focus:outline-none focus:border-lime-400 transition-colors placeholder-neutral-600"
                />
              </div>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locationLoading}
                className="w-full bg-neutral-800 border border-neutral-700 text-neutral-300 text-xs font-mono px-4 py-2 hover:border-lime-400 hover:text-lime-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {locationLoading ? 'GETTING LOCATION...' : '📍 USE MY CURRENT LOCATION'}
              </button>
              {locationError && (
                <p className="text-red-400 text-xs font-mono mt-2">{locationError}</p>
              )}
            </div>

            {/* Payment method */}
            <div
              className="border border-neutral-800 p-5"
              style={{ background: '#131313' }}
            >
              <p className="section-label mb-4">PAYMENT METHOD</p>
              <div className="flex flex-col gap-3">
                {[
                  { value: 'card', label: 'CREDIT / DEBIT CARD' },
                  { value: 'cash', label: 'CASH ON DELIVERY' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 border px-4 py-3 cursor-pointer transition-colors ${
                      paymentMethod === opt.value
                        ? 'border-lime-400 text-lime-400'
                        : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.value}
                      checked={paymentMethod === opt.value}
                      onChange={() => setPaymentMethod(opt.value)}
                      className="accent-lime-400"
                    />
                    <span className="font-mono text-xs tracking-widest">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div
              className="border border-neutral-800 p-5"
              style={{ background: '#131313' }}
            >
              <p className="section-label mb-4">SPECIAL INSTRUCTIONS <span className="text-neutral-600">(OPTIONAL)</span></p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Any special instructions..."
                className="w-full bg-neutral-900 border border-neutral-700 text-white text-sm font-mono px-4 py-3 focus:outline-none focus:border-lime-400 transition-colors placeholder-neutral-600 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'PLACING ORDER...' : `PLACE ORDER · $${totalPrice.toFixed(2)}`}
            </button>
          </form>
        </div>

        {/* ── ORDER SUMMARY ── */}
        <div className="lg:w-80 flex-shrink-0">
          <div
            className="border border-neutral-800 p-6 sticky top-24"
            style={{ background: '#131313' }}
          >
            <p className="section-label mb-5">ORDER SUMMARY</p>
            <div className="space-y-2 mb-5">
              {cartItems.map((item) => (
                <div key={item.spoonacularId} className="flex justify-between text-xs font-mono text-neutral-400">
                  <span className="truncate pr-2">{item.name} × {item.quantity}</span>
                  <span className="flex-shrink-0 text-neutral-300">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs font-mono text-neutral-500 border-t border-neutral-800 pt-4 mb-2">
              <span>DELIVERY</span>
              <span style={{ color: '#c8f135' }}>FREE</span>
            </div>
            <div className="flex justify-between border-t border-neutral-800 pt-4">
              <span className="hero-title font-bold text-white text-base">TOTAL</span>
              <span className="font-mono font-bold text-white text-base">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
