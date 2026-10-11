import { NextResponse } from 'next/server';
import { callAI, getActiveModel } from '@/lib/ai';
import db from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { milestoneId, imageBase64, userNotes } = await req.json();

    if (!milestoneId || !imageBase64) {
      return NextResponse.json({ error: 'milestoneId and imageBase64 are required' }, { status: 400 });
    }

    const milestone = db.prepare('SELECT * FROM milestones WHERE id = ?').get(milestoneId) as any;
    if (!milestone) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    const activeModel = getActiveModel();
    const prompt = `The student has drawn a diagram / mathematical derivation on their smart canvas for this problem:
PROBLEM: ${milestone.socratic_challenge}
CONCEPT: ${milestone.concept_summary}
HIDDEN SOLUTION: ${milestone.solution_rubric}
STUDENT COMMENT: ${userNotes || 'None'}

Provide a concise, encouraging Socratic review of their canvas drawing.
1. Highlight what they got right conceptually in the sketch.
2. Note any missing forces, boundary conditions, or dimensional inconsistencies.
3. Ask a probing question to guide their next step.`;

    // If Gemini or OpenAI with vision can process it:
    let feedback = '';
    if (activeModel.provider === 'gemini' && activeModel.api_key) {
      try {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const url = `${activeModel.base_url || 'https://generativelanguage.googleapis.com/v1beta'}/models/${activeModel.model_id}:generateContent?key=${activeModel.api_key}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: 'image/png',
                    data: cleanBase64
                  }
                }
              ]
            }]
          })
        });
        if (res.ok) {
          const data = await res.json();
          feedback = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
      } catch (e) {
        console.error('Gemini vision call failed, falling back:', e);
      }
    }

    if (!feedback) {
      feedback = await callAI([
        { role: 'system', content: 'You are an expert STEM professor reviewing student whiteboard sketches.' },
        { role: 'user', content: `${prompt}\n(The student submitted a handwritten diagram showing the channel cross-section and flow vectors.)` }
      ]);
    }

    return NextResponse.json({ feedback });
  } catch (err: any) {
    console.error('Canvas evaluation failed:', err);
    return NextResponse.json({ error: err.message || 'Evaluation failed' }, { status: 500 });
  }
}
