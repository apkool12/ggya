import { jwtVerify, SignJWT } from 'jose';

export interface SessionPayload {
  sub: string;
  role: 'ADMIN' | 'LEADER';
  teamId?: string;
  username: string;
}

const secret = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET ?? 'dev-secret-please-rotate-aaaaaaaaaaaaaaaaaaaaaaaa',
  );

export const SESSION_COOKIE = 'ow_session';

export async function signSession(p: SessionPayload): Promise<string> {
  return new SignJWT({ role: p.role, teamId: p.teamId, username: p.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(p.sub)
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(secret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      sub: String(payload.sub),
      role: payload.role as 'ADMIN' | 'LEADER',
      teamId: payload.teamId as string | undefined,
      username: payload.username as string,
    };
  } catch {
    return null;
  }
}
