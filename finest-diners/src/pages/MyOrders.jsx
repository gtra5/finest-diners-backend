import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const RESTAURANT_ID = import.meta.env.VITE_RESTAURANT_ID;

const STATUS_COLOR = {
  pending:          { text: 'text-yellow-400',  border: 'border-yellow-800',  bg: 'bg-yellow-950' },
  confirmed:        { text: 'text-blue-400',    border: 'border-blue-800',    bg: 'bg-blue-950'   },
  preparing:        { text: 'text-orange-400',  border: 'border-orange-800',  bg: 'bg-orange-950' },
  out_for_delivery: { text: 'text-purple-400',  border: 'border-purple-800',  bg: 'bg-purple-950' },
  delivered:        { text: 'text-lime-400',    border: 'border-lime-800',    bg: 'bg-lime-950'   },
  cancelled:        { text: 'text-red-400',     border: 'border-red-800',     bg: 'bg-red-950'    },
};

const STATUS_LABEL = {
  pending:          'PENDING',
  confirmed:        'CONFIRMED',
  preparing:        'PREPARING',
  out_for_delivery: 'OUT FOR DELIVERY',
  delivered:        'DELIVERED',
  cancelled:        'CANCELLED',
};

const STATUS_ICON = {
  pending:          '📋',
  confirmed:        '✅',
  preparing:        '👨‍🍳',
  out_for_delivery: '🛵',
  delivered:        '🎉',
  cancelled:        '✕',
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/orders/my')
      .then(({ data }) => setOrders(data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load orders.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
        <p className="section-label">LOADING ORDERS...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-red-400 text-sm font-mono text-center">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">RETRY</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white w-full max-w-screen-xl mx-auto">

      {/* ── PAGE HEADER ── */}
      <section className="px-4 sm:px-6 lg:px-8 pt-10 pb-6 border-b border-neutral-800">
        <p className="section-label mb-2">ACCOUNT</p>
        <h1 className="hero-title text-3xl sm:text-4xl font-black tracking-tight">MY ORDERS</h1>
        <p className="text-neutral-600 text-xs font-mono mt-2">
          {orders.length} ORDER{orders.length !== 1 ? 'S' : ''} IN YOUR HISTORY
        </p>
      </section>

      {/* ── EMPTY STATE ── */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-5 py-28 px-6">
          <span className="text-5xl">🛵</span>
          <p className="section-label text-neutral-600">NO ORDERS YET</p>
          <p className="text-neutral-500 text-sm font-mono text-center max-w-sm">
            You haven't placed any orders. Browse the menu and place your first one.
          </p>
          <Link to={`/menu/${RESTAURANT_ID}`} className="btn-primary">BROWSE MENU</Link>
        </div>
      ) : (
        <section className="px-4 sm:px-6 lg:px-8 py-8 space-y-3">
          {orders.map((order) => {
            const s = STATUS_COLOR[order.status] || STATUS_COLOR.pending;
            const activeStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery'];
            const isActive = activeStatuses.includes(order.status);

            return (
              <div
                key={order._id}
                className="border border-neutral-800 transition-colors hover:border-neutral-700"
                style={{ background: '#131313' }}
              >
                {/* Top bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-neutral-800">
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest px-2 py-1 border ${s.text} ${s.border} ${s.bg}`}
                    >
                      <span>{STATUS_ICON[order.status]}</span>
                      {STATUS_LABEL[order.status]}
                    </span>
                    {order.restaurant && (
                      <span className="text-neutral-500 text-xs font-mono">
                        {order.restaurant.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-neutral-600 text-[10px] font-mono">
                      {formatDate(order.createdAt)}
                    </span>
                    <span className="font-mono text-white text-sm font-bold">
                      ${order.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items list */}
                <div className="px-5 py-4 flex flex-wrap gap-x-4 gap-y-1">
                  {order.items.map((item, i) => (
                    <span key={i} className="text-neutral-400 text-xs font-mono">
                      {item.name} × {item.quantity}
                      {i < order.items.length - 1 && <span className="text-neutral-700 ml-4">·</span>}
                    </span>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-neutral-700 text-[10px] font-mono tracking-wider truncate max-w-xs">
                    ID: {order._id}
                  </span>
                  <div className="flex gap-2">
                    {isActive && (
                      <Link
                        to={`/orders/${order._id}`}
                        className="btn-primary text-[10px] py-1.5 px-3"
                      >
                        TRACK LIVE →
                      </Link>
                    )}
                    {!isActive && (
                      <Link
                        to={`/orders/${order._id}`}
                        className="btn-outline text-[10px] py-1.5 px-3"
                      >
                        VIEW DETAILS
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

    </div>
  );
}
