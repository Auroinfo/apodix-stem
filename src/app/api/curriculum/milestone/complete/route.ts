import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { milestoneId, masteryScore = 100 } = await req.json();

    if (!milestoneId) {
      return NextResponse.json({ error: 'milestoneId is required' }, { status: 400 });
    }

    db.prepare('UPDATE milestones SET is_completed = 1, mastery_score = ? WHERE id = ?').run(masteryScore, milestoneId);

    // Find the study path this belongs to
    const msInfo = db.prepare(`
      SELECT m.study_path_id 
      FROM milestones ms
      JOIN modules m ON ms.module_id = m.id
      WHERE ms.id = ?
    `).get(milestoneId) as any;

    if (msInfo?.study_path_id) {
      const stats = db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN ms.is_completed = 1 THEN 1 ELSE 0 END) as completed
        FROM milestones ms
        JOIN modules m ON ms.module_id = m.id
        WHERE m.study_path_id = ?
      `).get(msInfo.study_path_id) as { total: number; completed: number };

      const percent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
      db.prepare('UPDATE study_paths SET progress_percent = ? WHERE id = ?').run(percent, msInfo.study_path_id);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
