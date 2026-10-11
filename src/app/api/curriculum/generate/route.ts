import { NextResponse } from 'next/server';
import { callAI } from '@/lib/ai';
import db from '@/lib/db';
import { StudyPath, Module, Milestone } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { topic, targetAudience = 'Undergraduate / Advanced Explorer' } = await req.json();

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const cleanTopic = topic.trim();

    const prompt = `Architect a master Socratic STEM study path for the topic: "${cleanTopic}".
Target Audience: ${targetAudience}.

Generate a 5-tier curriculum moving from fundamental physics/principles to analytical derivations and capstone applications.
You MUST output strictly valid JSON with this schema:

{
  "topic": "${cleanTopic}",
  "target_audience": "${targetAudience}",
  "overview": "2-3 sentences explaining the essence of ${cleanTopic} and why active Socratic derivation is critical.",
  "prerequisites": [
    {
      "id": "pre-1",
      "question": "A diagnostic multiple-choice question testing essential foundational knowledge needed before tackling this topic.",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "conceptTested": "Name of fundamental concept",
      "explanation": "Why this answer is physically or mathematically true."
    },
    {
      "id": "pre-2",
      "question": "A second diagnostic question testing mathematics, physics, or chemistry prerequisites.",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 1,
      "conceptTested": "Calculus or Physics Principle",
      "explanation": "Why this answer is correct."
    }
  ],
  "modules": [
    {
      "tier_level": 1,
      "title": "Tier 1: Foundations & Core Regimes",
      "description": "Foundational assumptions, dimensional scales, and core definitions.",
      "milestones": [
        {
          "title": "Core Milestone Title",
          "concept_summary": "Comprehensive explanation of physical/theoretical concept.",
          "governing_equations": [
            {
              "title": "Equation Name",
              "latex": "\\\\text{LaTeX formula}",
              "description": "Physical interpretation of the formula.",
              "variables": [
                { "symbol": "x", "meaning": "Description of variable", "unit": "unit" }
              ]
            }
          ],
          "simulation_type": "microfluidics_flow" | "diffusion" | "generic_parametric" | "none",
          "simulation_config": { "param": 10 },
          "socratic_challenge": "A challenging analytical problem or derivation prompt that forces the student to prove, calculate, or derive a result step-by-step.",
          "solution_rubric": "A concise, step-by-step hidden mathematical proof or solution key used strictly by the AI to grade the student's derivation without revealing the answer."
        }
      ]
    },
    {
      "tier_level": 2,
      "title": "Tier 2: Governing Equations & Mechanics",
      "description": "Differential formulations, conservation laws, and analytical simplifications.",
      "milestones": [
        {
          "title": "Milestone Title",
          "concept_summary": "Explanation...",
          "governing_equations": [
            { "title": "Equation", "latex": "...", "description": "...", "variables": [] }
          ],
          "simulation_type": "microfluidics_flow" | "diffusion" | "generic_parametric" | "none",
          "simulation_config": {},
          "socratic_challenge": "Derivation problem...",
          "solution_rubric": "Hidden answer key..."
        }
      ]
    },
    {
      "tier_level": 3,
      "title": "Tier 3: Dynamic Interplay & Boundary Phenomena",
      "description": "Non-linearities, interfacial dynamics, and multi-physics couplings.",
      "milestones": [
        {
          "title": "Milestone Title",
          "concept_summary": "Explanation...",
          "governing_equations": [
            { "title": "Equation", "latex": "...", "description": "...", "variables": [] }
          ],
          "simulation_type": "diffusion" | "generic_parametric" | "none",
          "simulation_config": {},
          "socratic_challenge": "Derivation problem...",
          "solution_rubric": "Hidden answer key..."
        }
      ]
    },
    {
      "tier_level": 4,
      "title": "Tier 4: Transport, Dispersion & Design Constraints",
      "description": "Transport mechanisms, scaling limits, and experimental constraints.",
      "milestones": [
        {
          "title": "Milestone Title",
          "concept_summary": "Explanation...",
          "governing_equations": [
            { "title": "Equation", "latex": "...", "description": "...", "variables": [] }
          ],
          "simulation_type": "generic_parametric" | "none",
          "simulation_config": {},
          "socratic_challenge": "Derivation problem...",
          "solution_rubric": "Hidden answer key..."
        }
      ]
    },
    {
      "tier_level": 5,
      "title": "Tier 5: Integrated Architecture & Frontier Challenges",
      "description": "Synthesis, state-of-the-art developments, and open research capstone.",
      "milestones": [
        {
          "title": "Milestone Title",
          "concept_summary": "Explanation...",
          "governing_equations": [
            { "title": "Equation", "latex": "...", "description": "...", "variables": [] }
          ],
          "simulation_type": "generic_parametric" | "none",
          "simulation_config": {},
          "socratic_challenge": "Grand capstone problem...",
          "solution_rubric": "Hidden answer key..."
        }
      ]
    }
  ]
}`;

    const responseText = await callAI(
      [
        { role: 'system', content: 'You are an elite university STEM curriculum designer. You produce strictly valid JSON.' },
        { role: 'user', content: prompt }
      ],
      { response_format: 'json', temperature: 0.5, max_tokens: 4000 }
    );

    // Clean JSON response if enclosed in markdown code fences
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }

    const parsed = JSON.parse(cleanJson);

    const studyPathId = `sp-${Date.now()}`;
    const insertPath = db.prepare(`
      INSERT INTO study_paths (id, topic, target_audience, overview, prerequisites, current_milestone_id, progress_percent)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `);

    const insertModule = db.prepare(`
      INSERT INTO modules (id, study_path_id, tier_level, title, description, order_index)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertMilestone = db.prepare(`
      INSERT INTO milestones (id, module_id, title, order_index, concept_summary, governing_equations, simulation_type, simulation_config, socratic_challenge, solution_rubric, is_completed, mastery_score)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
    `);

    let firstMilestoneId = '';

    // Transactional save to SQLite
    db.transaction(() => {
      insertPath.run(
        studyPathId,
        parsed.topic || cleanTopic,
        parsed.target_audience || targetAudience,
        parsed.overview || `Study path for ${cleanTopic}`,
        JSON.stringify(parsed.prerequisites || []),
        null
      );

      const modules = parsed.modules || [];
      modules.forEach((mod: any, mIdx: number) => {
        const moduleId = `mod-${Date.now()}-${mIdx}`;
        insertModule.run(
          moduleId,
          studyPathId,
          mod.tier_level || (mIdx + 1),
          mod.title || `Tier ${mIdx + 1}`,
          mod.description || '',
          mIdx
        );

        const milestones = mod.milestones || [];
        milestones.forEach((ms: any, msIdx: number) => {
          const milestoneId = `ms-${Date.now()}-${mIdx}-${msIdx}`;
          if (!firstMilestoneId) firstMilestoneId = milestoneId;

          // If the topic is microfluidics, ensure appropriate simulator is assigned
          let simType = ms.simulation_type || 'none';
          if (cleanTopic.toLowerCase().includes('fluid') || cleanTopic.toLowerCase().includes('flow')) {
            if (mIdx <= 1) simType = 'microfluidics_flow';
            else if (mIdx === 2 || mIdx === 3) simType = 'diffusion';
          }

          insertMilestone.run(
            milestoneId,
            moduleId,
            ms.title,
            msIdx,
            ms.concept_summary || '',
            JSON.stringify(ms.governing_equations || []),
            simType,
            JSON.stringify(ms.simulation_config || {}),
            ms.socratic_challenge || 'Solve and derive the result.',
            ms.solution_rubric || 'Verify step-by-step mathematical logic.'
          );
        });
      });

      if (firstMilestoneId) {
        db.prepare('UPDATE study_paths SET current_milestone_id = ? WHERE id = ?').run(firstMilestoneId, studyPathId);
      }
    })();

    return NextResponse.json({
      success: true,
      studyPathId,
      topic: cleanTopic
    });

  } catch (err: any) {
    console.error('Curriculum generation failed:', err);
    return NextResponse.json({ error: err.message || 'Generation failed' }, { status: 500 });
  }
}
