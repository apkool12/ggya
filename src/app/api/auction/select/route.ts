import { NextResponse } from 'next/server';
import { selectPlayer } from '@/server/auctionEngine';
import { getSession } from '@/server/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const s = await getSession();
  if (s?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { playerId } = await req.json();
  if (!playerId) return NextResponse.json({ error: 'playerId 필요' }, { status: 400 });
  await selectPlayer(playerId);
  return NextResponse.json({ ok: true });
}
