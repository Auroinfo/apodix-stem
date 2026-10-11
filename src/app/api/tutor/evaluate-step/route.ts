import { NextResponse } from 'next/server';
import { evaluateDerivationStep } from '@/lib/socratic';
import db from '@/lib/db';
import { DerivationStep } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { milestoneId, step, previousSteps = [] } = await req.json();

    if (!milestoneId || !step) {
      return NextResponse.json({ error: 'milestoneId and step are required' }, { status: 400 });
    }

    const milestone = db.prepare('SELECT * FROM milestones WHERE id = ?').get(milestoneId) as any;
    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    const evaluated = await evaluateDerivationStep(
      milestone.socratic_challenge,
      milestone.solution_rubric,
      step,
      previousSteps,
      milestoneId
    );

    return NextResponse.json({ evaluatedStep: evaluated });
  } catch (err: any) {
    console.error('Evaluate step failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
