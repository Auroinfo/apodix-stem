'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Network, Search, ArrowRight, Atom, Droplets, Cpu, Sparkles, Filter, ChevronRight, BookOpen } from 'lucide-react';
import MathRenderer from '@/components/MathRenderer';

interface ConceptItem {
  id: string;
  name: string;
  category: 'Physics' | 'Fluids & Transport' | 'Mathematics' | 'Bioengineering' | 'CS & AI';
  difficulty: 'Foundational' | 'Intermediate' | 'Advanced' | 'Frontier';
  formula?: string;
  summary: string;
  prerequisites: string[];
  leadsTo: string[];
  studyPathTopic?: string;
}

export default function ConceptLibraryPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeConcept, setActiveConcept] = useState<ConceptItem | null>(null);

  const concepts: ConceptItem[] = [
    {
      id: 'c-knudsen',
      name: 'Knudsen Number Criterion',
      category: 'Fluids & Transport',
      difficulty: 'Foundational',
      formula: 'Kn = \\frac{\\lambda}{L_c}',
      summary: 'Determines the validity of the continuum hypothesis. When Kn < 0.001, Navier-Stokes equations and no-slip wall boundary conditions hold without slip velocity corrections.',
      prerequisites: ['Mean Free Path', 'Continuum Mechanics'],
      leadsTo: ['Navier-Stokes Equations', 'Stokes Creeping Flow'],
      studyPathTopic: 'Microfluidics'
    },
    {
      id: 'c-reynolds',
      name: 'Reynolds Number & Creeping Flow',
      category: 'Fluids & Transport',
      difficulty: 'Foundational',
      formula: 'Re = \\frac{\\rho v D_h}{\\mu} \\ll 1',
      summary: 'At micron dimensions, convective acceleration is negligible. The flow regime is strictly laminar, deterministic, and time-reversible (Purcell\'s Scallop Theorem).',
      prerequisites: ['Knudsen Number Criterion', 'Viscous Shear Stress'],
      leadsTo: ['Hagen-Poiseuille Flow', 'Stokes Reversibility'],
      studyPathTopic: 'Microfluidics'
    },
    {
      id: 'c-poiseuille',
      name: 'Hagen-Poiseuille Velocity Profile',
      category: 'Fluids & Transport',
      difficulty: 'Intermediate',
      formula: 'u(y) = \\frac{1}{2\\mu} \\left(-\\frac{dP}{dx}\\right) (h^2 - y^2)',
      summary: 'The exact parabolic velocity profile for pressure-driven creeping flow between parallel plates. Solved directly by integrating the 1D balance between pressure gradient and viscous shear.',
      prerequisites: ['Reynolds Number & Creeping Flow', 'No-Slip Boundary Condition'],
      leadsTo: ['Hydrodynamic Resistance', 'Taylor Dispersion'],
      studyPathTopic: 'Microfluidics'
    },
    {
      id: 'c-young-laplace',
      name: 'Young-Laplace Equation & Capillarity',
      category: 'Physics',
      difficulty: 'Intermediate',
      formula: '\\Delta P = \\gamma \\left( \\frac{1}{R_1} + \\frac{1}{R_2} \\right)',
      summary: 'Relates surface tension and interface curvature to the internal Laplace pressure jump. Drives passive capillary pumping and dictates droplet emulsion thermodynamics.',
      prerequisites: ['Surface Free Energy', 'Interfacial Curvature'],
      leadsTo: ['Capillary Number', 'Digital Droplet Generation'],
      studyPathTopic: 'Microfluidics'
    },
    {
      id: 'c-peclet',
      name: 'Péclet Number & Mass Transport',
      category: 'Fluids & Transport',
      difficulty: 'Advanced',
      formula: 'Pe = \\frac{u \\cdot w}{D}',
      summary: 'The ratio of convective advection to molecular diffusion. In microfluidics, Pe is typically large (>100), meaning parallel laminar streams flow side-by-side with very little mixing.',
      prerequisites: ['Fick\'s Second Law of Diffusion', 'Hagen-Poiseuille Flow'],
      leadsTo: ['Chaotic Advection', 'Taylor Dispersion'],
      studyPathTopic: 'Microfluidics'
    },
    {
      id: 'c-capillary-num',
      name: 'Capillary Number (Ca)',
      category: 'Bioengineering',
      difficulty: 'Advanced',
      formula: 'Ca = \\frac{\\mu \\cdot v}{\\gamma}',
      summary: 'Measures the relative importance of viscous shearing forces versus capillary interfacial tension. Governs the transition between dripping and jetting in flow-focusing droplet generators.',
      prerequisites: ['Young-Laplace Equation & Capillarity', 'Shear Rate'],
      leadsTo: ['Digital Droplet Genomics', 'Lab-on-a-Chip Architecture'],
      studyPathTopic: 'Microfluidics'
    },
    {
      id: 'c-feynman',
      name: 'Feynman Propagator & Path Integrals',
      category: 'Physics',
      difficulty: 'Frontier',
      formula: 'K(x_b, t_b; x_a, t_a) = \\int \\mathcal{D}[x(t)] \\exp\\left( \\frac{i}{\\hbar} S[x(t)] \\right)',
      summary: 'The quantum transition amplitude evaluated as a sum over all possible classical trajectories, weighted by the exponential of the action S.',
      prerequisites: ['Classical Lagrangian Mechanics', 'Schrödinger Equation'],
      leadsTo: ['Quantum Field Theory', 'Feynman Diagrams'],
      studyPathTopic: 'Quantum Field Theory'
    }
  ];

  const categories = ['All', 'Fluids & Transport', 'Physics', 'Mathematics', 'Bioengineering', 'CS & AI'];

  const filtered = concepts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.summary.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 p-6 sm:p-10 bg-grid-apodix">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1c2438] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase font-bold tracking-wider">
              <Network className="w-4 h-4 text-emerald-400" />
              <span>APODIX Knowledge Map</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">The Map of Everything</h1>
            <p className="text-xs text-slate-400">
              Explore interconnected scientific laws from foundational axioms to cutting-edge research.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search concepts or formulas..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#0d121c] border border-[#1e273a] rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-[#0d121c] text-slate-400 hover:text-white border border-[#1e273a]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid of Concept Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(concept => (
            <div
              key={concept.id}
              onClick={() => setActiveConcept(concept)}
              className="bg-[#0d121c] border border-[#1e273a] hover:border-emerald-500/60 p-5 rounded-2xl cursor-pointer transition-all hover:shadow-xl hover:scale-[1.01] flex flex-col justify-between group space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-emerald-400 font-semibold">{concept.category}</span>
                  <span className="px-2 py-0.5 rounded bg-[#070a10] text-slate-400 text-[10px] border border-[#1a2336]">
                    {concept.difficulty}
                  </span>
                </div>

                <h3 className="font-bold text-base text-white group-hover:text-emerald-300 transition-colors">
                  {concept.name}
                </h3>

                {concept.formula && (
                  <div className="bg-[#070a10] p-2.5 rounded-xl border border-[#1a2336] text-center font-mono">
                    <MathRenderer content={`$$${concept.formula}$$`} />
                  </div>
                )}

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {concept.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-[#1a2336] flex items-center justify-between text-xs text-emerald-400 font-medium font-mono">
                <span>View Knowledge Connections</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Concept Deep Dive Drawer / Modal */}
      {activeConcept && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d121c] border border-[#1e273a] rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#1c2438] pb-3">
              <div>
                <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase">{activeConcept.category} &bull; {activeConcept.difficulty}</span>
                <h2 className="text-xl font-bold text-white mt-0.5">{activeConcept.name}</h2>
              </div>
              <button
                onClick={() => setActiveConcept(null)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded bg-[#101726] border border-[#1e2b45]"
              >
                Close
              </button>
            </div>

            {activeConcept.formula && (
              <div className="bg-[#070a10] p-4 rounded-xl border border-[#1a2336] text-center">
                <MathRenderer content={`$$${activeConcept.formula}$$`} />
              </div>
            )}

            <div className="text-xs text-slate-300 leading-relaxed bg-[#070a10] p-4 rounded-xl border border-[#1a2336]">
              {activeConcept.summary}
            </div>

            {/* Knowledge Graph Connections */}
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-[#070a10] p-3 rounded-xl border border-[#1a2336] space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Prerequisites Needed:</span>
                {activeConcept.prerequisites.map((p, idx) => (
                  <div key={idx} className="text-amber-400 text-xs flex items-center gap-1">
                    <span>&bull;</span> {p}
                  </div>
                ))}
              </div>

              <div className="bg-[#070a10] p-3 rounded-xl border border-[#1a2336] space-y-1.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">Leads Directly To:</span>
                {activeConcept.leadsTo.map((l, idx) => (
                  <div key={idx} className="text-emerald-400 text-xs flex items-center gap-1">
                    <span>&bull;</span> {l}
                  </div>
                ))}
              </div>
            </div>

            {activeConcept.studyPathTopic && (
              <div className="pt-2 flex justify-end">
                <Link
                  href="/curriculum/sp-microfluidics-master"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Practice in Socratic Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
