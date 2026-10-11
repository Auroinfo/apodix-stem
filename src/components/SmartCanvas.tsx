'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Pen, Highlighter, Eraser, RotateCcw, Send, Sparkles, Grid, Eye, Download } from 'lucide-react';

interface SmartCanvasProps {
  milestoneId: string;
  onCanvasReview?: (feedback: string) => void;
}

export default function SmartCanvas({ milestoneId, onCanvasReview }: SmartCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [strokeColor, setStrokeColor] = useState('#00f5a0'); // APODIX Cyber Mint
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [gridMode, setGridMode] = useState<'dots' | 'grid' | 'blank'>('dots');
  const [userNote, setUserNote] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [canvasFeedback, setCanvasFeedback] = useState<string | null>(null);

  // Undo history
  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef<number>(-1);

  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number, mode: 'dots' | 'grid' | 'blank') => {
    ctx.fillStyle = '#070a10';
    ctx.fillRect(0, 0, width, height);

    if (mode === 'dots') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
      for (let x = 20; x < width; x += 25) {
        for (let y = 20; y < height; y += 25) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (mode === 'grid') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawBackground(ctx, canvas.width, canvas.height, gridMode);
    saveState();
  }, [gridMode]);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current.push(data);
    historyIndexRef.current++;
  };

  const handleUndo = () => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current--;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawBackground(ctx, canvas.width, canvas.height, gridMode);
    saveState();
  };

  const getCoordinates = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (tool === 'eraser') {
      ctx.strokeStyle = '#070a10';
      ctx.lineWidth = strokeWidth * 7;
      ctx.globalAlpha = 1.0;
    } else if (tool === 'highlighter') {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth * 5;
      ctx.globalAlpha = 0.35;
    } else {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.globalAlpha = 1.0;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas && e.pointerId) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
    setIsDrawing(false);
    saveState();
  };

  const submitCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsEvaluating(true);
    setCanvasFeedback(null);

    try {
      const imageBase64 = canvas.toDataURL('image/png');
      const res = await fetch('/api/tutor/evaluate-canvas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId,
          imageBase64,
          userNotes: userNote
        })
      });

      const data = await res.json();
      if (data.feedback) {
        setCanvasFeedback(data.feedback);
        if (onCanvasReview) onCanvasReview(data.feedback);
      }
    } catch (err: any) {
      setCanvasFeedback('Unable to review drawing: ' + err.message);
    } finally {
      setIsEvaluating(false);
    }
  };

  const colorPalette = [
    { name: 'APODIX Mint', hex: '#00f5a0' },
    { name: 'Cyan Blue', hex: '#00d9f5' },
    { name: 'Solar Amber', hex: '#fbbf24' },
    { name: 'Rose', hex: '#f43f5e' },
    { name: 'Pure White', hex: '#ffffff' },
  ];

  return (
    <div className="flex flex-col gap-4 bg-[#0d121c] border border-[#1e273a] rounded-2xl p-5 shadow-2xl">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c2438] pb-3">
        {/* Tool Selectors */}
        <div className="flex items-center gap-1.5 bg-[#080c14] p-1 rounded-xl border border-[#1c2438]">
          <button
            onClick={() => setTool('pen')}
            className={`p-2 rounded-lg text-xs flex items-center gap-1.5 transition-all ${
              tool === 'pen' ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
            title="Pen (Stylus / Touch)"
          >
            <Pen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pen</span>
          </button>

          <button
            onClick={() => setTool('highlighter')}
            className={`p-2 rounded-lg text-xs flex items-center gap-1.5 transition-all ${
              tool === 'highlighter' ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
            title="Highlighter"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Highlight</span>
          </button>

          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-lg text-xs flex items-center gap-1.5 transition-all ${
              tool === 'eraser' ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
            }`}
            title="Eraser"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Eraser</span>
          </button>
        </div>

        {/* Color Palette */}
        {tool !== 'eraser' && (
          <div className="flex items-center gap-1.5 bg-[#080c14] p-1.5 rounded-xl border border-[#1c2438]">
            {colorPalette.map(c => (
              <button
                key={c.hex}
                onClick={() => setStrokeColor(c.hex)}
                className={`w-5 h-5 rounded-full transition-transform ${
                  strokeColor === c.hex ? 'scale-125 ring-2 ring-emerald-400' : 'hover:scale-110 opacity-70'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        )}

        {/* Grid Background Switcher */}
        <div className="flex items-center gap-1 bg-[#080c14] p-1 rounded-xl border border-[#1c2438] text-[11px] font-mono">
          <button
            onClick={() => setGridMode('dots')}
            className={`px-2 py-1 rounded ${gridMode === 'dots' ? 'bg-[#18233a] text-emerald-400' : 'text-slate-500'}`}
          >
            Dots
          </button>
          <button
            onClick={() => setGridMode('grid')}
            className={`px-2 py-1 rounded ${gridMode === 'grid' ? 'bg-[#18233a] text-emerald-400' : 'text-slate-500'}`}
          >
            Grid
          </button>
          <button
            onClick={() => setGridMode('blank')}
            className={`px-2 py-1 rounded ${gridMode === 'blank' ? 'bg-[#18233a] text-emerald-400' : 'text-slate-500'}`}
          >
            Blank
          </button>
        </div>

        {/* Undo and Clear */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            className="p-2 rounded-xl bg-[#080c14] text-slate-300 hover:text-white border border-[#1c2438] hover:bg-[#141b2a] text-xs flex items-center gap-1"
            title="Undo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>

          <button
            onClick={handleClear}
            className="px-2.5 py-2 rounded-xl bg-[#080c14] text-slate-400 hover:text-rose-400 border border-[#1c2438] hover:bg-[#141b2a] text-xs"
            title="Clear canvas"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Chalkboard / Canvas */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-[#1c2438] bg-[#070a10]">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          className="w-full h-auto cursor-crosshair touch-none block"
        />

        <div className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-500 pointer-events-none select-none">
          Apple Pencil &bull; Stylus &bull; Multi-Touch
        </div>
      </div>

      {/* Multimodal AI Inspection Action */}
      <div className="bg-[#080c14] p-3.5 rounded-xl border border-[#1c2438] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <input
          type="text"
          placeholder="Note for Apodix Vision (e.g. 'I sketched the free-body shear vectors at walls')..."
          value={userNote}
          onChange={e => setUserNote(e.target.value)}
          className="flex-1 bg-[#0d121c] border border-[#1f2b45] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
        />

        <button
          onClick={submitCanvas}
          disabled={isEvaluating}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all flex-shrink-0 cursor-pointer"
        >
          {isEvaluating ? (
            <>
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing Sketch...</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Inspect Whiteboard</span>
            </>
          )}
        </button>
      </div>

      {/* AI Feedback Display */}
      {canvasFeedback && (
        <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 text-xs text-emerald-100 space-y-1.5">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold font-mono">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>APODIX Whiteboard Evaluation:</span>
          </div>
          <p className="leading-relaxed whitespace-pre-line text-slate-200">{canvasFeedback}</p>
        </div>
      )}
    </div>
  );
}
