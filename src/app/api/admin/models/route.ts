import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { ModelConfig } from '@/lib/types';
import { getAdminSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const session = getAdminSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Superadmin login required' }, { status: 401 });
  }

  try {
    const models = db.prepare('SELECT * FROM models_config ORDER BY created_at DESC').all() as any[];
    const mapped = models.map(m => ({
      ...m,
      is_active: Boolean(m.is_active)
    }));
    return NextResponse.json({ models: mapped });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = getAdminSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Superadmin login required' }, { status: 401 });
  }

  try {
    const body: ModelConfig = await req.json();
    const id = body.id || `model-${Date.now()}`;

    // If setting active, deactivate others
    if (body.is_active) {
      db.prepare('UPDATE models_config SET is_active = 0').run();
    }

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO models_config 
      (id, name, provider, api_key, base_url, model_id, is_active, temperature, max_tokens)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      body.name,
      body.provider,
      body.api_key || null,
      body.base_url || null,
      body.model_id,
      body.is_active ? 1 : 0,
      body.temperature ?? 0.7,
      body.max_tokens ?? 3000
    );

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = getAdminSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Superadmin login required' }, { status: 401 });
  }

  try {
    const { id, is_active } = await req.json();
    if (is_active) {
      db.prepare('UPDATE models_config SET is_active = 0').run();
      db.prepare('UPDATE models_config SET is_active = 1 WHERE id = ?').run(id);
    } else {
      db.prepare('UPDATE models_config SET is_active = 0 WHERE id = ?').run(id);
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = getAdminSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized: Superadmin login required' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    db.prepare('DELETE FROM models_config WHERE id = ?').run(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
