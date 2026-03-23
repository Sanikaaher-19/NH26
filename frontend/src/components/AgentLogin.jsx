import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowRight } from 'lucide-react';

const AgentLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/login', { username, password });
      if (response.data.success) {
        localStorage.setItem('agent_auth', JSON.stringify(response.data.user));
        navigate('/agent', { replace: true });
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
        <div className="relative px-8 py-12 lg:px-16 lg:py-16 bg-gradient-to-br from-[#2a1b3d] via-[#3a2454] to-[#4a2f6b] text-white flex flex-col justify-between">
          <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
          <div className="relative z-10">
            <div className="text-xs uppercase tracking-[0.35em] text-[#e6d9ff]">PowerDesk</div>
            <h1 className="mt-4 text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
              Agent Operations
            </h1>
            <p className="mt-4 text-[#efe6ff] text-sm lg:text-base max-w-md">
              Manage escalations, track SLAs, and resolve tickets with live analytics.
            </p>
          </div>
          <div className="relative z-10 mt-10 space-y-3 text-[#efe6ff] text-sm">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-2 w-2 rounded-full bg-[#f7b733]" />
              Real-time queue updates and alerts
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-2 w-2 rounded-full bg-[#4cd964]" />
              Smart routing by category and severity
            </div>
          </div>
        </div>

        {/* Right: Auth */}
        <div className="px-8 py-12 lg:px-16 lg:py-16 bg-[#f2f5f8] flex flex-col justify-center">
          <div className="max-w-md w-full">
            <div>
              <h2 className="text-2xl font-semibold text-[#2a1b3d]">Sign in</h2>
              <p className="text-sm text-[#6b5a80] mt-1">Use your agent credentials.</p>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 mt-6">
              <div>
                <label className="block text-xs font-semibold text-[#6b5a80] mb-1">Username</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b39ad6]" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full border border-[#e0d4f0] rounded-lg pl-9 pr-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2a1b3d]/10 focus:border-[#2a1b3d]"
                    placeholder="Agent name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#6b5a80] mb-1">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b39ad6]" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full border border-[#e0d4f0] rounded-lg pl-9 pr-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#2a1b3d]/10 focus:border-[#2a1b3d]"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-[#2a1b3d] text-white text-sm font-semibold hover:bg-[#3a2454] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? 'Signing in...' : 'Sign In'}
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#e0d4f0] flex items-center justify-between text-xs text-[#6b5a80]">
              <span>User access?</span>
              <button
                onClick={() => navigate('/')}
                className="font-semibold text-[#2a1b3d] hover:text-[#3a2454]"
              >
                Go to User Portal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentLogin;
