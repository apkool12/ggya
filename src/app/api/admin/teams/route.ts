import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { getSession } from '@/server/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const s = await getSession();
  if (s?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const teams = await prisma.team.findMany({
    orderBy: { order: 'asc' },
    include: { leaderAccount: { select: { username: true } } },
  });
  return NextResponse.json({ teams });
}

export async function POST(req: Request) {
  const s = await getSession();
  if (s?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { name, leaderName, avatarUrl, startingPoints, leaderUsername, leaderPassword } =
    await req.json();
  if (!name || !leaderName || !leaderUsername || !leaderPassword)
    return NextResponse.json({ error: '필수 항목 누락' }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { username: leaderUsername } });
  if (existing) return NextResponse.json({ error: '이미 사용 중인 팀장 아이디입니다.' }, { status: 409 });

  const count = await prisma.team.count();
  const points = typeof startingPoints === 'number' ? startingPoints : 1000;
  const team = await prisma.team.create({
    data: {
      name,
      leaderName,
      avatarUrl: avatarUrl ?? '',
      startingPoints: points,
      points,
      order: count,
      leaderAccount: {
        create: {
          username: leaderUsername,
          passwordHash: await bcrypt.hash(leaderPassword, 10),
          role: 'LEADER',
        },
      },
    },
  });
  return NextResponse.json({ team });
}
