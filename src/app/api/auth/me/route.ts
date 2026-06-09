import { NextResponse } from 'next/server';
import { getSession } from '@/server/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: { username: s.username, role: s.role, teamId: s.teamId ?? null },
  });
}
