'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, Clock, Trophy, CheckCircle2, Award, ArrowRight, ShieldCheck, Atom } from 'lucide-react';
import MathRenderer from '@/components/MathRenderer';
import StepDerivationWorkspace from '@/components/StepDerivationWorkspace';

export default function Hard30Page() {
  const [selectedDay, setSelectedDay] = useState(1);
  const [timerSeconds, setTimerSeconds] = useState(1800); // 30 mins
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const challenges = [
    {
      day: 1,
      title: "Asymptotic Flow in High-Aspect-Ratio Microchannels",
      domain: "Microfluidics & Hydrodynamics",
      difficulty: "Hard",
      timeEstimate: "25 mins",
      problem: `Consider a rectangular microfluidic channel of width $w$ and height $h$ where $w \\gg h$ (high aspect ratio). 

1. Write down the 2D Navier-Stokes momentum equation:
$$\\mu \\left( \\frac{\\partial^2 u}{\\partial y^2} + \\frac{\\partial^2 u}{\\partial z^2} \\right) = \\frac{dP}{dx}$$

2. Show that in the core region far from the side walls, $\\frac{\\partial^2 u}{\\partial z^2} \\ll \\frac{\\partial^2 u}{\\partial y^2}$.
3. Solve for $u(y)$ with no-slip walls at $y = \\pm h/2$, and compute the total volumetric flow rate $Q = \\int u \\, dA$ in terms of the hydrodynamic resistance $R_H = \\frac{12 \\mu L}{w h^3}$.`,
      rubric: "Neglect d2u/dz2 in core. Integrate mu d2u/dy2 = dP/dx twice with boundary u(+-h/2) = 0. Velocity u(y) = -(dP/dx)/(2mu) * ((h/2)^2 - y^2). Integrate across cross-section -h/2 to h/2 and 0 to w. Yields Q = -(dP/dx) * (w h^3) / (12 mu). Thus deltaP = R_H * Q where R_H = 12 mu L / (w h^3)."
    },
    {
      day: 2,
      title: "Capillary Pinch-Off & The Ray-Taylor Rayleigh Instability",
      domain: "Interfacial Fluid Dynamics",
      difficulty: "Very Hard",
      timeEstimate: "30 mins",
      problem: `In a microfluidic co-axial jetting system, a cylindrical liquid thread of radius $R_0$ is subjected to infinitesimal axisymmetric surface perturbations $r(z) = R_0 + \\epsilon \\cos(kz)$.

1. Using the Young-Laplace equation, express the Laplace pressure perturbation $\\Delta P(z)$ as a function of the axial wavenumber $k$ and surface tension $\\gamma$.
2. Prove that the cylinder is unstable to perturbations only when the dimensionless wavenumber $k R_0 < 1$ (the Rayleigh criterion).`,
      rubric: "Laplace pressure deltaP = gamma*(1/R_theta - d2r/dz2). With r = R0 + eps cos(kz), 1/R_theta = 1/R0 - eps/R0^2 cos(kz) and d2r/dz2 = -k^2 eps cos(kz). Thus deltaP = gamma/R0 + gamma eps cos(kz) * (k^2 - 1/R0^2). For growth, pressure must be lower where radius is larger, requiring k^2 - 1/R0^2 < 0 => k R0 < 1."
    }
  ];

  const currentChallenge = challenges[selectedDay - 1] || challenges[0];

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 p-6 sm:p-10 bg-grid-apodix">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1c2438] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase font-bold tracking-wider">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>APODIX Hard 30 Derivation Arena</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">Daily Multi-Step Proofs</h1>
            <p className="text-xs text-slate-400">
              30 days of elite, multi-step STEM derivations designed to build cognitive endurance and first-principles mastery.
            </p>
          </div>

          {/* Timer Card */}
          <div className="bg-[#0d121c] border border-[#1e273a] rounded-2xl px-5 py-3 flex items-center gap-4 shadow-xl">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Sprint Timer</span>
              <span className="text-2xl font-mono font-extrabold text-amber-400">
                {formatTime(timerSeconds)}
              </span>
            </div>
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isTimerRunning
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
              }`}
            >
              {isTimerRunning ? 'Pause' : 'Start Timer'}
            </button>
          </div>
        </div>

        {/* Day Selector Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 14 }).map((_, i) => {
            const dayNum = i + 1;
            const isAvailable = dayNum <= challenges.length;
            const isSelected = dayNum === selectedDay;
            return (
              <button
                key={dayNum}
                disabled={!isAvailable}
                onClick={() => setSelectedDay(dayNum)}
                className={`w-12 h-12 rounded-xl text-xs font-mono font-bold flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30 scale-105'
                    : isAvailable
                    ? 'bg-[#0d121c] border border-[#1e273a] text-slate-300 hover:border-amber-400/50'
                    : 'bg-[#070a10] border border-[#121927] text-slate-700 cursor-not-allowed'
                }`}
              >
                <span>D{dayNum}</span>
                {isAvailable && <span className="text-[9px] opacity-70">★</span>}
              </button>
            );
          })}
        </div>

        {/* Active Challenge Card */}
        <div className="bg-[#0d121c] border border-[#1e273a] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#1c2438] pb-4">
            <div>
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                Day {currentChallenge.day} &bull; {currentChallenge.domain}
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">{currentChallenge.title}</h2>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-xs font-mono font-bold">
                {currentChallenge.difficulty}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#070a10] text-slate-300 border border-[#1a2336] text-xs font-mono">
                {currentChallenge.timeEstimate}
              </span>
            </div>
          </div>

          {/* Problem Statement with LaTeX */}
          <div className="bg-[#070a10] p-6 rounded-xl border border-[#1a2336] leading-relaxed text-sm text-slate-200">
            <MathRenderer content={currentChallenge.problem} />
          </div>

          {/* Derivation Engine */}
          <StepDerivationWorkspace
            milestoneId={`hard30-day-${currentChallenge.day}`}
            challenge={currentChallenge.problem}
          />
        </div>
      </div>
    </div>
  );
}
