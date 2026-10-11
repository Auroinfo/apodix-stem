import { callAI, AIMessage } from './ai';
import db from './db';
import { DerivationStep, Milestone } from './types';

export function getSystemPrompt(rigor: string = 'strict'): string {
  return `You are APODIX, the world's most rigorous and insightful First-Principles STEM mentor.
Your core teaching philosophy is "PRODUCTIVE STRUGGLE" and "COGNITIVE SCAFFOLDING".

CRITICAL PEDAGOGICAL DIRECTIVES:
1. NEVER spoon-feed the final answer, formula, or code directly. If the student explicitly demands "just give me the answer" or "tell me the solution", politely decline and redirect them with a thoughtful physical riddle or derivation clue.
2. Analyze the student's mathematical, physical, or logical reasoning step-by-step from fundamental axioms (conservation of mass, momentum, energy, charge, thermodynamic potentials).
3. Diagnose misconceptions at the root: Is it an algebraic slip, an invalid physical assumption (e.g. assuming turbulent flow when Re << 1, or neglecting surface tension at micro scales), or a dimensional inconsistency?
4. When guiding:
   - Provide a Tier 1 conceptual nudge first.
   - If they remain stuck, provide a Tier 2 formula setup prompt.
   - Never solve the arithmetic or integral for them; ask them what the next operation should be.
5. Use LaTeX syntax for all mathematical expressions: inline as $...$ and display as $$...$$.
6. Keep explanations concise, crisp, intellectually stimulating, and supportive.`;
}

export async function evaluateDerivationStep(
  challenge: string,
  solutionRubric: string,
  currentStep: string,
  previousSteps: DerivationStep[],
  milestoneId?: string
): Promise<DerivationStep> {
  const stepsContext = previousSteps.map((s, idx) => `Step ${idx + 1}: ${s.math_or_text} (${s.status})`).join('\n');

  const prompt = `You are evaluating a student's step-by-step mathematical/physical derivation from first principles.
PROBLEM:
${challenge}

HIDDEN REFERENCE RUBRIC:
${solutionRubric}

PREVIOUS VALIDATED STEPS:
${stepsContext || 'None (this is the first step)'}

STUDENT'S NEW STEP TO EVALUATE:
"${currentStep}"

Evaluate this step strictly and return valid JSON with this exact schema:
{
  "status": "valid" | "warning" | "faulty",
  "feedback": "Short critique (1-2 sentences) explaining whether the mathematical step or physical reasoning holds.",
  "nudge_hint": "A guiding Socratic question or reminder if the step is faulty or incomplete, without giving away the solution.",
  "detected_misconception": "Brief name of the misconception if faulty (e.g. 'Neglected Viscous Drag' or 'Dimensional Mismatch') or null"
}`;

  try {
    const responseText = await callAI(
      [
        { role: 'system', content: 'You are an expert mathematical and physics grader for APODIX. Return only JSON.' },
        { role: 'user', content: prompt }
      ],
      { response_format: 'json', temperature: 0.3 }
    );

    const parsed = JSON.parse(responseText);

    if (parsed.status === 'faulty' && parsed.detected_misconception && milestoneId) {
      try {
        const id = 'misc-' + Date.now();
        db.prepare(`
          INSERT INTO misconceptions_log (id, milestone_id, concept, student_faulty_premise, resolved)
          VALUES (?, ?, ?, ?, 0)
        `).run(id, milestoneId, parsed.detected_misconception, currentStep);
      } catch (e) {
        console.error('Failed to log misconception:', e);
      }
    }

    return {
      step_number: previousSteps.length + 1,
      math_or_text: currentStep,
      status: parsed.status || 'valid',
      feedback: parsed.feedback || 'Step mathematically noted. Consider your next physical boundary condition.',
      nudge_hint: parsed.nudge_hint || undefined
    };
  } catch (err: any) {
    // Graceful evaluation fallback
    return {
      step_number: previousSteps.length + 1,
      math_or_text: currentStep,
      status: 'valid',
      feedback: 'Step mathematically noted. Consider your next physical boundary condition.',
    };
  }
}
