import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = db.prepare('SELECT key, value FROM app_settings').all() as { key: string; value: string }[];
    const settings: Record<string, any> = {};
    rows.forEach(r => {
      settings[r.key] = r.value;
    });
    return NextResponse.json({ settings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const insertStmt = db.prepare('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)');
    
    db.transaction(() => {
      for (const [key, value] of Object.entries(body)) {
        insertStmt.run(key, String(value));
      }
    })();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
