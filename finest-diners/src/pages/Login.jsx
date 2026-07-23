import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header block */}
        <div className="border-b border-neutral-800 pb-6 mb-6">
          <p className="section-label mb-3">ACCESS PORTAL</p>
          <h1 className="hero-title text-3xl sm:text-4xl font-black tracking-tight">SIGN IN</h1>
          <p className="text-neutral-500 text-sm font-mono mt-2">
            Welcome back to Finest Diners.
          </p>
        </div>

        {error && (
          <div className="border border-red-800 bg-red-950 text-red-400 text-xs font-mono px-4 py-3 mb-5">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="border border-neutral-800 p-6 sm:p-8 space-y-5"
          style={{ background: '#131313' }}
        >
          <div>
            <label className="section-label block mb-2">EMAIL</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full bg-neutral-900 border border-neutral-700 text-white text-sm font-mono px-4 py-3 focus:outline-none focus:border-lime-400 transition-colors placeholder-neutral-600"
            />
          </div>

          <div>
            <label className="section-label block mb-2">PASSWORD</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full bg-neutral-900 border border-neutral-700 text-white text-sm font-mono px-4 py-3 focus:outline-none focus:border-lime-400 transition-colors placeholder-neutral-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
          </button>
        </form>

        <p className="text-neutral-600 text-xs font-mono text-center mt-5">
          NO ACCOUNT?{' '}
          <Link to="/register" className="text-lime-400 hover:underline tracking-widest">
            REGISTER
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
