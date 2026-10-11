'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Layers, RotateCcw, Check, Sparkles, ChevronLeft, ChevronRight, Atom, BookOpen } from 'lucide-react';
import MathRenderer from '@/components/MathRenderer';

interface Flashcard {
  id: string;
  topic: string;
  front: string;
  frontMath?: string;
  back: string;
  backMath?: string;
  insight: string;
}

export default function FlashcardsPage() {
  const [cards] = useState<Flashcard[]>([
    {
      id: 'fc-1',
      topic: 'Microfluidics / Dimensionless Numbers',
      front: 'Reynolds Number (Re)',
      frontMath: 'Re = \\frac{\\rho v D_h}{\\mu}',
      back: 'Ratio of inertial forces to viscous forces.',
      backMath: 'Re \\ll 1 \\implies \\text{Creeping Stokes Flow (Time-Reversible)}',
      insight: 'In microchannels (D_h ~ 50 μm, v ~ 1 mm/s), Re is typically ~ 0.05. Fluid inertia is negligible, and turbulence cannot form.'
    },
    {
      id: 'fc-2',
      topic: 'Transport Phenomena',
      front: 'Péclet Number (Pe)',
      frontMath: 'Pe = \\frac{u \\cdot L}{D}',
      back: 'Ratio of advective transport rate to molecular diffusion rate.',
      backMath: 't_{\\text{diff}} \\approx \\frac{L^2}{2D}, \\quad L_{\\text{mix}} = u \\cdot t_{\\text{diff}}',
      insight: 'When Pe > 100, fluids in adjacent streams flow side-by-side with almost no cross-stream mixing without specialized herringbone micro-grooves.'
    },
    {
      id: 'fc-3',
      topic: 'Capillarity & Multiphase',
      front: 'Capillary Number (Ca)',
      frontMath: 'Ca = \\frac{\\mu \\cdot v}{\\gamma}',
      back: 'Ratio of viscous shearing forces to interfacial surface tension forces.',
      backMath: 'Ca > Ca_{\\text{crit}} \\implies \\text{Droplet Pinch-off (Dripping / Jetting)}',
      insight: 'Adding surfactant decreases interfacial tension γ, raising Ca by 10x, enabling droplet generation at much lower continuous oil flow rates.'
    },
    {
      id: 'fc-4',
      topic: 'Continuum Mechanics',
      front: 'Knudsen Criterion (Kn)',
      frontMath: 'Kn = \\frac{\\lambda}{L_c}',
      back: 'Ratio of molecular mean free path λ to characteristic channel dimension L_c.',
      backMath: 'Kn < 10^{-3} \\implies \\text{Continuum Valid & No-Slip Holds}',
      insight: 'In water, λ ~ 0.3 nm. For channels wider than 30 nm, continuum Navier-Stokes remains completely valid.'
    },
    {
      id: 'fc-5',
      topic: 'Interfacial Physics',
      front: 'Young-Laplace Equation',
      frontMath: '\\Delta P = \\gamma \\left( \\frac{1}{R_1} + \\frac{1}{R_2} \\right)',
      back: 'Pressure jump across a curved interface.',
      backMath: '\\text{For sphere: } \\Delta P = \\frac{2\\gamma}{R}',
      insight: 'Smaller microdroplets have higher internal pressures than larger ones; if connected, the small droplet empties into the large droplet.'
    }
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const card = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((currentIndex + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((currentIndex - 1 + cards.length) % cards.length);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 p-6 sm:p-10 flex flex-col items-center justify-center bg-grid-apodix">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1c2438] pb-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase font-bold tracking-wider">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>APODIX Active Recall</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">First-Principles Flashcards</h1>
          </div>

          <div className="text-xs font-mono text-emerald-400 bg-[#0d121c] px-3.5 py-1.5 rounded-full border border-[#1e273a]">
            Card {currentIndex + 1} of {cards.length}
          </div>
        </div>

        {/* 3D Flip Card */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full min-h-[340px] bg-[#0d121c] border border-[#1e273a] hover:border-emerald-500/60 rounded-3xl p-8 cursor-pointer shadow-2xl transition-all hover:scale-[1.01] flex flex-col justify-between select-none relative group"
        >
          {/* Card Top Pill */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>{card.topic}</span>
            <span className="text-emerald-400 font-bold group-hover:underline">
              {isFlipped ? 'Showing Physical Law' : 'Click to Flip'}
            </span>
          </div>

          {/* Card Body */}
          <div className="flex-1 flex flex-col items-center justify-center text-center py-6 space-y-4">
            {!isFlipped ? (
              <>
                <h2 className="text-2xl font-bold text-white tracking-tight">{card.front}</h2>
                {card.frontMath && (
                  <div className="bg-[#070a10] px-6 py-3 rounded-2xl border border-[#1a2336]">
                    <MathRenderer content={`$$${card.frontMath}$$`} />
                  </div>
                )}
                <p className="text-xs text-slate-400 italic">Click card to reveal first-principles derivation & physical intuition</p>
              </>
            ) : (
              <>
                <p className="text-base text-slate-200 font-medium leading-relaxed">{card.back}</p>
                {card.backMath && (
                  <div className="bg-[#070a10] px-6 py-3 rounded-2xl border border-[#1a2336]">
                    <MathRenderer content={`$$${card.backMath}$$`} />
                  </div>
                )}
                <div className="bg-[#070a10] p-3 rounded-xl border border-emerald-500/30 text-xs text-emerald-200 text-left max-w-lg">
                  <strong>Intuition:</strong> {card.insight}
                </div>
              </>
            )}
          </div>

          {/* Bottom Flip Indicator */}
          <div className="flex items-center justify-between text-xs text-slate-500 border-t border-[#1a2336] pt-3 font-mono">
            <span>{isFlipped ? 'Tap to view prompt' : 'Tap to view answer'}</span>
            <RotateCcw className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-500" />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handlePrev}
            className="px-4 py-2 rounded-xl bg-[#0d121c] border border-[#1e273a] hover:bg-[#141b2a] text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-5 py-2.5 rounded-xl bg-[#101726] hover:bg-[#18233a] text-emerald-400 border border-[#1e2b45] text-xs font-semibold transition-all"
            >
              Flip Card (Space)
            </button>
          </div>

          <button
            onClick={handleNext}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <span>Next Card</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
