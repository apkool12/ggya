import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySession, type SessionPayload } from './auth';

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function requireAdmin(): Promise<SessionPayload> {
  const s = await getSession();
  if (!s || s.role !== 'ADMIN') throw new Response('Forbidden', { status: 403 });
  return s;
}
