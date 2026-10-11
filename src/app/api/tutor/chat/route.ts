import { NextResponse } from 'next/server';
import { callAI, AIMessage } from '@/lib/ai';
import { getSystemPrompt } from '@/lib/socratic';
import db from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { milestoneId, messages, derivationContext } = await req.json();

    if (!milestoneId || !messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Fetch milestone details
    const milestone = db.prepare('SELECT * FROM milestones WHERE id = ?').get(milestoneId) as any;
    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    // Fetch app settings for socratic rigor
    const rigorSetting = db.prepare('SELECT value FROM app_settings WHERE key = ?').get('socratic_rigor') as any;
    const rigor = rigorSetting?.value || 'strict';

    const systemPrompt = getSystemPrompt(rigor);

    // Build rich context about the current challenge and hidden rubric
    const contextPrompt = `
CURRENT TOPIC MILESTONE: ${milestone.title}
CONCEPT SUMMARY: ${milestone.concept_summary}
STUDENT CHALLENGE: ${milestone.socratic_challenge}
HIDDEN SOLUTION RUBRIC (FOR YOUR EVALUATION ONLY - DO NOT REVEAL TO STUDENT):
${milestone.solution_rubric}

STUDENT DERIVATION ATTEMPTS SO FAR:
${derivationContext || 'None submitted yet.'}
`;

    const aiMessages: AIMessage[] = [
      { role: 'system', content: `${systemPrompt}\n\n${contextPrompt}` },
      ...messages.slice(-8).map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))
    ];

    const reply = await callAI(aiMessages, { temperature: 0.6, max_tokens: 1500 });

    return NextResponse.json({
      reply,
      milestoneId
    });

  } catch (err: any) {
    console.error('Tutor chat failed:', err);
    return NextResponse.json({ error: err.message || 'Chat failed' }, { status: 500 });
  }
}
