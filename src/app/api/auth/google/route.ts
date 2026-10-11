import { NextResponse } from 'next/server';
import { isAuthorizedAdmin, createAdminToken, AUTHORIZED_ADMIN_EMAIL } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const targetEmail = (email || '').trim().toLowerCase();

    if (!isAuthorizedAdmin(targetEmail)) {
      return NextResponse.json({
        error: `Access Denied: ${targetEmail || 'Unknown user'} is not authorized. Superadmin access is strictly restricted to ${AUTHORIZED_ADMIN_EMAIL}.`
      }, { status: 403 });
    }

    // Generate signed HMAC token
    const token = createAdminToken(targetEmail);

    const response = NextResponse.json({
      success: true,
      user: {
        email: targetEmail,
        role: 'admin'
      },
      token
    });

    // Set secure cookie
    response.cookies.set('apodix_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Authentication failed' }, { status: 500 });
  }
}
