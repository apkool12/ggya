import { NextResponse } from 'next/server';
import { drawRandomPlayer } from '@/server/auctionEngine';
import { getSession } from '@/server/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const s = await getSession();
  if (s?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const r = await drawRandomPlayer();
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
