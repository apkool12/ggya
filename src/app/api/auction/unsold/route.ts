import { NextResponse } from 'next/server';
import { markUnsold } from '@/server/auctionEngine';
import { getSession } from '@/server/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const s = await getSession();
  if (s?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await markUnsold();
  return NextResponse.json({ ok: true });
}
