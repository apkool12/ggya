import { NextResponse } from 'next/server';
import { drawNextDraftPlayer } from '@/server/auctionEngine';
import { getSession } from '@/server/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const s = await getSession();
  if (s?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const r = await drawNextDraftPlayer();
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
    return NextResponse.json({ ok: true, player: r.player });
  } catch (err: any) {
    console.error('Error in /api/auction/draft/draw:', err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
