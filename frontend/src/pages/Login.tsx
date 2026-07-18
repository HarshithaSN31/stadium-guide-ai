import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, UserPlus, ShieldAlert, Sparkles } from 'lucide-react';

export const Login = () => {
  const { login, register, googleLogin, guestLogin } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password || (isRegister && !name)) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    let result;
    if (isRegister) {
      result = await register(name, email, password);
    } else {
      result = await login(email, password);
    }
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    const result = await googleLogin();
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setLoading(true);
    const result = await guestLogin();
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden flex items-center justify-center p-4">
      {/* Stadium ambient backgrounds */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-stadium-lights pointer-events-none z-0"></div>
      <div className="absolute inset-0 goal-net-overlay pointer-events-none opacity-20 z-0"></div>
      <div className="absolute bottom-0 left-0 right-0 h-[200px] bg-pitch-green pointer-events-none z-0"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-fifa-border z-10 shadow-glass relative">
        {/* Brand Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-fifa-blue text-2xl font-black italic text-white mb-3 shadow-blue-glow">
            F
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-fifa-blue-light bg-clip-text text-transparent uppercase">
            Stadium Guide AI
          </h1>
          <p className="text-[10px] text-fifa-neon font-bold tracking-widest uppercase mt-1">
            FIFA World Cup 2026 • Matchday Assistant
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
            <ShieldAlert size={16} className="text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5 ml-1">Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full glass-input"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5 ml-1">Email Address</label>
            <input
              type="email"
              placeholder="fan@fifa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full glass-input"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1.5 ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full glass-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-fifa-blue hover:bg-fifa-blue/90 border border-fifa-blue-light/50 text-white font-bold rounded-xl py-3 text-xs transition-all flex items-center justify-center gap-2 active:scale-98 shadow-blue-glow disabled:opacity-50"
          >
            {isRegister ? <UserPlus size={16} /> : <LogIn size={16} />}
            <span>{loading ? 'Authenticating...' : isRegister ? 'Create Fan Account' : 'Sign In'}</span>
          </button>
        </form>

        {/* Separator */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-fifa-border"></div>
          </div>
          <span className="relative px-3 bg-[#0a1120] text-[10px] text-slate-400 font-bold uppercase tracking-wider">or</span>
        </div>

        {/* Alternatives */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-fifa-border bg-slate-950/80 hover:bg-slate-900 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Google</span>
          </button>

          <button
            onClick={handleGuestLogin}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-fifa-border bg-slate-950/80 hover:bg-slate-900 text-xs font-semibold text-fifa-neon transition-colors disabled:opacity-50"
          >
            <Sparkles size={14} />
            <span>Guest Mode</span>
          </button>
        </div>

        {/* Toggle Account Type */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
          >
            {isRegister ? 'Already have an account? Sign In' : "New to Stadium Guide? Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
