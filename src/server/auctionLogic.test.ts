import { expect, test } from 'vitest';
import { findEmptySlot, resolveExpiry, validateBid } from './auctionLogic';

test('findEmptySlot: 딜러 첫 슬롯', () => {
  expect(findEmptySlot([], 'DPS')).toBe(1);
  expect(findEmptySlot([1], 'DPS')).toBe(2);
  expect(findEmptySlot([1, 2], 'DPS')).toBe(-1);
});

test('validateBid: 정상 입찰가 증액', () => {
  const r = validateBid({
    phase: 'BIDDING',
    activePlayerRole: 'DPS',
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
    activePlayerRole: null,
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
    activePlayerRole: 'TANK',
    currentBid: 900,
    amount: 200,
    teamPoints: 1000,
    teamOccupiedSlots: [],
  });
  expect(r.ok).toBe(false);
});

test('validateBid: 포지션 만석 거절', () => {
  const r = validateBid({
    phase: 'BIDDING',
    activePlayerRole: 'TANK',
    currentBid: 0,
    amount: 5,
    teamPoints: 1000,
    teamOccupiedSlots: [0],
  });
  expect(r.ok).toBe(false);
});

test('resolveExpiry: 입찰자 있으면 확정대기', () => {
  expect(resolveExpiry(true)).toBe('AWAITING_CONFIRM');
});
test('resolveExpiry: 입찰자 없으면 유찰', () => {
  expect(resolveExpiry(false)).toBe('UNSOLD');
});
