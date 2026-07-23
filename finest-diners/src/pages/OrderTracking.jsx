import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const RESTAURANT_ID = import.meta.env.VITE_RESTAURANT_ID;

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

const STATUS_LABELS = {
  pending: 'ORDER PLACED',
  confirmed: 'CONFIRMED',
  preparing: 'PREPARING',
  out_for_delivery: 'OUT FOR DELIVERY',
  delivered: 'DELIVERED',
  cancelled: 'CANCELLED',
};

const STATUS_ICONS = {
  pending: '📋',
  confirmed: '✅',
  preparing: '👨‍🍳',
  out_for_delivery: '🛵',
  delivered: '🎉',
};

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch {
        setError('Could not load order details.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
        <p className="section-label">LOADING ORDER...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-red-400 text-sm font-mono text-center">{error || 'Order not found.'}</p>
        <Link to={`/menu/${RESTAURANT_ID}`} className="btn-primary">BACK TO MENU</Link>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(order.status);
  const progressPct = currentStep >= 0 ? (currentStep / (STATUS_STEPS.length - 1)) * 100 : 0;

  return (
    <div className="min-h-screen text-white w-full max-w-screen-xl mx-auto">

      {/* ── PAGE HEADER ── */}
      <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-6 border-b border-neutral-800">
        <p className="section-label mb-2">LIVE STATUS</p>
        <h1 className="hero-title text-3xl sm:text-4xl font-black tracking-tight">ORDER TRACKING</h1>
        <p className="text-neutral-600 text-xs font-mono mt-2">ID: {order._id}</p>
      </section>

      <div className="px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-6">

        {/* ── LEFT: status + details ── */}
        <div className="flex-1 space-y-5">

          {/* Status stepper */}
          {order.status !== 'cancelled' ? (
            <div
              className="border border-neutral-800 p-6"
              style={{ background: '#131313' }}
            >
              <p className="section-label mb-6">DELIVERY PROGRESS</p>

              {/* Progress bar */}
              <div className="relative h-1 bg-neutral-800 mb-8">
                <div
                  className="absolute inset-y-0 left-0 transition-all duration-700"
                  style={{ width: `${progressPct}%`, background: '#c8f135' }}
                />
              </div>

              {/* Steps */}
              <div className="grid grid-cols-5 gap-1">
                {STATUS_STEPS.map((step, index) => {
                  const done = index < currentStep;
                  const active = index === currentStep;
                  return (
                    <div key={step} className="flex flex-col items-center gap-2 text-center">
                      <div
                        className={`w-9 h-9 flex items-center justify-center text-base border transition-colors ${
                          done || active
                            ? 'border-lime-400 text-lime-400'
                            : 'border-neutral-700 text-neutral-600'
                        }`}
                        style={done || active ? { background: 'rgba(163,230,53,0.08)' } : { background: '#0d0d0d' }}
                      >
                        {done ? '✓' : STATUS_ICONS[step]}
                      </div>
                      <span
                        className={`text-[9px] font-mono tracking-wider leading-tight ${
                          done || active ? 'text-lime-400' : 'text-neutral-600'
                        }`}
                      >
                        {STATUS_LABELS[step]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="border border-red-800 bg-red-950 text-red-400 text-xs font-mono px-5 py-4">
              ✕ THIS ORDER HAS BEEN CANCELLED.
            </div>
          )}

          {/* Order items */}
          <div
            className="border border-neutral-800 p-6"
            style={{ background: '#131313' }}
          >
            <p className="section-label mb-4">ITEMS</p>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-xs font-mono text-neutral-400 border-b border-neutral-800 pb-3 last:border-0 last:pb-0">
                  <span>{item.name} × {item.quantity}</span>
                  <span className="text-neutral-300">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-4 border-t border-neutral-800 mt-1">
              <span className="hero-title font-bold text-white text-sm">TOTAL</span>
              <span className="font-mono font-bold text-white text-sm">${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>

        </div>

        {/* ── RIGHT: delivery details ── */}
        <div className="lg:w-72 flex-shrink-0 space-y-5">
          <div
            className="border border-neutral-800 p-6"
            style={{ background: '#131313' }}
          >
            <p className="section-label mb-4">DELIVERY DETAILS</p>
            <div className="space-y-3">
              <div>
                <p className="text-neutral-600 text-[10px] font-mono tracking-widest mb-1">ADDRESS</p>
                <p className="text-white text-sm font-mono">📍 {order.deliveryAddress}</p>
              </div>
              <div>
                <p className="text-neutral-600 text-[10px] font-mono tracking-widest mb-1">PAYMENT</p>
                <p className="text-white text-sm font-mono">
                  💳 {order.paymentMethod === 'card' ? 'Card Payment' : 'Cash on Delivery'}
                </p>
              </div>
              {order.restaurant && (
                <div>
                  <p className="text-neutral-600 text-[10px] font-mono tracking-widest mb-1">RESTAURANT</p>
                  <p className="text-white text-sm font-mono">🍽️ {order.restaurant.name}</p>
                </div>
              )}
            </div>
          </div>

          <Link to={`/menu/${RESTAURANT_ID}`} className="btn-outline block text-center">
            ORDER AGAIN
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderTracking;
