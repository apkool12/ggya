import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { resetAuction } from '@/server/auctionEngine';
import { prisma } from '@/server/db';
import { getSession } from '@/server/session';
import { buildSnapshot } from '@/server/snapshot';
import { broadcast } from '@/server/sse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

async function hasProgress(): Promise<boolean> {
  const sold = await prisma.player.count({ where: { status: 'SOLD' } });
  const state = await prisma.auctionState.findUnique({ where: { id: 1 } });
  return sold > 0 || (state?.phase ?? 'IDLE') !== 'IDLE';
}

export async function PATCH(req: Request, ctx: Ctx) {
  const s = await getSession();
  if (s?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await ctx.params;
  const body = await req.json();

  const data: {
    name?: string;
    leaderName?: string;
    avatarUrl?: string;
    startingPoints?: number;
    points?: number;
  } = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.leaderName !== undefined) data.leaderName = body.leaderName;
  if (body.avatarUrl !== undefined) data.avatarUrl = body.avatarUrl;
  if (body.startingPoints !== undefined) {
    data.startingPoints = body.startingPoints;
    data.points = body.startingPoints; // 진행 전 가정: 잔여도 시작값으로 맞춤
  }

  await prisma.team.update({ where: { id }, data });
  if (body.leaderPassword)
    await prisma.user.updateMany({
      where: { teamId: id },
      data: { passwordHash: await bcrypt.hash(body.leaderPassword, 10) },
    });
  broadcast(await buildSnapshot());
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const s = await getSession();
  if (s?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await ctx.params;
  const force = new URL(req.url).searchParams.get('force') === '1';
  if (await hasProgress()) {
    if (!force)
      return NextResponse.json(
        { error: '경매 진행 중. force=1로 초기화 후 삭제하세요.' },
        { status: 409 },
      );
    await resetAuction();
  }
  await prisma.user.deleteMany({ where: { teamId: id } });
  await prisma.team.delete({ where: { id } });
  broadcast(await buildSnapshot());
  return NextResponse.json({ ok: true });
}
