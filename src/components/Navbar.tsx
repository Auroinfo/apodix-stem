'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  Network,
  Flame,
  Layers,
  Settings,
  Cpu,
  Sparkles,
  Terminal,
  ChevronRight
} from 'lucide-react';
import { ModelConfig } from '@/lib/types';

export default function Navbar() {
  const pathname = usePathname();
  const [activeModel, setActiveModel] = useState<ModelConfig | null>(null);

  useEffect(() => {
    fetch('/api/admin/models')
      .then(res => res.json())
      .then(data => {
        if (data.models) {
          const active = data.models.find((m: ModelConfig) => m.is_active);
          setActiveModel(active || data.models[0] || null);
        }
      })
      .catch(() => {});
  }, []);

  const navLinks = [
    { href: '/', label: 'Curricula', icon: Compass },
    { href: '/concept', label: 'Knowledge Map', icon: Network },
    { href: '/hard30', label: 'Derivation Arena', icon: Flame },
    { href: '/flashcards', label: 'Active Recall', icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1c2438] bg-[#07090e]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-400 via-teal-400 to-cyan-500 p-[1.5px] shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#07090e] rounded-[10px] flex items-center justify-center">
              <span className="font-mono font-black text-lg text-transparent bg-clip-text bg-gradient-to-tr from-emerald-400 to-cyan-400">
                &Alpha;
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-wider text-white font-mono">
                APODIX
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 hidden sm:inline-block">
                First Principles
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">
              Socratic STEM Derivation Engine
            </p>
          </div>
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-300">
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-[#131c2e] text-emerald-400 font-semibold border border-emerald-500/30 shadow-sm'
                    : 'hover:bg-[#0f1422] hover:text-white text-slate-400'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Nav: Active Model & Admin */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0d121c] border border-[#1e273a] hover:border-emerald-500/40 transition-all text-xs text-slate-300 shadow-sm group"
            title="Configure AI Models in Admin"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-slate-200 truncate max-w-[120px] sm:max-w-[160px] text-[11px]">
              {activeModel ? activeModel.name : 'AI Engine Active'}
            </span>
          </Link>

          <Link
            href="/admin"
            className="p-2 rounded-xl bg-[#0d121c] hover:bg-[#151c2c] text-slate-400 hover:text-white border border-[#1e273a] transition-colors"
            title="Admin Console"
          >
            <Settings className="w-4 h-4 text-emerald-400" />
          </Link>
        </div>
      </div>
    </header>
  );
}
