'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  ChevronRight,
  CheckCircle2,
  Circle,
  Sparkles,
  BookOpen,
  Layers,
  ArrowLeft,
  Atom,
  Flame,
  Activity,
  Award,
  PenTool,
  Code2,
  Sliders,
  HelpCircle,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import MathRenderer from '@/components/MathRenderer';
import MicrofluidicsSimulator from '@/components/InteractiveSimulations/MicrofluidicsSimulator';
import DiffusionSimulator from '@/components/InteractiveSimulations/DiffusionSimulator';
import GenericParametricSim from '@/components/InteractiveSimulations/GenericParametricSim';
import SmartCanvas from '@/components/SmartCanvas';
import StepDerivationWorkspace from '@/components/StepDerivationWorkspace';
import SocraticChat from '@/components/SocraticChat';
import { StudyPath, Module, Milestone, DerivationStep } from '@/lib/types';

export default function CurriculumStudyPage() {
  const params = useParams();
  const router = useRouter();
  const studyPathId = params?.id as string;

  const [studyPath, setStudyPath] = useState<StudyPath | null>(null);
  const [activeMilestoneId, setActiveMilestoneId] = useState<string>('');
  const [workspaceMode, setWorkspaceMode] = useState<'derivation' | 'canvas'>('derivation');
  const [derivationSteps, setDerivationSteps] = useState<DerivationStep[]>([]);
  const [showPrereqModal, setShowPrereqModal] = useState(false);
  const [prereqAnswers, setPrereqAnswers] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!studyPathId) return;
    fetch(`/api/curriculum/${studyPathId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setStudyPath(data);
          // Pick current milestone or first milestone
          if (data.current_milestone_id) {
            setActiveMilestoneId(data.current_milestone_id);
          } else if (data.modules?.[0]?.milestones?.[0]) {
            setActiveMilestoneId(data.modules[0].milestones[0].id);
          }
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [studyPathId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center text-white">
        <Atom className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
        <p className="text-sm font-mono text-slate-400">Loading APODIX Socratic Environment...</p>
      </div>
    );
  }

  if (!studyPath) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center text-white p-6">
        <h2 className="text-xl font-bold mb-2">Curriculum Not Found</h2>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-emerald-600 rounded-lg text-sm"
        >
          Return Home
        </button>
      </div>
    );
  }

  // Find active module and milestone
  let activeModule: Module | undefined;
  let activeMilestone: Milestone | undefined;

  studyPath.modules?.forEach(mod => {
    const found = mod.milestones?.find(ms => ms.id === activeMilestoneId);
    if (found) {
      activeModule = mod;
      activeMilestone = found;
    }
  });

  if (!activeMilestone && studyPath.modules?.[0]?.milestones?.[0]) {
    activeModule = studyPath.modules[0];
    activeMilestone = studyPath.modules[0].milestones[0];
  }

  const handleCompleteMilestone = async () => {
    if (!activeMilestone) return;

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    await fetch('/api/curriculum/milestone/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ milestoneId: activeMilestone.id, masteryScore: 100 })
    });

    // Refresh state
    const res = await fetch(`/api/curriculum/${studyPathId}`);
    const updated = await res.json();
    setStudyPath(updated);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col">
      {/* Top Banner / Breadcrumb */}
      <div className="border-b border-[#1c2438] bg-[#0a0f19] px-4 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Curricula</span>
          </button>
          <span className="text-slate-600">/</span>
          <span className="font-semibold text-white truncate max-w-xs sm:max-w-md">{studyPath.topic}</span>
          <span className="text-slate-600">/</span>
          <span className="text-emerald-400 font-mono truncate">{activeMilestone?.title}</span>
        </div>

        <div className="flex items-center gap-3">
          {studyPath.prerequisites && studyPath.prerequisites.length > 0 && (
            <button
              onClick={() => setShowPrereqModal(true)}
              className="px-2.5 py-1 rounded-lg bg-[#101726] hover:bg-[#18233a] text-slate-300 flex items-center gap-1.5 text-[11px] border border-[#1e2b45] font-mono transition-colors"
            >
              <HelpCircle className="w-3 h-3 text-amber-400" />
              <span>Diagnostic Baseline</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-24 bg-[#101726] h-2 rounded-full overflow-hidden border border-[#1e2b45]">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500"
                style={{ width: `${studyPath.progress_percent}%` }}
              />
            </div>
            <span className="font-mono text-emerald-400 text-[11px] font-bold">
              {studyPath.progress_percent}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Navigation: 5-Tier Syllabus Roadmap */}
        <aside className="lg:col-span-3 border-r border-[#1c2438] bg-[#090d16] overflow-y-auto p-4 space-y-5">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider mb-1 font-bold">
              <Layers className="w-3.5 h-3.5" />
              <span>5-Tier Roadmap</span>
            </div>
            <h2 className="text-sm font-bold text-white leading-tight">{studyPath.topic}</h2>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{studyPath.overview}</p>
          </div>

          <div className="space-y-4">
            {studyPath.modules?.map((mod, mIdx) => (
              <div key={mod.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider px-1">
                  <span>Tier {mod.tier_level}</span>
                  <span className="text-[10px] text-slate-500">{mod.milestones?.length || 0} milestones</span>
                </div>
                <div className="text-xs font-semibold text-slate-200 px-1 mb-1">{mod.title}</div>

                <div className="space-y-1">
                  {mod.milestones?.map((ms, msIdx) => {
                    const isActive = ms.id === activeMilestoneId;
                    return (
                      <button
                        key={ms.id}
                        onClick={() => {
                          setActiveMilestoneId(ms.id);
                          setDerivationSteps([]);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs flex items-start gap-2.5 transition-all ${
                          isActive
                            ? 'bg-emerald-950/40 border border-emerald-500/50 text-white shadow-sm'
                            : 'hover:bg-[#101726] text-slate-400 hover:text-slate-200 border border-transparent'
                        }`}
                      >
                        {ms.is_completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Circle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isActive ? 'text-emerald-400' : 'text-slate-600'}`} />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className={`font-medium truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                            {ms.title}
                          </p>
                          <span className="text-[10px] text-slate-500 block truncate font-mono">
                            {ms.simulation_type && ms.simulation_type !== 'none' ? '⚡ Physics Lab' : '📐 Analytical Proof'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Center Workspace: Milestone Deep Dive & Laboratories */}
        <main className="lg:col-span-5 border-r border-[#1c2438] overflow-y-auto p-5 space-y-6 bg-[#07090e]">
          {activeMilestone && (
            <>
              {/* Milestone Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                    Tier {activeModule?.tier_level} &bull; Milestone {activeMilestone.order_index + 1}
                  </span>
                  {activeMilestone.is_completed && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-mono flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Mastered
                    </span>
                  )}
                </div>

                <h1 className="text-xl font-bold text-white tracking-tight">
                  {activeMilestone.title}
                </h1>
                <p className="text-xs text-slate-300 leading-relaxed bg-[#0d121c] p-3.5 rounded-xl border border-[#1e273a]">
                  {activeMilestone.concept_summary}
                </p>
              </div>

              {/* Socratic Learning Roadmap Stepper */}
              <div className="bg-[#0a0e18] border border-[#1b253b] rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-inner">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] border border-emerald-500/40">1</span>
                  <span className="text-slate-200 font-semibold text-[11px]">1. Physical Axioms</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-[10px] border border-cyan-500/40">2</span>
                  <span className="text-slate-200 font-semibold text-[11px]">2. Live Simulator Lab</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px] border border-amber-500/40">3</span>
                  <span className="text-slate-200 font-semibold text-[11px]">3. Socratic Derivation</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 hidden sm:block" />
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-[10px] border border-purple-500/40">4</span>
                  <span className="text-slate-200 font-semibold text-[11px]">4. AI Proof Verification</span>
                </div>
              </div>

              {/* Governing Equations */}
              {activeMilestone.governing_equations && activeMilestone.governing_equations.length > 0 && (
                <div className="bg-[#0d121c] border border-[#1e273a] rounded-2xl p-4 space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                    <Atom className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Governing Physical Equations & Axioms</span>
                  </h3>

                  <div className="space-y-3">
                    {activeMilestone.governing_equations.map((eq, eIdx) => (
                      <div key={eIdx} className="bg-[#070a10] p-3 rounded-xl border border-[#1a2336] space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-200">{eq.title}</span>
                        </div>
                        <MathRenderer content={`$$${eq.latex}$$`} />
                        <p className="text-[11px] text-slate-400">{eq.description}</p>

                        {eq.variables && eq.variables.length > 0 && (
                          <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-[#121927] text-[10px] font-mono text-slate-400">
                            {eq.variables.map((v, vIdx) => (
                              <div key={vIdx} className="truncate">
                                <strong className="text-emerald-300">${v.symbol}$</strong>: {v.meaning} {v.unit ? `[${v.unit}]` : ''}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Simulation Lab */}
              {activeMilestone.simulation_type === 'microfluidics_flow' && (
                <MicrofluidicsSimulator />
              )}
              {activeMilestone.simulation_type === 'diffusion' && (
                <DiffusionSimulator />
              )}
              {activeMilestone.simulation_type === 'generic_parametric' && (
                <GenericParametricSim title={`${activeMilestone.title} Visualizer`} />
              )}

              {/* Socratic Challenge Card */}
              <div className="bg-gradient-to-br from-[#0c1825] to-[#0d121c] border-2 border-emerald-500/40 rounded-2xl p-5 shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase font-bold tracking-wider">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>The Socratic Challenge (Productive Struggle)</span>
                </div>

                <div className="text-sm font-medium text-slate-100 leading-relaxed">
                  <MathRenderer content={activeMilestone.socratic_challenge} />
                </div>
              </div>

              {/* Dual Workspace Toggle: Step Derivation vs Smart Canvas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-[#090d16] p-1 rounded-xl border border-[#1c2438]">
                    <button
                      onClick={() => setWorkspaceMode('derivation')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                        workspaceMode === 'derivation'
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Line-by-Line Derivation</span>
                    </button>

                    <button
                      onClick={() => setWorkspaceMode('canvas')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                        workspaceMode === 'canvas'
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Smart Stylus Canvas</span>
                    </button>
                  </div>

                  <button
                    onClick={handleCompleteMilestone}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>Mark Milestone Mastered</span>
                  </button>
                </div>

                {workspaceMode === 'derivation' ? (
                  <StepDerivationWorkspace
                    milestoneId={activeMilestone.id}
                    challenge={activeMilestone.socratic_challenge}
                    onStepsUpdated={steps => setDerivationSteps(steps)}
                  />
                ) : (
                  <SmartCanvas
                    milestoneId={activeMilestone.id}
                  />
                )}
              </div>
            </>
          )}
        </main>

        {/* Right Sidebar: 24/7 Socratic AI Tutor Chat */}
        <section className="lg:col-span-4 h-full p-4 bg-[#07090e]">
          {activeMilestone && (
            <SocraticChat
              milestoneId={activeMilestone.id}
              derivationSteps={derivationSteps}
            />
          )}
        </section>
      </div>

      {/* Prerequisite Diagnostic Baseline Modal */}
      {showPrereqModal && studyPath.prerequisites && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d121c] border border-[#1e273a] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1c2438] pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Prerequisite Diagnostic Baseline</h3>
              </div>
              <button
                onClick={() => setShowPrereqModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-[#101726]"
              >
                Close
              </button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {studyPath.prerequisites.map((q, qIdx) => {
                const selected = prereqAnswers[q.id];
                const hasAnswered = selected !== undefined;
                return (
                  <div key={q.id} className="bg-[#070a10] p-4 rounded-xl border border-[#1a2336] space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span>Diagnostic Question {qIdx + 1}</span>
                      <span className="text-emerald-400">{q.conceptTested}</span>
                    </div>

                    <p className="text-xs font-semibold text-white">{q.question}</p>

                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => {
                        let btnStyle = 'bg-[#0d121c] hover:bg-[#141b2a] text-slate-300 border-[#1a2336]';
                        if (hasAnswered) {
                          if (optIdx === q.correctIndex) {
                            btnStyle = 'bg-emerald-950 border-emerald-500 text-emerald-200 font-bold';
                          } else if (selected === optIdx) {
                            btnStyle = 'bg-rose-950 border-rose-600 text-rose-200';
                          }
                        }
                        return (
                          <button
                            key={optIdx}
                            disabled={hasAnswered}
                            onClick={() => setPrereqAnswers({ ...prereqAnswers, [q.id]: optIdx })}
                            className={`w-full text-left p-2.5 rounded-lg text-xs border transition-all ${btnStyle}`}
                          >
                            <span className="font-mono mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {hasAnswered && (
                      <p className="text-[11px] text-slate-400 bg-[#0d121c] p-2.5 rounded border border-[#1a2336] mt-2">
                        <strong>First-Principles Rationale:</strong> {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowPrereqModal(false)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                Proceed to Socratic Studio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
