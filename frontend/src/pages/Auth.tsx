import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { User, Mail, Lock, Shield, Sparkles, LogIn, ArrowRight } from 'lucide-react';

export const Auth: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? 'login' : 'register';
    const body = isLogin ? { email, password } : { email, password, name };

    fetch(`http://localhost:5000/api/auth/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.error) {
          setError(data.error);
        } else if (data.token && data.user) {
          login(data.token, data.user);
          // Redirect: if admin goes to admin dashboard, else shop/home
          if (data.user.role === 'ADMIN') {
            navigate('/admin');
          } else {
            navigate('/shop');
          }
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Connection error. Please ensure the backend is running.');
        setLoading(false);
      });
  };

  const fillCredentials = (role: 'admin' | 'customer') => {
    setError('');
    setIsLogin(true);
    if (role === 'admin') {
      setEmail('admin@freshbasket.com');
      setPassword('admin123');
    } else {
      setEmail('customer@gmail.com');
      setPassword('customer123');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-8 mt-8">
      {/* Visual top */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          {isLogin ? 'Sign In' : 'Create Profile'}
        </h1>
        <p className="text-gray-400 text-sm">
          Access nutrition tracking, farmer story maps, and subscription management.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs text-left">
          ⚠️ {error}
        </div>
      )}

      {/* Main card */}
      <div className="glass border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6">
        {/* Toggle */}
        <div className="grid grid-cols-2 bg-[#0b0f19] border border-gray-850 p-1 rounded-xl">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              isLogin ? 'bg-emerald-500 text-[#0b0f19] shadow' : 'text-gray-400 hover:text-gray-250'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              !isLogin ? 'bg-emerald-500 text-[#0b0f19] shadow' : 'text-gray-400 hover:text-gray-250'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase">Your Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0b0f19] border border-gray-850 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-300 focus:outline-none focus:border-emerald-500"
                />
                <User className="w-4.5 h-4.5 text-gray-500 absolute left-3 top-3.5" />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-400 uppercase">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="customer@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0b0f19] border border-gray-850 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-300 focus:outline-none focus:border-emerald-500"
              />
              <Mail className="w-4.5 h-4.5 text-gray-500 absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-400 uppercase">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0b0f19] border border-gray-850 rounded-xl py-3 pl-10 pr-4 text-sm text-gray-300 focus:outline-none focus:border-emerald-500"
              />
              <Lock className="w-4.5 h-4.5 text-gray-500 absolute left-3 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-[#0b0f19] font-bold py-3 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1 text-sm shadow-md"
          >
            {loading ? (
              'Processing...'
            ) : (
              <>
                <LogIn className="w-4 h-4" /> {isLogin ? 'Sign In to Account' : 'Register Profile'}
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts Panel */}
        <div className="p-4 rounded-xl border border-gray-850 bg-[#0b0f19] text-left space-y-3">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1 text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" /> Quick Sign In Demo Accounts
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => fillCredentials('customer')}
              className="flex-1 bg-gray-900 hover:bg-gray-850 text-gray-350 text-[10px] py-2 px-2.5 rounded-lg border border-gray-850 font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              Customer Profile <ArrowRight className="w-3 h-3 text-emerald-400" />
            </button>
            <button
              onClick={() => fillCredentials('admin')}
              className="flex-1 bg-gray-900 hover:bg-gray-850 text-gray-350 text-[10px] py-2 px-2.5 rounded-lg border border-gray-850 font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              Admin Controls <Shield className="w-3 h-3 text-emerald-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Auth;
