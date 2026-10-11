'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, HelpCircle, Lightbulb, Compass, ShieldAlert, User, Bot } from 'lucide-react';
import MathRenderer from './MathRenderer';
import { DerivationStep } from '@/lib/types';

interface SocraticChatProps {
  milestoneId: string;
  derivationSteps?: DerivationStep[];
}

export default function SocraticChat({ milestoneId, derivationSteps = [] }: SocraticChatProps) {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content: `Welcome to **APODIX**. I am your First-Principles mentor for this milestone.\n\nReview the governing principles and the Socratic challenge. How do you propose we set up the initial balance equation or boundary conditions?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user' as const, content: text.trim() }];
    setMessages(newMessages);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const derivationContext = derivationSteps
        .map((s, idx) => `Step ${idx + 1}: ${s.math_or_text} (${s.status} - ${s.feedback})`)
        .join('\n');

      const res = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestoneId,
          messages: newMessages,
          derivationContext
        })
      });

      const data = await res.json();
      if (data.reply) {
        setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'What core physical conservation law applies to this control volume?' }]);
      }
    } catch (err) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Consider the scale of the channel. What happens to convective inertial terms at microscopic dimensions?' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d121c] border border-[#1e273a] rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[#1c2438] bg-[#090d16] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center">
            <span className="font-mono text-emerald-400 font-bold text-xs">&Alpha;</span>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">APODIX Mentor</h4>
            <p className="text-[10px] text-slate-400">First-Principles Scaffolding &bull; Zero Answer Dumps</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-0.5 rounded-full font-mono">
          <ShieldAlert className="w-3 h-3" />
          <span>Anti-Cheat Active</span>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#090d16]/50">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-6 h-6 rounded-md bg-[#131b2c] border border-emerald-500/40 flex items-center justify-center flex-shrink-0 mt-0.5 text-emerald-400 text-xs font-mono">
                &Delta;
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-slate-950 font-medium shadow-md'
                  : 'bg-[#101726] text-slate-200 border border-[#1e2b45] shadow-sm'
              }`}
            >
              <MathRenderer content={m.content} />
            </div>

            {m.role === 'user' && (
              <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5 text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 p-2 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span className="italic">Synthesizing Socratic inquiry...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Scaffolding Buttons */}
      <div className="px-3 py-2 bg-[#090d16] border-t border-[#1c2438] flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => sendMessage('Give me a first-principles conceptual nudge for this step.')}
          disabled={isLoading}
          className="px-2.5 py-1 rounded-full bg-[#101726] hover:bg-[#18233a] text-slate-300 hover:text-emerald-300 text-[10px] whitespace-nowrap flex items-center gap-1 border border-[#1e2b45] transition-colors"
        >
          <Lightbulb className="w-3 h-3 text-amber-400" />
          <span>Conceptual Nudge</span>
        </button>

        <button
          onClick={() => sendMessage('What governing equation formulation should I begin setting up?')}
          disabled={isLoading}
          className="px-2.5 py-1 rounded-full bg-[#101726] hover:bg-[#18233a] text-slate-300 hover:text-cyan-300 text-[10px] whitespace-nowrap flex items-center gap-1 border border-[#1e2b45] transition-colors"
        >
          <Compass className="w-3 h-3 text-cyan-400" />
          <span>Equation Setup</span>
        </button>

        <button
          onClick={() => sendMessage('Check my assumptions: is this boundary condition physically consistent?')}
          disabled={isLoading}
          className="px-2.5 py-1 rounded-full bg-[#101726] hover:bg-[#18233a] text-slate-300 hover:text-emerald-300 text-[10px] whitespace-nowrap flex items-center gap-1 border border-[#1e2b45] transition-colors"
        >
          <HelpCircle className="w-3 h-3 text-emerald-400" />
          <span>Review Boundary</span>
        </button>
      </div>

      {/* Input Box */}
      <div className="p-3 bg-[#090d16] border-t border-[#1c2438] flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask a question or explain your reasoning..."
          disabled={isLoading}
          className="flex-1 bg-[#101726] border border-[#1e2b45] rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
        />

        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold disabled:opacity-40 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
