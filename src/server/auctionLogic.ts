import { MIN_STARTING_BID } from '../auction/constants';
import { SLOT_INDEXES, type PlayerRoleEn } from '../shared/roles';

export function findEmptySlot(occupied: number[], role: PlayerRoleEn): number {
  for (const idx of SLOT_INDEXES[role]) {
    if (!occupied.includes(idx)) return idx;
  }
  return -1;
}

export interface BidInput {
  phase: 'IDLE' | 'BIDDING' | 'AWAITING_CONFIRM';
  activePlayerRole: PlayerRoleEn | null;
  currentBid: number;
  amount: number;
  teamPoints: number;
  teamOccupiedSlots: number[];
}

export type BidResult = { ok: true; newBid: number } | { ok: false; error: string };

export function validateBid(i: BidInput): BidResult {
  if (i.phase !== 'BIDDING' || !i.activePlayerRole)
    return { ok: false, error: '현재 입찰 가능한 선수가 없습니다.' };
  if (i.amount <= 0) return { ok: false, error: '증액은 0보다 커야 합니다.' };
  const newBid = i.currentBid + i.amount;
  if (newBid < MIN_STARTING_BID)
    return { ok: false, error: `최소 시작가는 ${MIN_STARTING_BID}P입니다.` };
  if (findEmptySlot(i.teamOccupiedSlots, i.activePlayerRole) === -1)
    return { ok: false, error: '해당 포지션 로스터가 가득 찼습니다.' };
  if (i.teamPoints < newBid)
    return { ok: false, error: '잔여 포인트가 부족합니다.' };
  return { ok: true, newBid };
}

export function resolveExpiry(hasBidder: boolean): 'AWAITING_CONFIRM' | 'UNSOLD' {
  return hasBidder ? 'AWAITING_CONFIRM' : 'UNSOLD';
}
