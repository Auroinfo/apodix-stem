'use client';

import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Sigma,
  BookOpen,
  CornerDownLeft,
  ChevronDown
} from 'lucide-react';
import MathRenderer from './MathRenderer';
import { DerivationStep } from '@/lib/types';

interface StepDerivationWorkspaceProps {
  milestoneId: string;
  challenge: string;
  onStepsUpdated?: (steps: DerivationStep[]) => void;
}

export default function StepDerivationWorkspace({
  milestoneId,
  challenge,
  onStepsUpdated
}: StepDerivationWorkspaceProps) {
  const [steps, setSteps] = useState<DerivationStep[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSymbolBar, setShowSymbolBar] = useState(true);

  // Quick Math Snippets for instant user-friendly input
  const quickSymbols = [
    { label: 'd/dy', insert: '\\frac{d}{dy}' },
    { label: '∂/∂y', insert: '\\frac{\\partial}{\\partial y}' },
    { label: 'd²u/dy²', insert: '\\frac{d^2 u}{dy^2}' },
    { label: '∫ dx', insert: '\\int ' },
    { label: 'dP/dx', insert: '\\frac{dP}{dx}' },
    { label: '∇', insert: '\\nabla' },
    { label: 'ΔP', insert: '\\Delta P' },
    { label: 'μ', insert: '\\mu' },
    { label: 'ρ', insert: '\\rho' },
    { label: 'γ', insert: '\\gamma' },
    { label: 'Re ≪ 1', insert: 'Re \\ll 1' },
    { label: 'u(wall) = 0', insert: 'u(\\pm h) = 0' },
    { label: 'du/dy = 0', insert: '\\left. \\frac{du}{dy} \\right|_{y=0} = 0' },
    { label: '⟹', insert: '\\implies ' },
    { label: '≈', insert: '\\approx ' },
  ];

  const handleInsertSymbol = (snippet: string) => {
    setCurrentInput(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + snippet + ' ');
  };

  const handleVerifyStep = async () => {
    if (!currentInput.trim() || isVerifying) return;

    setIsVerifying(true);
    try {
      const res = await fetch('/api/tutor/evaluate-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId,
          step: currentInput.trim(),
          previousSteps: steps
        })
      });

      const data = await res.json();
      if (data.evaluatedStep) {
        const newSteps = [...steps, data.evaluatedStep];
        setSteps(newSteps);
        setCurrentInput('');
        if (onStepsUpdated) onStepsUpdated(newSteps);
      }
    } catch (err) {
      console.error('Failed to verify step:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-[#0d121c] border border-[#1e273a] rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1c2438] pb-3">
        <div>
          <h3 className="font-bold text-white tracking-wide flex items-center gap-2 text-sm">
            <span>First-Principles Derivation Lab</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
              Interactive Scaffolding
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Derive line-by-line. The APODIX engine checks boundary conditions, dimensional consistency, and mathematical validity.
          </p>
        </div>

        <button
          onClick={() => setShowSymbolBar(!showSymbolBar)}
          className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono transition-colors"
        >
          <Sigma className="w-3.5 h-3.5" />
          <span>{showSymbolBar ? 'Hide Math Palette' : 'Show Math Palette'}</span>
        </button>
      </div>

      {/* Render Prior Validated Steps */}
      <div className="space-y-3">
        {steps.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-[#1e273a] text-center space-y-2 bg-[#080b11]">
            <p className="text-xs text-slate-400">
              No derivation steps registered yet.
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Tip: Start by stating the governing differential equation or physical force balance below.
            </p>
          </div>
        ) : (
          steps.map((st, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all ${
                st.status === 'valid'
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-100'
                  : st.status === 'warning'
                  ? 'bg-amber-950/20 border-amber-500/30 text-amber-100'
                  : 'bg-rose-950/20 border-rose-500/30 text-rose-100'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#131b2c] text-[11px] font-mono flex items-center justify-center text-slate-300 border border-[#22304d]">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-mono font-bold tracking-wide">
                    {st.status === 'valid' ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Apodix Verified
                      </span>
                    ) : st.status === 'warning' ? (
                      <span className="text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Caution / Incomplete Premise
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Physical or Mathematical Inconsistency
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Math Display */}
              <div className="mt-2 text-sm text-white font-mono bg-[#070a10] p-3 rounded-lg border border-[#1a2233]">
                <MathRenderer content={st.math_or_text} />
              </div>

              {/* Feedback and Socratic Nudge */}
              <div className="mt-2.5 text-xs text-slate-300 space-y-1.5">
                <p><strong className="text-slate-400">Diagnosis:</strong> {st.feedback}</p>
                {st.nudge_hint && (
                  <div className="text-amber-300 font-medium bg-amber-950/40 p-2.5 rounded-lg border border-amber-800/40 mt-1 flex items-start gap-2">
                    <span className="text-amber-400 text-sm">💡</span>
                    <span><strong>Socratic Guidance:</strong> {st.nudge_hint}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Math Palette Toolbar */}
      {showSymbolBar && (
        <div className="p-2.5 bg-[#080c14] border border-[#1a2336] rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Quick Formula & Symbol Insert (Click to add):</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {quickSymbols.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleInsertSymbol(item.insert)}
                className="px-2 py-1 rounded bg-[#101726] hover:bg-[#18233a] text-slate-300 hover:text-emerald-300 text-[11px] font-mono border border-[#1f2b45] transition-colors"
                title={`Insert ${item.insert}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Next Step */}
      <div className="bg-[#080c14] p-4 rounded-xl border border-[#1a2336] space-y-3">
        <label className="text-xs font-semibold text-slate-200 block flex items-center justify-between">
          <span>Enter Next Step / Mathematical Proof:</span>
          <span className="text-[10px] font-mono text-slate-500">Cmd + Enter to verify</span>
        </label>

        <textarea
          rows={3}
          value={currentInput}
          onChange={e => setCurrentInput(e.target.value)}
          placeholder="e.g. \mu \frac{d^2 u}{dy^2} = \frac{dP}{dx} with no-slip boundary u(\pm h) = 0..."
          className="w-full bg-[#0a0f19] border border-[#1f2b45] rounded-xl p-3 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500 leading-relaxed"
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleVerifyStep();
            }
          }}
        />

        {/* Live LaTeX Preview */}
        {currentInput && (currentInput.includes('$') || currentInput.includes('\\') || currentInput.includes('=')) && (
          <div className="bg-[#05080e] p-3 rounded-lg border border-[#182338] text-xs">
            <span className="text-[10px] text-slate-500 block uppercase font-mono mb-1">Live LaTeX Render Preview:</span>
            <MathRenderer content={currentInput} />
          </div>
        )}

        <div className="flex items-center justify-end pt-1">
          <button
            onClick={handleVerifyStep}
            disabled={!currentInput.trim() || isVerifying}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-40 transition-all cursor-pointer"
          >
            {isVerifying ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Validating with Socratic Engine...</span>
              </>
            ) : (
              <>
                <span>Verify Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
