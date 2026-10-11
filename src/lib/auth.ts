import crypto from 'crypto';

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'apodix-superadmin-stem-hmac-2026-key';
export const AUTHORIZED_ADMIN_EMAIL = 'dwarikatripathy@gmail.com';

export interface AdminSession {
  email: string;
  role: 'admin';
  exp: number;
}

export function isAuthorizedAdmin(email: string): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase();
}

export function createAdminToken(email: string): string {
  if (!isAuthorizedAdmin(email)) {
    throw new Error(`Unauthorized email: ${email}. Only ${AUTHORIZED_ADMIN_EMAIL} is granted superadmin privileges.`);
  }

  const payload: AdminSession = {
    email: email.trim().toLowerCase(),
    role: 'admin',
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days validity
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadStr)
    .digest('base64url');

  return `${payloadStr}.${signature}`;
}

export function verifyAdminToken(token: string | undefined | null): AdminSession | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadStr, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadStr)
    .digest('base64url');

  // Timing safe comparison to prevent timing attacks
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    return null;
  }

  try {
    const payload: AdminSession = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
    if (Date.now() > payload.exp) {
      return null; // Expired
    }
    if (!isAuthorizedAdmin(payload.email)) {
      return null; // Email changed/unauthorized
    }
    return payload;
  } catch (e) {
    return null;
  }
}

export function getAdminSessionFromRequest(req: Request): AdminSession | null {
  // Check Authorization header
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const session = verifyAdminToken(token);
    if (session) return session;
  }

  // Check cookies
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/apodix_admin_token=([^;]+)/);
  if (match) {
    const token = decodeURIComponent(match[1]);
    return verifyAdminToken(token);
  }

  return null;
}
