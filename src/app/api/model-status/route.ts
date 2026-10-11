import { NextResponse } from 'next/server';
import { getActiveModel } from '@/lib/ai';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const active = getActiveModel();
    return NextResponse.json({
      name: active.name,
      provider: active.provider,
      model_id: active.model_id,
      is_local: active.provider === 'lmstudio' || active.provider === 'ollama'
    });
  } catch (e: any) {
    return NextResponse.json({ name: 'LM Studio Qwen', provider: 'lmstudio' });
  }
}
