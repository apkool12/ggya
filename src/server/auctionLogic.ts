import { MIN_STARTING_BID, ROSTER_SIZE } from '../auction/constants';

/**
 * 로스터: 슬롯 0은 팀장 전용으로 예약하고, 낙찰 선수는 1..ROSTER_SIZE-1 중
 * 가장 낮은 빈 슬롯에 배정한다. 가득 찼으면 -1.
 */
export function findFreeSlot(occupied: number[]): number {
  for (let idx = 1; idx < ROSTER_SIZE; idx++) {
    if (!occupied.includes(idx)) return idx;
  }
  return -1;
}

export interface BidInput {
  phase: 'IDLE' | 'BIDDING' | 'AWAITING_CONFIRM' | 'DRAFTING';
  hasActivePlayer: boolean;
  currentBid: number;
  amount: number;
  teamPoints: number;
  teamOccupiedSlots: number[];
}

export type BidResult = { ok: true; newBid: number } | { ok: false; error: string };

export function validateBid(i: BidInput): BidResult {
  if (i.phase !== 'BIDDING' || !i.hasActivePlayer)
    return { ok: false, error: '현재 입찰 가능한 선수가 없습니다.' };
  if (i.amount <= 0) return { ok: false, error: '증액은 0보다 커야 합니다.' };
  const newBid = i.currentBid + i.amount;
  if (newBid < MIN_STARTING_BID)
    return { ok: false, error: `최소 시작가는 ${MIN_STARTING_BID}P입니다.` };
  if (findFreeSlot(i.teamOccupiedSlots) === -1)
    return { ok: false, error: '로스터가 가득 찼습니다.' };
  if (i.teamPoints < newBid)
    return { ok: false, error: '잔여 포인트가 부족합니다.' };
  return { ok: true, newBid };
}

export function resolveExpiry(hasBidder: boolean): 'AWAITING_CONFIRM' | 'UNSOLD' {
  return hasBidder ? 'AWAITING_CONFIRM' : 'UNSOLD';
}
