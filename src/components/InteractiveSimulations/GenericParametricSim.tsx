'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sliders, RotateCcw } from 'lucide-react';

interface GenericSimProps {
  title?: string;
  config?: Record<string, any>;
}

export default function GenericParametricSim({ title = 'Interactive Parameter Playground', config = {} }: GenericSimProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [paramA, setParamA] = useState(config.a || 5);
  const [paramB, setParamB] = useState(config.b || 2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Dark grid background
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(40, H - 30);
    ctx.lineTo(W - 20, H - 30);
    ctx.moveTo(40, 20);
    ctx.lineTo(40, H - 30);
    ctx.stroke();

    // Plot parametric curve f(x) = A * sin(B * x) * exp(-0.005 * x)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();

    const startX = 40;
    const endX = W - 30;
    const midY = (H - 30 + 20) / 2;

    for (let x = startX; x <= endX; x++) {
      const t = (x - startX) * 0.05;
      const yVal = Math.sin(t * (paramB * 0.5)) * Math.exp(-t * 0.04) * (paramA * 8);
      const canvasY = midY - yVal;

      if (x === startX) {
        ctx.moveTo(x, canvasY);
      } else {
        ctx.lineTo(x, canvasY);
      }
    }
    ctx.stroke();

    // Fill underneath
    ctx.fillStyle = 'rgba(56, 189, 248, 0.1)';
    ctx.lineTo(endX, midY);
    ctx.lineTo(startX, midY);
    ctx.closePath();
    ctx.fill();

    // Label
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.fillText(`\u03c8(x, t) = ${paramA} \u00b7 exp(-\u03b3 x) \u00b7 sin(${paramB} \u03c9 x)`, 50, 40);
  }, [paramA, paramB]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-white tracking-wide">{title}</h3>
        </div>
        <button
          onClick={() => {
            setParamA(5);
            setParamB(2);
          }}
          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="rounded-xl overflow-hidden border border-slate-800">
        <canvas ref={canvasRef} width={680} height={200} className="w-full h-auto block" />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Amplitude / Scaling (&alpha;):</span>
            <span className="font-mono text-indigo-400 font-bold">{paramA}</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={paramA}
            onChange={e => setParamA(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Frequency / Gradient (&beta;):</span>
            <span className="font-mono text-sky-400 font-bold">{paramB}</span>
          </div>
          <input
            type="range"
            min={1}
            max={8}
            value={paramB}
            onChange={e => setParamB(Number(e.target.value))}
            className="w-full accent-sky-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
