import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { getSession } from '@/server/session';
import { buildSnapshot } from '@/server/snapshot';
import { broadcast } from '@/server/sse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };
const ROLES = new Set(['TANK', 'DPS', 'SUPPORT']);

export async function PATCH(req: Request, ctx: Ctx) {
  const s = await getSession();
  if (s?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await ctx.params;
  const body = await req.json();

  const data: {
    name?: string;
    avatarUrl?: string;
    role?: 'TANK' | 'DPS' | 'SUPPORT';
    mostPicks?: string[];
    order?: number;
    tankTier?: string;
    dpsTier?: string;
    supportTier?: string;
    intro?: string;
  } = {};
  if (typeof body.name === 'string') data.name = body.name;
  if (typeof body.avatarUrl === 'string') data.avatarUrl = body.avatarUrl;
  if (typeof body.role === 'string' && ROLES.has(body.role)) data.role = body.role;
  if (Array.isArray(body.mostPicks))
    data.mostPicks = body.mostPicks.filter((u: unknown): u is string => typeof u === 'string' && u.length > 0);
  if (typeof body.order === 'number') data.order = body.order;
  if (typeof body.tankTier === 'string') data.tankTier = body.tankTier;
  if (typeof body.dpsTier === 'string') data.dpsTier = body.dpsTier;
  if (typeof body.supportTier === 'string') data.supportTier = body.supportTier;
  if (typeof body.intro === 'string') data.intro = body.intro;

  await prisma.player.update({ where: { id }, data });
  broadcast(await buildSnapshot());
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const s = await getSession();
  if (s?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await ctx.params;
  await prisma.player.delete({ where: { id } });
  broadcast(await buildSnapshot());
  return NextResponse.json({ ok: true });
}
