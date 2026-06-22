import { NextResponse } from 'next/server';
import { finishDraftingPhase, startNextPlayer } from '@/server/auctionEngine';
import { getSession } from '@/server/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const s = await getSession();
  if (s?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    await finishDraftingPhase();
    await startNextPlayer();
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Error in /api/auction/draft/finish:', err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
