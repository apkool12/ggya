import { expect, test } from 'vitest';
import { koToRole, roleToKo, SLOT_INDEXES } from './roles';

test('역할 enum ↔ 한글 매핑', () => {
  expect(roleToKo('TANK')).toBe('탱커');
  expect(roleToKo('DPS')).toBe('딜러');
  expect(roleToKo('SUPPORT')).toBe('힐러');
  expect(koToRole('힐러')).toBe('SUPPORT');
});

test('슬롯 인덱스 매핑', () => {
  expect(SLOT_INDEXES.TANK).toEqual([0]);
  expect(SLOT_INDEXES.DPS).toEqual([1, 2]);
  expect(SLOT_INDEXES.SUPPORT).toEqual([3, 4]);
});
