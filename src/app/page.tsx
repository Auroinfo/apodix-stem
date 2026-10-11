'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  BookOpen,
  Atom,
  Droplets,
  Cpu,
  Brain,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  Activity,
  Trash2,
  Sigma,
  GraduationCap,
  HelpCircle,
  Flame
} from 'lucide-react';
import { StudyPath } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('Undergraduate to Advanced Researcher');
  const [isGenerating, setIsGenerating] = useState(false);
  const [studyPaths, setStudyPaths] = useState<any[]>([]);
  const [isLoadingPaths, setIsLoadingPaths] = useState(true);

  const loadStudyPaths = async () => {
    try {
      const res = await fetch('/api/curriculum/list');
      const data = await res.json();
      if (data.studyPaths) {
        setStudyPaths(data.studyPaths);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingPaths(false);
    }
  };

  useEffect(() => {
    loadStudyPaths();
  }, []);

  const handleGenerate = async (targetTopic?: string) => {
    const topicToUse = targetTopic || topic;
    if (!topicToUse.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/curriculum/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicToUse.trim(),
          targetAudience: audience
        })
      });

      const data = await res.json();
      if (data.studyPathId) {
        router.push(`/curriculum/${data.studyPathId}`);
      }
    } catch (err) {
      console.error('Failed to generate curriculum:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeletePath = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Remove this study path?')) return;
    await fetch(`/api/curriculum/${id}`, { method: 'DELETE' });
    loadStudyPaths();
  };

  const featuredTopics = [
    {
      title: 'Microfluidics',
      domain: 'Hydrodynamics & Transport',
      desc: 'Stokes flow, Young-Laplace capillary pressure, Taylor dispersion, and Lab-on-a-Chip droplet devices.',
      icon: Droplets,
      gradient: 'from-emerald-400 to-teal-500'
    },
    {
      title: 'Quantum Field Theory',
      domain: 'Theoretical Physics',
      desc: 'Canonical quantization, Klein-Gordon field, Feynman propagators, and gauge invariance.',
      icon: Atom,
      gradient: 'from-cyan-400 to-blue-500'
    },
    {
      title: 'CRISPR & Synthetic Circuits',
      domain: 'Quantitative Bioengineering',
      desc: 'Cas9 cleavage energetics, guide RNA thermodynamics, and genetic toggle switches.',
      icon: Brain,
      gradient: 'from-teal-400 to-emerald-600'
    },
    {
      title: 'Hypersonic Aerodynamics',
      domain: 'Fluid Mechanics & Aerospace',
      desc: 'Oblique shock relations, Prandtl-Meyer expansions, and boundary layer heat transfer.',
      icon: Zap,
      gradient: 'from-amber-400 to-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col bg-grid-apodix">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-[#1c2438] bg-gradient-to-b from-[#0a101b] via-[#07090e] to-[#07090e]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Autonomous First-Principles STEM Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Derive Any Science from{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              First Principles
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400 leading-relaxed">
            Conventional chatbots spoon-feed solutions, resulting in cognitive offloading. <strong>APODIX</strong> (from Aristotle&apos;s <em>apodeixis</em>, demonstrative proof) architects a 5-tier university curriculum for any domain—from Microfluidics to Quantum Field Theory—and enforces <strong>productive struggle</strong> through step-by-step derivation verification, live physics laboratories, and Socratic guidance.
          </p>

          {/* Generator Input Console */}
          <div className="max-w-2xl mx-auto bg-[#0d121c]/95 border border-[#1e273a] p-2.5 sm:p-3 rounded-2xl shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                placeholder="Enter any domain (e.g. Microfluidics, Quantum Computing)..."
                disabled={isGenerating}
                className="w-full bg-[#070a10] border border-[#1a2336] rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
              />

              <button
                onClick={() => handleGenerate()}
                disabled={!topic.trim() || isGenerating}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 whitespace-nowrap transition-all disabled:opacity-50 flex-shrink-0 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Synthesizing Syllabus...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Curriculum</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between px-3 pt-2 text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                Line-by-Line APODIX Grader
              </span>
              <span className="text-cyan-400">5-Tier Socratic Milestones</span>
            </div>
          </div>
        </div>
      </section>

      {/* How APODIX Teaches & Guarantees Mastery */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-b from-[#0e1524] to-[#0a0e18] border border-[#1d293f] rounded-3xl p-6 sm:p-8 space-y-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#1b253b] pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase font-bold tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Active Pedagogical Blueprint</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                How APODIX Guarantees Permanent STEM Mastery
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Standard chatbots give you instant answers—creating the illusion of competence while leaving you unable to solve real-world problems. APODIX replaces spoonfeeding with the 4-phase cognitive loop of elite university researchers:
              </p>
            </div>
            <Link
              href="/curriculum/sp-microfluidics-master"
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 font-mono transition-all self-start sm:self-auto shrink-0"
            >
              <span>Test Live in Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#070a12] p-5 rounded-2xl border border-[#182338] space-y-3 relative group hover:border-emerald-500/50 transition-all">
              <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800">
                STAGE 1
              </span>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>Diagnostic Baseline</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Before tackling complex topics, APODIX diagnoses your foundational intuition (e.g. Knudsen limits, Navier-Stokes momentum balances) so you never hit a wall.
              </p>
            </div>

            <div className="bg-[#070a12] p-5 rounded-2xl border border-[#182338] space-y-3 relative group hover:border-cyan-500/50 transition-all">
              <span className="text-[10px] font-mono text-cyan-400 font-bold px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800">
                STAGE 2
              </span>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>In-Browser Physics Labs</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Feel the physical parameters before calculating. Adjust dynamic viscosity, Reynolds numbers, and pressure gradients in live simulators to visualize creeping flow streamlines.
              </p>
            </div>

            <div className="bg-[#070a12] p-5 rounded-2xl border border-[#182338] space-y-3 relative group hover:border-amber-500/50 transition-all">
              <span className="text-[10px] font-mono text-amber-400 font-bold px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-800">
                STAGE 3
              </span>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Sigma className="w-4 h-4 text-amber-400" />
                <span>Line-by-Line Derivations</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Write proofs step-by-step with a 1-click math palette. The grader validates boundary conditions and mathematical consistency, pinpointing where your assumptions failed.
              </p>
            </div>

            <div className="bg-[#070a12] p-5 rounded-2xl border border-[#182338] space-y-3 relative group hover:border-rose-500/50 transition-all">
              <span className="text-[10px] font-mono text-rose-400 font-bold px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-800">
                STAGE 4
              </span>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-400" />
                <span>Anti-Cheat Socratic Mentor</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                If you ask "what is the answer?", APODIX strictly refuses to dump solutions. Instead, it offers precise physical counter-questions to guide you into discovering the truth yourself.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* High-Yield Domain Launchers */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Explore High-Yield Curricula</span>
            </h2>
            <p className="text-xs text-slate-400">Select a frontier field to launch its Socratic laboratory</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredTopics.map((f, idx) => {
            const Icon = f.icon;
            return (
              <button
                key={idx}
                onClick={() => handleGenerate(f.title)}
                disabled={isGenerating}
                className="text-left bg-[#0d121c] border border-[#1e273a] hover:border-emerald-500/50 p-5 rounded-2xl transition-all hover:scale-[1.02] group shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${f.gradient} flex items-center justify-center text-slate-950 shadow-md font-bold`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold block">{f.domain}</span>
                    <h3 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors mt-0.5">
                      {f.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {f.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1a2336] flex items-center justify-between text-xs text-emerald-400 font-medium font-mono">
                  <span>Enter Studio</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Active Curricula in SQLite Database */}
      {studyPaths.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Your Active Curricula ({studyPaths.length})</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studyPaths.map(p => (
              <div
                key={p.id}
                onClick={() => router.push(`/curriculum/${p.id}`)}
                className="bg-[#0d121c] border border-[#1e273a] hover:border-emerald-500/60 p-5 rounded-2xl cursor-pointer transition-all hover:shadow-xl group space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-white group-hover:text-emerald-300 transition-colors">
                      {p.topic}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{p.overview}</p>
                  </div>

                  <button
                    onClick={e => handleDeletePath(e, p.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Remove path"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Mastery Progress: {p.progress_percent || 0}%</span>
                    <span>{p.milestone_count || 0} Milestones</span>
                  </div>
                  <div className="w-full bg-[#070a10] h-2 rounded-full overflow-hidden border border-[#1a2336]">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500"
                      style={{ width: `${p.progress_percent || 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-emerald-400 font-medium pt-2 font-mono">
                  <span>Resume Learning Studio</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* The APODIX Difference Comparison */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-extrabold text-white">
            Why First-Principles Derivation Trumps Direct Answer Chatbots
          </h2>
          <p className="text-xs text-slate-400">
            Cognitive scaffolding transforms information passive consumption into permanent physical intuition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0b0e17] border border-[#1a2336] p-6 rounded-2xl space-y-4 opacity-80">
            <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase">
              <span>Standard Chatbots (ChatGPT / Claude)</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✗</span>
                <span><strong>Instant answers:</strong> Spits out complete solutions immediately, triggering cognitive offloading with near-zero long-term retention.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✗</span>
                <span><strong>Text-box only:</strong> Ineffective for STEM; cannot manipulate fluid velocities or draft free-body force vectors.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✗</span>
                <span><strong>Passive reading:</strong> Reads like a textbook monologue without diagnosing where your mental assumptions broke down.</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-b from-[#0e1828] to-[#0d121c] border-2 border-emerald-500/40 p-6 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-emerald-300 font-mono text-xs font-bold uppercase">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>APODIX First-Principles Platform</span>
            </div>
            <ul className="space-y-3 text-xs text-slate-200">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Productive struggle:</strong> Strictly refuses to give direct solutions; prompts Socratic counter-questions from physical conservation laws.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Line-by-line derivation grader:</strong> Pinpoints the exact faulty premise in your math without revealing the answer.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Live Physics Labs:</strong> Interactive Hagen-Poiseuille velocity profiles, Péclet diffusion, and stylus smart whiteboard.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#1c2438] py-6 text-center text-xs text-slate-500 font-mono">
        <p>&copy; 2026 APODIX &bull; Socratic STEM Derivation Engine</p>
      </footer>
    </div>
  );
}
