'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Droplets, Info } from 'lucide-react';

export default function MicrofluidicsSimulator() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  // Physical parameters
  const [channelWidthUm, setChannelWidthUm] = useState(50); // micrometers
  const [flowRateUlMin, setFlowRateUlMin] = useState(2.0); // uL/min
  const [viscosityMpaS, setViscosityMpaS] = useState(1.0); // mPa.s (water ~ 1.0)
  const [densityKgM3] = useState(1000); // water density kg/m3

  // Calculated physical values
  // Convert units:
  // w in m = channelWidthUm * 1e-6
  // Assume square or 50 um depth h:
  const hM = 50 * 1e-6;
  const wM = channelWidthUm * 1e-6;
  const areaM2 = wM * hM;
  // Q in m3/s = (flowRateUlMin * 1e-9) / 60
  const qM3s = (flowRateUlMin * 1e-9) / 60;
  const avgVelocityM_S = areaM2 > 0 ? qM3s / areaM2 : 0; // m/s
  const vAvgMmS = avgVelocityM_S * 1e3; // mm/s
  const vMaxMmS = vAvgMmS * 1.5; // for parabolic laminar flow ~ 1.5 * v_avg

  // Hydraulic diameter D_h = 4A / P = 2*w*h / (w+h)
  const dhM = (2 * wM * hM) / (wM + hM);
  const muPaS = viscosityMpaS * 1e-3;
  const reynolds = muPaS > 0 ? (densityKgM3 * avgVelocityM_S * dhM) / muPaS : 0;

  // Pressure drop per 1 cm channel: Delta P = (12 * mu * L * Q) / (w * h^3) for w > h
  const channelLengthM = 0.01; // 1 cm
  const deltaP_Pa = (12 * muPaS * channelLengthM * qM3s) / (Math.max(wM, hM) * Math.pow(Math.min(wM, hM), 3));
  const deltaP_bar = deltaP_Pa / 1e5;

  // Particles for simulation
  const particlesRef = useRef<{ x: number; yNorm: number; speed: number; color: string }[]>([]);

  useEffect(() => {
    // Initialize 60 tracer particles
    const p = [];
    const colors = ['#38bdf8', '#818cf8', '#34d399', '#fbbf24'];
    for (let i = 0; i < 70; i++) {
      p.push({
        x: Math.random() * 600,
        yNorm: Math.random() * 2 - 1, // -1 to +1 normalized across channel
        speed: 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    particlesRef.current = p;
  }, []);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const W = canvas.width;
      const H = canvas.height;

      // Channel bounds
      const channelTop = H * 0.22;
      const channelBottom = H * 0.78;
      const channelHeightPx = channelBottom - channelTop;
      const channelCenterY = (channelTop + channelBottom) / 2;

      // Draw channel walls
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, channelTop);
      ctx.fillRect(0, channelBottom, W, H - channelBottom);

      // Channel solid wall boundaries
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, channelTop);
      ctx.lineTo(W, channelTop);
      ctx.moveTo(0, channelBottom);
      ctx.lineTo(W, channelBottom);
      ctx.stroke();

      // Channel interior background
      const grad = ctx.createLinearGradient(0, channelTop, 0, channelBottom);
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.5, '#082f49');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, channelTop, W, channelHeightPx);

      // Draw subtle streamline grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 5; i++) {
        const y = channelTop + (channelHeightPx / 6) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Parabolic Hagen-Poiseuille Velocity Profile curve
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const profileStartX = 90;
      const maxArrowLength = 110;

      for (let y = channelTop; y <= channelBottom; y += 2) {
        const yNorm = (y - channelCenterY) / (channelHeightPx / 2); // -1 to 1
        const uRatio = Math.max(0, 1 - yNorm * yNorm); // parabolic profile
        const xPos = profileStartX + uRatio * maxArrowLength;
        if (y === channelTop) {
          ctx.moveTo(xPos, y);
        } else {
          ctx.lineTo(xPos, y);
        }
      }
      ctx.stroke();

      // Draw velocity vector arrows on the profile
      ctx.fillStyle = 'rgba(251, 191, 36, 0.6)';
      for (let step = -4; step <= 4; step++) {
        const yNorm = step / 4.5;
        const y = channelCenterY + yNorm * (channelHeightPx / 2);
        const uRatio = Math.max(0, 1 - yNorm * yNorm);
        const arrowLen = uRatio * maxArrowLength;
        if (arrowLen > 10) {
          ctx.beginPath();
          ctx.moveTo(profileStartX, y);
          ctx.lineTo(profileStartX + arrowLen, y);
          ctx.stroke();
          // Arrowhead
          ctx.beginPath();
          ctx.moveTo(profileStartX + arrowLen, y);
          ctx.lineTo(profileStartX + arrowLen - 6, y - 3);
          ctx.lineTo(profileStartX + arrowLen - 6, y + 3);
          ctx.fill();
        }
      }

      // Profile label
      ctx.fillStyle = '#fbbf24';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillText('u(y) = u_max (1 - (2y/w)²)', 40, channelTop - 10);

      // Animate and draw tracer particles
      const speedFactor = Math.min(Math.max(vAvgMmS * 0.8, 0.4), 8);

      particlesRef.current.forEach(p => {
        // Local parabolic velocity: u = u_max * (1 - yNorm^2)
        const localVelocityRatio = Math.max(0.08, 1 - p.yNorm * p.yNorm);
        if (isPlaying) {
          p.x += speedFactor * localVelocityRatio * 2;
          if (p.x > W) {
            p.x = 0;
            p.yNorm = Math.random() * 1.9 - 0.95;
          }
        }

        const yPx = channelCenterY + p.yNorm * (channelHeightPx / 2);

        // Particle glow
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, yPx, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // No-slip boundary visual indicator (u = 0 at walls)
      ctx.fillStyle = '#ef4444';
      ctx.font = '10px monospace';
      ctx.fillText('u = 0 (No-slip wall)', W - 140, channelTop - 6);
      ctx.fillText('u = 0 (No-slip wall)', W - 140, channelBottom + 16);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, vAvgMmS, channelWidthUm]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-sky-400" />
          <h3 className="font-semibold text-white tracking-wide">
            Interactive Microfluidics Flow Lab
          </h3>
        </div>

        {/* Regime Indicator Badge */}
        <div className="flex items-center gap-2">
          {reynolds < 1 ? (
            <span className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Creeping Stokes Flow (Re &lt;&lt; 1, Time-Reversible)
            </span>
          ) : reynolds < 2000 ? (
            <span className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Laminar Flow (Re &lt; 2000)
            </span>
          ) : (
            <span className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              Turbulent Transition (Re &ge; 2000)
            </span>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
        <canvas
          ref={canvasRef}
          width={680}
          height={260}
          className="w-full h-auto block"
        />

        {/* Live HUD overlay */}
        <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-lg p-2.5 text-xs font-mono space-y-1 text-slate-300 shadow-lg">
          <div><span className="text-slate-400">Reynolds (Re):</span> <strong className="text-amber-400">{reynolds.toFixed(3)}</strong></div>
          <div><span className="text-slate-400">Avg Velocity:</span> <strong className="text-sky-300">{vAvgMmS.toFixed(2)} mm/s</strong></div>
          <div><span className="text-slate-400">Max Velocity:</span> <strong className="text-sky-300">{vMaxMmS.toFixed(2)} mm/s</strong></div>
          <div><span className="text-slate-400">&Delta;P (1 cm):</span> <strong className="text-emerald-300">{(deltaP_Pa / 1000).toFixed(2)} kPa</strong></div>
        </div>

        {/* Canvas controls */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700 backdrop-blur transition-all"
            title={isPlaying ? 'Pause simulation' : 'Play simulation'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              setChannelWidthUm(50);
              setFlowRateUlMin(2.0);
              setViscosityMpaS(1.0);
            }}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 backdrop-blur transition-all"
            title="Reset parameters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Parameter Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400">Channel Width (w):</span>
            <span className="font-mono text-indigo-400 font-bold">{channelWidthUm} &mu;m</span>
          </div>
          <input
            type="range"
            min={10}
            max={200}
            step={5}
            value={channelWidthUm}
            onChange={e => setChannelWidthUm(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500 mt-1">Directly sets characteristic length scale L_c</p>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400">Flow Rate (Q):</span>
            <span className="font-mono text-sky-400 font-bold">{flowRateUlMin} &mu;L/min</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={30}
            step={0.5}
            value={flowRateUlMin}
            onChange={e => setFlowRateUlMin(Number(e.target.value))}
            className="w-full accent-sky-500 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500 mt-1">Imposed syringe pump volumetric throughput</p>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400">Fluid Viscosity (&mu;):</span>
            <span className="font-mono text-emerald-400 font-bold">{viscosityMpaS} mPa&middot;s</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={8.0}
            step={0.5}
            value={viscosityMpaS}
            onChange={e => setViscosityMpaS(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500 mt-1">Water ~ 1.0, Plasma ~ 1.5, Glycerol mix ~ 5.0</p>
        </div>
      </div>
    </div>
  );
}
