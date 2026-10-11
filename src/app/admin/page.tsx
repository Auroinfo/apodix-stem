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
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { ModelConfig, AIProvider } from '@/lib/types';

export default function AdminPage() {
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
    provider: 'gemini',
    model_id: '',
    api_key: '',
    base_url: '',
    temperature: 0.7,
    max_tokens: 3000,
    is_active: false
  });

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
    loadData();
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
        provider: 'gemini',
        model_id: '',
        api_key: '',
        base_url: '',
        temperature: 0.7,
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

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
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
              Configure and hot-swap any LLM provider (Gemini, Claude, GPT-4o, DeepSeek, Groq, Ollama) and tune Socratic parameters.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add AI Model</span>
          </button>
        </div>

        {/* Socratic Rigor & Persona Tuning */}
        <section className="bg-[#0d121c] border border-[#1e273a] rounded-2xl p-6 shadow-2xl space-y-5">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase font-bold tracking-wider">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Socratic Rigor & Pedagogical Scaffolding</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#070a10] p-4 rounded-xl border border-[#1a2336] space-y-2">
              <label className="text-xs font-semibold text-slate-200 block">
                Socratic Anti-Cheat Rigor Level:
              </label>
              <select
                value={settings.socratic_rigor || 'strict'}
                onChange={e => handleSaveSettings({ ...settings, socratic_rigor: e.target.value })}
                className="w-full bg-[#0d121c] border border-[#1f2b45] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="strict">Strict Socratic (Refuses all direct solutions, only gives conceptual nudges)</option>
                <option value="balanced">Balanced Scaffolding (Provides progressive 3-tier hints upon request)</option>
                <option value="guided">Guided Derivations (Walks user step-by-step with sub-questions)</option>
              </select>
              <p className="text-[11px] text-slate-500">
                Governs the anti-cheat behavior when students try to ask for direct answers or code.
              </p>
            </div>

            <div className="bg-[#070a10] p-4 rounded-xl border border-[#1a2336] space-y-2">
              <label className="text-xs font-semibold text-slate-200 block">
                Tutor Persona:
              </label>
              <select
                value={settings.tutor_persona || 'apodix_first_principles'}
                onChange={e => handleSaveSettings({ ...settings, tutor_persona: e.target.value })}
                className="w-full bg-[#0d121c] border border-[#1f2b45] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="apodix_first_principles">Apodix First-Principles (Analytical, conservation law foundation)</option>
                <option value="patient_prof">Patient Professor (Encouraging, deeply explanatory)</option>
                <option value="socratic_inquisitor">Socratic Inquisitor (Questions every assumption)</option>
              </select>
              <p className="text-[11px] text-slate-500">
                Shapes the tone and pedagogical style of the AI mentor.
              </p>
            </div>
          </div>
        </section>

        {/* Model Configurations */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span>Configured AI Models & Providers</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Active model handles all Socratic derivations and curriculum synthesis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {models.map(model => {
              const testResult = testResults[model.id];
              return (
                <div
                  key={model.id}
                  className={`bg-[#0d121c] rounded-2xl p-5 border transition-all space-y-4 relative ${
                    model.is_active
                      ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                      : 'border-[#1e273a] hover:border-[#2d3a54]'
                  }`}
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-white">{model.name}</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#070a10] text-emerald-400 border border-[#1a2336]">
                          {model.provider}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-cyan-300 mt-1">{model.model_id}</p>
                    </div>

                    {model.is_active ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        ACTIVE
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetActive(model.id)}
                        className="px-3 py-1 rounded-full bg-[#101726] hover:bg-[#18233a] text-slate-300 text-xs font-medium border border-[#1e2b45] transition-all cursor-pointer"
                      >
                        Set Active
                      </button>
                    )}
                  </div>

                  {/* Details */}
                  <div className="text-xs font-mono text-slate-400 space-y-1 bg-[#070a10] p-3 rounded-xl border border-[#1a2336]">
                    <div className="truncate">
                      <span className="text-slate-500">Endpoint:</span> {model.base_url || 'Default SDK Endpoint'}
                    </div>
                    <div>
                      <span className="text-slate-500">API Key:</span>{' '}
                      {model.api_key ? '••••••••' + model.api_key.slice(-4) : <span className="text-amber-400">Environment/Local</span>}
                    </div>
                    <div className="flex gap-4">
                      <span><span className="text-slate-500">Temp:</span> {model.temperature}</span>
                      <span><span className="text-slate-500">Max Tokens:</span> {model.max_tokens}</span>
                    </div>
                  </div>

                  {/* Test Connection Result */}
                  {testResult && (
                    <div
                      className={`p-3 rounded-xl text-xs font-mono space-y-1 ${
                        testResult.success
                          ? 'bg-emerald-950/40 border border-emerald-800/60 text-emerald-200'
                          : 'bg-rose-950/40 border border-rose-800/60 text-rose-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>{testResult.success ? '✓ Ping Successful' : '✗ Connection Error'}</span>
                        {testResult.latencyMs > 0 && <span>{testResult.latencyMs}ms</span>}
                      </div>
                      <p className="text-[11px] truncate opacity-90">{testResult.message}</p>
                      {testResult.responseSnippet && (
                        <p className="text-[10px] text-slate-400 italic">"{testResult.responseSnippet}"</p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#1a2336]">
                    <button
                      onClick={() => handleTestModel(model)}
                      disabled={isTesting === model.id}
                      className="px-3 py-1.5 rounded-lg bg-[#101726] hover:bg-[#18233a] text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all border border-[#1e2b45] cursor-pointer"
                    >
                      {isTesting === model.id ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                          <span>Testing Ping...</span>
                        </>
                      ) : (
                        <>
                          <Activity className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Test Connection</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDeleteModel(model.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Remove model"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Database & Architecture Info */}
        <section className="bg-[#0d121c] border border-[#1e273a] rounded-2xl p-6 text-xs text-slate-400 space-y-3">
          <div className="flex items-center gap-2 text-slate-200 font-bold">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Database Architecture</span>
          </div>
          <p>
            Persisting in local high-concurrency <strong>SQLite (WAL mode)</strong> at <code className="text-emerald-300">data/tutor.db</code>. 
            All generated curricula, modules, LaTeX equations, student derivation attempts, and misconceptions are indexed and stored with zero cloud vendor lock-in.
          </p>
        </section>
      </div>

      {/* Add Model Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d121c] border border-[#1e273a] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1c2438] pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Configure New AI Model</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white text-xs">
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateModel} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Friendly Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Local Llama 3.3 or Gemini 2.5 Pro"
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
                      if (p === 'gemini') defaultUrl = 'https://generativelanguage.googleapis.com/v1beta';
                      else if (p === 'openai') defaultUrl = 'https://api.openai.com/v1';
                      else if (p === 'anthropic') defaultUrl = 'https://api.anthropic.com/v1';
                      else if (p === 'deepseek') defaultUrl = 'https://api.deepseek.com/v1';
                      else if (p === 'groq') defaultUrl = 'https://api.groq.com/openai/v1';
                      else if (p === 'lmstudio') defaultUrl = 'http://localhost:1234/v1';
                      else if (p === 'ollama') defaultUrl = 'http://localhost:11434/v1';
                      else if (p === 'openrouter') defaultUrl = 'https://openrouter.ai/api/v1';

                      const autoModelId = p === 'lmstudio' ? 'qwen/qwen3.6-35b-a3b' : newModel.model_id;
                      setNewModel({ ...newModel, provider: p, base_url: defaultUrl, model_id: autoModelId });
                    }}
                    className="w-full bg-[#070a10] border border-[#1a2336] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="gemini">Google Gemini</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic Claude</option>
                    <option value="deepseek">DeepSeek</option>
                    <option value="groq">Groq</option>
                    <option value="lmstudio">LM Studio (Local Qwen / Gemma / DeepSeek)</option>
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
                    placeholder="e.g. qwen/qwen3.6-35b-a3b or gemini-2.5-flash"
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
                  placeholder="https://..."
                  value={newModel.base_url}
                  onChange={e => setNewModel({ ...newModel, base_url: e.target.value })}
                  className="w-full bg-[#070a10] border border-[#1a2336] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="setActive"
                  checked={newModel.is_active}
                  onChange={e => setNewModel({ ...newModel, is_active: e.target.checked })}
                  className="accent-emerald-500 rounded"
                />
                <label htmlFor="setActive" className="text-xs text-slate-300">
                  Set as immediate active AI model
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1c2438]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#101726] hover:bg-[#18233a] text-slate-300 text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  {isSaving ? 'Saving Model...' : 'Save Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
