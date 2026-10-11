import { NextResponse } from 'next/server';
import { testModelConnection } from '@/lib/ai';
import { ModelConfig } from '@/lib/types';
import { getAdminSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = getAdminSessionFromRequest(req);
  if (!session) {
    return NextResponse.json({
      success: false,
      latencyMs: 0,
      message: 'Unauthorized: Superadmin login required'
    }, { status: 401 });
  }

  try {
    const config: ModelConfig = await req.json();
    const result = await testModelConnection(config);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      latencyMs: 0,
      message: err.message || 'Connection test failed'
    }, { status: 500 });
  }
}
