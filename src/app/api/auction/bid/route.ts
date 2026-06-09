import { NextResponse } from 'next/server';
import { placeBid } from '@/server/auctionEngine';
import { getSession } from '@/server/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { teamId, amount } = await req.json();
  if (!teamId || typeof amount !== 'number')
    return NextResponse.json({ error: 'teamId/amount 필요' }, { status: 400 });
  if (s.role === 'LEADER' && s.teamId !== teamId)
    return NextResponse.json({ error: '본인 팀만 입찰할 수 있습니다.' }, { status: 403 });
  const r = await placeBid(teamId, amount);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
