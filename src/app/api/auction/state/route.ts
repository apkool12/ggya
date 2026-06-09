import { NextResponse } from 'next/server';
import { buildSnapshot } from '@/server/snapshot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(await buildSnapshot());
}
