'use client';

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Sliders,
  Database,
  ArrowLeft,
  Key,
  Globe,
  Settings2,
  Flame,
  BrainCircuit,
  Terminal,
  Activity,
  Shield,
  ShieldCheck,
  Lock,
  LogOut,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { ModelConfig, AIProvider } from '@/lib/types';

export default function AdminPage() {
  // Auth state
  const [session, setSession] = useState<{ email: string; role: string } | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [inputEmail, setInputEmail] = useState('dwarikatripathy@gmail.com');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Model & settings state
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({
    socratic_rigor: 'strict',
    tutor_persona: 'apodix_first_principles'
  });
  const [isTesting, setIsTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // New model form state
  const [newModel, setNewModel] = useState<Partial<ModelConfig>>({
    name: '',
    provider: 'lmstudio',
    model_id: 'qwen/qwen3.6-27b',
    api_key: '',
    base_url: 'http://localhost:1234/v1',
    temperature: 0.6,
    max_tokens: 3000,
    is_active: false
  });

  const checkAuth = async () => {
    setIsCheckingAuth(true);
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setSession(data.user);
        loadData();
      } else {
        setSession(null);
      }
    } catch (e) {
      setSession(null);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const handleGoogleLogin = async (targetEmail: string = inputEmail) => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setAuthError(data.error || 'Authentication denied');
      } else {
        setSession(data.user);
        loadData();
      }
    } catch (err: any) {
      setAuthError(err.message || 'Login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setSession(null);
    setModels([]);
  };

  const loadData = async () => {
    try {
      const [modelsRes, settingsRes] = await Promise.all([
        fetch('/api/admin/models').then(r => r.json()),
        fetch('/api/admin/settings').then(r => r.json())
      ]);

      if (modelsRes.models) setModels(modelsRes.models);
      if (settingsRes.settings) setSettings(settingsRes.settings);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleSetActive = async (id: string) => {
    await fetch('/api/admin/models', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: true })
    });
    loadData();
  };

  const handleDeleteModel = async (id: string) => {
    if (!confirm('Are you sure you want to remove this model configuration?')) return;
    await fetch(`/api/admin/models?id=${id}`, { method: 'DELETE' });
    loadData();
  };

  const handleTestModel = async (model: ModelConfig) => {
    setIsTesting(model.id);
    try {
      const res = await fetch('/api/admin/test-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(model)
      });
      const data = await res.json();
      setTestResults(prev => ({ ...prev, [model.id]: data }));
    } catch (err: any) {
      setTestResults(prev => ({
        ...prev,
        [model.id]: { success: false, latencyMs: 0, message: err.message }
      }));
    } finally {
      setIsTesting(null);
    }
  };

  const handleSaveSettings = async (newSettings: Record<string, string>) => {
    setSettings(newSettings);
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings)
    });
  };

  const handleCreateModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel.name || !newModel.model_id) return;

    setIsSaving(true);
    try {
      await fetch('/api/admin/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newModel)
      });
      setShowAddModal(false);
      setNewModel({
        name: '',
        provider: 'lmstudio',
        model_id: 'qwen/qwen3.6-27b',
        api_key: '',
        base_url: 'http://localhost:1234/v1',
        temperature: 0.6,
        max_tokens: 3000,
        is_active: false
      });
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Google SVG Icon
  const GoogleGIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
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

  // Authentication Loading Screen
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-mono text-slate-400">Verifying Superadmin Credentials...</span>
        </div>
      </div>
    );
  }

  // Google Login Gate if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col items-center justify-center p-4 bg-grid-apodix">
        <div className="max-w-md w-full bg-[#0d121c] border border-[#1e273a] rounded-3xl p-8 space-y-6 shadow-2xl relative">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 mx-auto flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-500/20 mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Superadmin Control Plane</h1>
            <p className="text-xs text-slate-400">
              Restricted Access &bull; Google Authentication Required
            </p>
          </div>

          <div className="bg-[#070a10] border border-[#1b253b] rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-mono font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Authorized Superadmin Account</span>
            </div>
            <p className="text-slate-300 font-mono text-[11px] truncate">
              dwarikatripathy@gmail.com
            </p>
          </div>

          {authError && (
            <div className="bg-rose-950/50 border border-rose-800 text-rose-300 text-xs p-3.5 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => handleGoogleLogin('dwarikatripathy@gmail.com')}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold py-3 px-4 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <GoogleGIcon />
              <span className="text-xs sm:text-sm">
                {isLoggingIn ? 'Authenticating with Google...' : 'Sign in with Google as dwarikatripathy'}
              </span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#1a2336]"></div>
              <span className="flex-shrink mx-3 text-[10px] font-mono text-slate-500 uppercase">Verification Test</span>
              <div className="flex-grow border-t border-[#1a2336]"></div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] text-slate-400 block font-mono">Verify Alternate Email / Access Control:</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={inputEmail}
                  onChange={e => setInputEmail(e.target.value)}
                  placeholder="Enter email to test gate..."
                  className="flex-1 bg-[#070a10] border border-[#1b253b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
                <button
                  onClick={() => handleGoogleLogin(inputEmail)}
                  disabled={isLoggingIn}
                  className="px-3 py-2 rounded-xl bg-[#131d2e] hover:bg-[#1a2942] text-xs font-mono text-slate-300 border border-[#21314d] transition-colors"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 font-mono transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to APODIX Hub</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Navigation & User Info Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1c2438] pb-6">
          <div className="space-y-1">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Curricula</span>
            </Link>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <BrainCircuit className="w-7 h-7 text-emerald-400" />
              <span>APODIX AI Engine & Socratic Admin Console</span>
            </h1>
            <p className="text-xs text-slate-400">
              Superadmin Control Plane &bull; Configure and hot-swap local LM Studio Qwen or cloud models.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Authenticated Admin Badge */}
            <div className="bg-[#0d1424] border border-emerald-500/40 px-3.5 py-1.5 rounded-xl flex items-center gap-2 shadow-inner">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div className="text-left font-mono">
                <span className="text-[10px] text-emerald-400 block font-bold uppercase leading-none">Superadmin</span>
                <span className="text-xs text-slate-200">{session.email}</span>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Model</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-[#121927] hover:bg-rose-950/50 hover:text-rose-400 text-slate-400 border border-[#1e273a] hover:border-rose-800 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Local LM Studio Status Alert */}
        <div className="bg-gradient-to-r from-[#0d1b2a] via-[#091522] to-[#070a10] border border-cyan-500/40 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shrink-0 font-mono font-bold">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">LM Studio Local Integration Active</h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono">
                  Port 1234
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Connected to local server at <code className="text-cyan-400 bg-cyan-950/40 px-1 py-0.5 rounded">http://localhost:1234/v1</code> with <strong className="text-emerald-300">qwen/qwen3.6-27b</strong>. 100% offline, zero API fees.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const qwenModel = models.find(m => m.id === 'lmstudio-qwen-27b');
                if (qwenModel) handleTestModel(qwenModel);
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Ping Qwen 27B</span>
            </button>
          </div>
        </div>

        {/* Global Socratic Pedagogical Controls */}
        <section className="bg-[#0d121c] border border-[#1e273a] rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#1c2438] pb-4">
            <div className="flex items-center gap-2.5">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <div>
                <h2 className="font-bold text-base text-white">Socratic Rigor & Persona Calibration</h2>
                <p className="text-xs text-slate-400">Controls how strictly the AI enforces productive struggle across all topics</p>
              </div>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
              Live in SQLite
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold block">
                Socratic Strictness Level
              </label>
              <select
                value={settings.socratic_rigor || 'strict'}
                onChange={e => handleSaveSettings({ ...settings, socratic_rigor: e.target.value })}
                className="w-full bg-[#070a10] border border-[#1a2336] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="strict">Strict Socratic (Refuses all direct solutions, only gives conceptual nudges)</option>
                <option value="balanced">Balanced Scaffolding (Provides progressive 3-tier hints upon request)</option>
                <option value="guided">Guided Derivations (Walks user step-by-step with sub-questions)</option>
              </select>
              <p className="text-[11px] text-slate-500">
                In &apos;Strict&apos; mode, direct requests for answers or full code are politely declined and redirected to physical conservation laws.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold block">
                Pedagogical Persona
              </label>
              <select
                value={settings.tutor_persona || 'apodix_first_principles'}
                onChange={e => handleSaveSettings({ ...settings, tutor_persona: e.target.value })}
                className="w-full bg-[#070a10] border border-[#1a2336] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="apodix_first_principles">APODIX First-Principles (Analytical, conservation law foundation)</option>
                <option value="patient_prof">Patient Professor (Encouraging, deeply explanatory)</option>
                <option value="socratic_inquisitor">Socratic Inquisitor (Questions every assumption)</option>
              </select>
              <p className="text-[11px] text-slate-500">
                Dictates the tone, rigor, and mathematical depth of guidance in the Studio and derivation workspace.
              </p>
            </div>
          </div>
        </section>

        {/* Model Configurations Matrix */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-emerald-400" />
                <span>Configured AI Models & Providers</span>
              </h2>
              <p className="text-xs text-slate-400">
                One model is actively queried for all Socratic chats and derivation grading. Click &quot;Make Active&quot; to hot swap.
              </p>
            </div>
            <button
              onClick={loadData}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map(m => {
              const test = testResults[m.id];
              return (
                <div
                  key={m.id}
                  className={`bg-[#0d121c] border rounded-2xl p-5 flex flex-col justify-between transition-all relative ${
                    m.is_active
                      ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                      : 'border-[#1e273a] hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#121927] text-slate-300 uppercase font-semibold border border-[#1e273a]">
                            {m.provider}
                          </span>
                          {m.is_active && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-800 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> ACTIVE
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-sm text-white mt-1.5">{m.name}</h3>
                        <p className="text-xs font-mono text-slate-400 truncate">{m.model_id}</p>
                      </div>

                      {models.length > 1 && (
                        <button
                          onClick={() => handleDeleteModel(m.id)}
                          className="text-slate-600 hover:text-rose-400 p-1 transition-colors"
                          title="Delete model"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-[#162032] text-[11px] font-mono text-slate-400">
                      <div className="flex justify-between">
                        <span>Endpoint:</span>
                        <span className="text-slate-300 truncate max-w-[150px]">
                          {m.base_url || 'Default Cloud'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Temperature:</span>
                        <span className="text-slate-300">{m.temperature}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Output Tokens:</span>
                        <span className="text-slate-300">{m.max_tokens}</span>
                      </div>
                    </div>

                    {/* Live Ping Benchmark Result */}
                    {test && (
                      <div className={`p-2.5 rounded-xl border text-[11px] font-mono space-y-1 ${
                        test.success
                          ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                          : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                      }`}>
                        <div className="flex items-center justify-between font-bold">
                          <span>{test.success ? '✓ Operational' : '✗ Failed'}</span>
                          <span>{test.latencyMs}ms</span>
                        </div>
                        {test.responseSnippet && (
                          <p className="text-[10px] text-slate-300 truncate opacity-90">
                            &quot;{test.responseSnippet}&quot;
                          </p>
                        )}
                        {!test.success && test.message && (
                          <p className="text-[10px] text-rose-400">{test.message}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex items-center justify-between gap-2 border-t border-[#162032] mt-4">
                    <button
                      onClick={() => handleTestModel(m)}
                      disabled={isTesting === m.id}
                      className="px-3 py-1.5 rounded-lg bg-[#101726] hover:bg-[#18233a] text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors border border-[#1e2b45] disabled:opacity-50"
                    >
                      <Activity className={`w-3 h-3 ${isTesting === m.id ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
                      <span>{isTesting === m.id ? 'Pinging...' : 'Test Connection'}</span>
                    </button>

                    {!m.is_active ? (
                      <button
                        onClick={() => handleSetActive(m.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 text-xs font-mono font-bold transition-all border border-emerald-500/40"
                      >
                        Make Active
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 font-mono font-semibold">
                        In Use
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Add Model Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0d121c] border border-[#1e273a] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#1c2438] pb-3">
                <h3 className="font-bold text-white text-base">Add New AI Model</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-500 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateModel} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Display Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Local Qwen 3.6 27B"
                    value={newModel.name}
                    onChange={e => setNewModel({ ...newModel, name: e.target.value })}
                    className="w-full bg-[#070a10] border border-[#1a2336] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Provider</label>
                    <select
                      value={newModel.provider}
                      onChange={e => {
                        const p = e.target.value as AIProvider;
                        let defaultUrl = '';
                        if (p === 'deepseek') defaultUrl = 'https://api.deepseek.com/v1';
                        else if (p === 'groq') defaultUrl = 'https://api.groq.com/openai/v1';
                        else if (p === 'lmstudio') defaultUrl = 'http://localhost:1234/v1';
                        else if (p === 'ollama') defaultUrl = 'http://localhost:11434/v1';
                        else if (p === 'openrouter') defaultUrl = 'https://openrouter.ai/api/v1';

                        const autoModelId = p === 'lmstudio' ? 'qwen/qwen3.6-27b' : newModel.model_id;
                        setNewModel({ ...newModel, provider: p, base_url: defaultUrl, model_id: autoModelId });
                      }}
                      className="w-full bg-[#070a10] border border-[#1a2336] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="lmstudio">LM Studio (Local Qwen / Gemma / DeepSeek)</option>
                      <option value="gemini">Google Gemini</option>
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic Claude</option>
                      <option value="deepseek">DeepSeek</option>
                      <option value="groq">Groq</option>
                      <option value="ollama">Ollama (Local)</option>
                      <option value="openrouter">OpenRouter</option>
                      <option value="custom">Custom OpenAI-Compatible</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Model Identifier</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. qwen/qwen3.6-27b or gemini-2.5-flash"
                      value={newModel.model_id}
                      onChange={e => setNewModel({ ...newModel, model_id: e.target.value })}
                      className="w-full bg-[#070a10] border border-[#1a2336] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">API Key</label>
                  <input
                    type="password"
                    placeholder="Paste your API key (leave blank for LM Studio / Ollama)"
                    value={newModel.api_key}
                    onChange={e => setNewModel({ ...newModel, api_key: e.target.value })}
                    className="w-full bg-[#070a10] border border-[#1a2336] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Base URL (API Endpoint)</label>
                  <input
                    type="text"
                    placeholder="http://localhost:1234/v1"
                    value={newModel.base_url}
                    onChange={e => setNewModel({ ...newModel, base_url: e.target.value })}
                    className="w-full bg-[#070a10] border border-[#1a2336] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Temperature</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      value={newModel.temperature}
                      onChange={e => setNewModel({ ...newModel, temperature: parseFloat(e.target.value) })}
                      className="w-full bg-[#070a10] border border-[#1a2336] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 block mb-1">Max Tokens</label>
                    <input
                      type="number"
                      step="500"
                      min="500"
                      max="16000"
                      value={newModel.max_tokens}
                      onChange={e => setNewModel({ ...newModel, max_tokens: parseInt(e.target.value) })}
                      className="w-full bg-[#070a10] border border-[#1a2336] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="is_active_cb"
                    checked={newModel.is_active}
                    onChange={e => setNewModel({ ...newModel, is_active: e.target.checked })}
                    className="rounded bg-[#070a10] border-[#1a2336] text-emerald-500 focus:ring-0"
                  />
                  <label htmlFor="is_active_cb" className="text-xs text-slate-300">
                    Set as active model immediately
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-[#1c2438]">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
                  >
                    {isSaving ? 'Saving...' : 'Save Configuration'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
