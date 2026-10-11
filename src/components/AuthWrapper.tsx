'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { ShieldCheck, Lock, AlertCircle, ArrowRight, BrainCircuit, Sparkles, LogOut, CheckCircle2 } from 'lucide-react';

interface AuthContextType {
  user: { email: string; role: string } | null;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  logout: async () => {},
  refreshAuth: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [testEmail, setTestEmail] = useState('dwarikatripathy@gmail.com');

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const handleGoogleSignIn = async (emailToUse: string = 'dwarikatripathy@gmail.com') => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setAuthError(data.error || 'Authentication denied');
      } else {
        setUser(data.user);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  // Google SVG Icon
  const GoogleGIcon = () => (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-slate-400">Verifying APODIX Security Credentials...</span>
        </div>
      </div>
    );
  }

  // If user is not authenticated, display the full-page secure gate
  if (!user) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col items-center justify-center p-4 bg-grid-apodix">
        <div className="max-w-md w-full bg-[#0d121c] border border-[#1e273a] rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
          {/* Header Brand */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-400 to-cyan-500 mx-auto flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-500/20">
              <span className="font-mono font-black text-2xl text-[#07090e]">&Alpha;</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-wider font-mono">APODIX</h1>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                Autonomous First-Principles STEM Engine
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-[#070a10] border border-[#1b253b] rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-[11px] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Restricted Workspace Access</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              This instance is connected to your local LM Studio AI model and private research curricula. Sign in with your authorized Google account to continue.
            </p>
            <div className="pt-2 border-t border-[#141d2d] flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Authorized Account:</span>
              <strong className="text-emerald-300">dwarikatripathy@gmail.com</strong>
            </div>
          </div>

          {authError && (
            <div className="bg-rose-950/60 border border-rose-800 text-rose-300 text-xs p-3.5 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <div className="space-y-4">
            <button
              onClick={() => handleGoogleSignIn('dwarikatripathy@gmail.com')}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold py-3 px-4 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <GoogleGIcon />
              <span className="text-xs sm:text-sm font-semibold">
                {isLoggingIn ? 'Authenticating with Google...' : 'Sign in with Google as dwarikatripathy'}
              </span>
            </button>

            {/* Test Security Access Control */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#1a2336]"></div>
              <span className="flex-shrink mx-3 text-[10px] font-mono text-slate-500 uppercase">Security Test</span>
              <div className="flex-grow border-t border-[#1a2336]"></div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] text-slate-400 block font-mono">Test Access Control Rejection:</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={e => setTestEmail(e.target.value)}
                  placeholder="Enter email to test gate..."
                  className="flex-1 bg-[#070a10] border border-[#1b253b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                <button
                  onClick={() => handleGoogleSignIn(testEmail)}
                  disabled={isLoggingIn}
                  className="px-3 py-2 rounded-xl bg-[#131d2e] hover:bg-[#1a2942] text-xs font-mono text-slate-300 border border-[#21314d] transition-colors"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>

          <div className="text-center pt-1 text-[11px] text-slate-500 font-mono">
            <span>&copy; 2026 APODIX &bull; Auroinfo Research</span>
          </div>
        </div>
      </div>
    );
  }

  // When authenticated, provide context and render application
  return (
    <AuthContext.Provider value={{ user, logout, refreshAuth: checkSession }}>
      {children}
    </AuthContext.Provider>
  );
}
