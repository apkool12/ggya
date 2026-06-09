import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE, signSession } from '@/server/auth';
import { prisma } from '@/server/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { username, password } = await req.json();
  if (!username || !password)
    return NextResponse.json({ error: '아이디/비밀번호를 입력하세요.' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return NextResponse.json(
      { error: '아이디 또는 비밀번호가 올바르지 않습니다.' },
      { status: 401 },
    );

  const token = await signSession({
    sub: user.id,
    role: user.role,
    teamId: user.teamId ?? undefined,
    username: user.username,
  });
  const res = NextResponse.json({ role: user.role, teamId: user.teamId, username: user.username });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
  return res;
}
