import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const path = db.prepare('SELECT * FROM study_paths WHERE id = ?').get(id) as any;

    if (!path) {
      return NextResponse.json({ error: 'Study path not found' }, { status: 404 });
    }

    const modules = db.prepare('SELECT * FROM modules WHERE study_path_id = ? ORDER BY order_index ASC').all(id) as any[];

    for (const mod of modules) {
      const milestones = db.prepare('SELECT * FROM milestones WHERE module_id = ? ORDER BY order_index ASC').all(mod.id) as any[];
      mod.milestones = milestones.map(ms => ({
        ...ms,
        is_completed: Boolean(ms.is_completed),
        governing_equations: ms.governing_equations ? JSON.parse(ms.governing_equations) : [],
        simulation_config: ms.simulation_config ? JSON.parse(ms.simulation_config) : {}
      }));
    }

    const result = {
      ...path,
      prerequisites: path.prerequisites ? JSON.parse(path.prerequisites) : [],
      modules
    };

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    db.prepare('DELETE FROM study_paths WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
