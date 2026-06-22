import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { getSession } from '@/server/session';
import { buildSnapshot } from '@/server/snapshot';
import { broadcast } from '@/server/sse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ROLES = new Set(['TANK', 'DPS', 'SUPPORT']);

export async function POST(req: Request) {
  const s = await getSession();
  if (s?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();

  if (!body.name || typeof body.name !== 'string') {
    return NextResponse.json({ error: '이름을 입력해주세요.' }, { status: 400 });
  }
  if (!body.role || !ROLES.has(body.role)) {
    return NextResponse.json({ error: '올바른 역할을 선택해주세요.' }, { status: 400 });
  }

  const defaultOrder = await prisma.player.count();

  const player = await prisma.player.create({
    data: {
      name: body.name,
      role: body.role,
      avatarUrl: body.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60',
      mostPicks: Array.isArray(body.mostPicks)
        ? body.mostPicks.filter((u: unknown): u is string => typeof u === 'string' && u.length > 0)
        : [],
      order: typeof body.order === 'number' ? body.order : defaultOrder,
      tankTier: body.tankTier || '',
      dpsTier: body.dpsTier || '',
      supportTier: body.supportTier || '',
    },
  });

  broadcast(await buildSnapshot());
  return NextResponse.json({ ok: true, player });
}
