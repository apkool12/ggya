import { expect, test } from 'vitest';
import { findFreeSlot, resolveExpiry, validateBid } from './auctionLogic';

test('findFreeSlot: 슬롯 0은 팀장 예약 → 1번부터 채움', () => {
  expect(findFreeSlot([])).toBe(1);
  expect(findFreeSlot([1])).toBe(2);
  expect(findFreeSlot([1, 2, 3, 4])).toBe(-1);
});

test('validateBid: 정상 입찰가 증액', () => {
  const r = validateBid({
    phase: 'BIDDING',
    hasActivePlayer: true,
    currentBid: 0,
    amount: 5,
    teamPoints: 1000,
    teamOccupiedSlots: [],
  });
  expect(r.ok).toBe(true);
  if (r.ok) expect(r.newBid).toBe(5);
});

test('validateBid: 활성 선수 없으면 거절', () => {
  const r = validateBid({
    phase: 'IDLE',
    hasActivePlayer: false,
    currentBid: 0,
    amount: 5,
    teamPoints: 1000,
    teamOccupiedSlots: [],
  });
  expect(r.ok).toBe(false);
});

test('validateBid: 포인트 부족 거절', () => {
  const r = validateBid({
    phase: 'BIDDING',
    hasActivePlayer: true,
    currentBid: 900,
    amount: 200,
    teamPoints: 1000,
    teamOccupiedSlots: [],
  });
  expect(r.ok).toBe(false);
});

test('validateBid: 로스터 만석 거절', () => {
  const r = validateBid({
    phase: 'BIDDING',
    hasActivePlayer: true,
    currentBid: 0,
    amount: 5,
    teamPoints: 1000,
    teamOccupiedSlots: [0, 1, 2, 3, 4],
  });
  expect(r.ok).toBe(false);
});

test('resolveExpiry: 입찰자 있으면 확정대기', () => {
  expect(resolveExpiry(true)).toBe('AWAITING_CONFIRM');
});
test('resolveExpiry: 입찰자 없으면 유찰', () => {
  expect(resolveExpiry(false)).toBe('UNSOLD');
});
