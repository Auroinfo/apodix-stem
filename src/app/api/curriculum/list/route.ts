import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const paths = db.prepare(`
      SELECT sp.*, 
        (SELECT COUNT(*) FROM modules m WHERE m.study_path_id = sp.id) as module_count,
        (SELECT COUNT(*) FROM milestones ms 
         JOIN modules m ON ms.module_id = m.id 
         WHERE m.study_path_id = sp.id) as milestone_count,
        (SELECT COUNT(*) FROM milestones ms 
         JOIN modules m ON ms.module_id = m.id 
         WHERE m.study_path_id = sp.id AND ms.is_completed = 1) as completed_milestones
      FROM study_paths sp
      ORDER BY sp.created_at DESC
    `).all() as any[];

    const formatted = paths.map(p => ({
      ...p,
      prerequisites: p.prerequisites ? JSON.parse(p.prerequisites) : []
    }));

    return NextResponse.json({ studyPaths: formatted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
