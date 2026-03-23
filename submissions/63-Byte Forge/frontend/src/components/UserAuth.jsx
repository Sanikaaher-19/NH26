import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, ArrowRight } from 'lucide-react';

const UserAuth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin ? { username, password } : { username, email, password };

      const res = await axios.post(`http://localhost:5000${endpoint}`, payload);

      if (res.data.success) {
        if (isLogin) {
          onLogin(res.data.user);
        } else {
          setIsLogin(true);
          setPassword('');
          setInfo('Account created. Please sign in.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f2f5f8]">
      <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
        {/* Left: Brand */}
        <div className="relative px-8 py-12 lg:px-16 lg:py-16 bg-gradient-to-br from-[#0b2a3a] via-[#0f3b4f] to-[#14506a] text-white flex flex-col justify-between">
          <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
          <div className="relative z-10">
            <div className="text-xs uppercase tracking-[0.35em] text-[#cfe6f1]">PowerDesk</div>
            <h1 className="mt-4 text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
              Complaint Resolution
            </h1>
            <p className="mt-4 text-[#d7eef8] text-sm lg:text-base max-w-md">
              A fast, reliable support portal that turns messages into actionable tickets with real-time updates.
            </p>
          </div>
          <div className="relative z-10 mt-10 space-y-3 text-[#d7eef8] text-sm">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-2 w-2 rounded-full bg-[#f7b733]" />
              Live ticket routing and SLA tracking
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-2 w-2 rounded-full bg-[#4cd964]" />
              Agents notified instantly on escalation
            </div>
          </div>
        </div>

        {/* Right: Auth */}
        <div className="px-8 py-12 lg:px-16 lg:py-16 bg-[#f2f5f8] flex flex-col justify-center">
          <div className="max-w-md w-full">
            <div>
              <h2 className="text-2xl font-semibold text-[#0b2a3a]">
                {isLogin ? 'Sign in' : 'Create account'}
              </h2>
              <p className="text-sm text-[#567386] mt-1">
                {isLogin ? 'Welcome back. Please sign in.' : 'Create your account to start a chat.'}
              </p>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                className={`flex-1 py-2 text-sm font-semibold rounded-lg border ${isLogin ? 'bg-[#0b2a3a] text-white border-[#0b2a3a]' : 'bg-white text-[#567386] border-[#d7e3ea]'}`}
                onClick={() => setIsLogin(true)}
              >
                Sign In
              </button>
              <button
                className={`flex-1 py-2 text-sm font-semibold rounded-lg border ${!isLogin ? 'bg-[#0b2a3a] text-white border-[#0b2a3a]' : 'bg-white text-[#567386] border-[#d7e3ea]'}`}
                onClick={() => setIsLogin(false)}
              >
                Sign Up
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}
            {info && (
              <div className="mt-4 p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm">
                {info}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div>
                <label className="block text-xs font-semibold text-[#567386] mb-1">Username</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9bb1bf]" />
                  <input
                    type="text"
                    className="w-full border border-[#d7e3ea] rounded-lg pl-9 pr-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0b2a3a]/10 focus:border-[#0b2a3a]"
                    placeholder="Your name"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-xs font-semibold text-[#567386] mb-1">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9bb1bf]" />
                    <input
                      type="email"
                      className="w-full border border-[#d7e3ea] rounded-lg pl-9 pr-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0b2a3a]/10 focus:border-[#0b2a3a]"
                      placeholder="name@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#567386] mb-1">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9bb1bf]" />
                  <input
                    type="password"
                    className="w-full border border-[#d7e3ea] rounded-lg pl-9 pr-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0b2a3a]/10 focus:border-[#0b2a3a]"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-[#0b2a3a] text-white text-sm font-semibold hover:bg-[#0f3b4f] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#d7e3ea] flex items-center justify-between text-xs text-[#567386]">
              <span>Agent access?</span>
              <button
                onClick={() => navigate('/agent/login')}
                className="font-semibold text-[#0b2a3a] hover:text-[#0f3b4f]"
              >
                Go to Agent Portal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAuth;
