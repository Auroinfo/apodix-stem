'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Shuffle } from 'lucide-react';

export default function DiffusionSimulator() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [pecletNumber, setPecletNumber] = useState(100); // Pe = u * L / D
  const [diffusivityExponent, setDiffusivityExponent] = useState(9); // 10^-9 m^2/s

  const particlesRef = useRef<{ x: number; y: number; stream: 'top' | 'bottom'; color: string }[]>([]);

  useEffect(() => {
    const p = [];
    for (let i = 0; i < 180; i++) {
      const isTop = i % 2 === 0;
      p.push({
        x: Math.random() * 600,
        y: isTop ? 30 + Math.random() * 80 : 130 + Math.random() * 80,
        stream: isTop ? 'top' : 'bottom',
        color: isTop ? '#f43f5e' : '#38bdf8'
      });
    }
    particlesRef.current = p as any;
  }, []);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Channel background
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, W, H);

      // Top inlet (solute stream A, pink) & Bottom inlet (solute stream B, blue)
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, W, H);

      // Initial laminar interface line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Diffusion strength is inversely related to Péclet number:
      // High Pe -> advection dominates, minimal lateral mixing
      // Low Pe -> diffusion dominates, rapid lateral mixing across interface
      const brownianStep = Math.max(0.2, (200 / Math.max(pecletNumber, 10)) * 0.8);
      const advectionSpeed = 2.2;

      particlesRef.current.forEach(p => {
        if (isPlaying) {
          p.x += advectionSpeed;

          // Random walk in Y (Brownian diffusion)
          p.y += (Math.random() - 0.5) * brownianStep * 2;

          // Channel bounds
          if (p.y < 10) p.y = 10;
          if (p.y > H - 10) p.y = H - 10;

          // Reset particle if it exits channel
          if (p.x > W) {
            p.x = 0;
            p.y = p.stream === 'top' ? 20 + Math.random() * 90 : 130 + Math.random() * 90;
          }
        }

        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Stream labels
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillStyle = '#f43f5e';
      ctx.fillText('Inlet A: Dye / Solute A', 15, 25);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('Inlet B: Buffer / Solute B', 15, H - 15);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, pecletNumber]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Shuffle className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-white tracking-wide">
            Laminar Diffusion & P&eacute;clet Mixing Lab
          </h3>
        </div>

        <div className="px-3 py-1 text-xs font-mono font-medium rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
          Pe = {pecletNumber} &bull; {pecletNumber > 150 ? 'Advection Dominated (Sharp Interface)' : 'Diffusion Dominated (Interdiffusion)'}
        </div>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
        <canvas
          ref={canvasRef}
          width={680}
          height={240}
          className="w-full h-auto block"
        />

        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700 backdrop-blur transition-all"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setPecletNumber(100)}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 backdrop-blur transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400">P&eacute;clet Number (Pe = uL / D):</span>
            <span className="font-mono text-indigo-400 font-bold">{pecletNumber}</span>
          </div>
          <input
            type="range"
            min={10}
            max={300}
            step={10}
            value={pecletNumber}
            onChange={e => setPecletNumber(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500 mt-1">Lower Pe (&lt;50) causes complete mixing before the channel exit.</p>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-400">Diffusion Coeff (D):</span>
            <span className="font-mono text-sky-400 font-bold">10<sup>-{diffusivityExponent}</sup> m&sup2;/s</span>
          </div>
          <input
            type="range"
            min={8}
            max={11}
            step={1}
            value={diffusivityExponent}
            onChange={e => setDiffusivityExponent(Number(e.target.value))}
            className="w-full accent-sky-500 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500 mt-1">10^-9 (small ions/fluorescein) to 10^-11 (large DNA/colloids).</p>
        </div>
      </div>
    </div>
  );
}
