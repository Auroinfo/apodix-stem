import { NextResponse } from 'next/server';
import { testModelConnection } from '@/lib/ai';
import { ModelConfig } from '@/lib/types';

export async function POST(req: Request) {
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
