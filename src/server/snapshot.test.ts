import { expect, test } from 'vitest';
import { buildRoster } from './snapshot';
import type { SnapPlayer } from '../shared/snapshot-types';

const mk = (id: string, role: SnapPlayer['role'], slot: number): SnapPlayer => ({
  id,
  name: id,
  role,
  avatarUrl: '',
  status: 'SOLD',
  cost: 10,
  teamId: 't1',
  slotIndex: slot,
  mostPicks: [],
});

test('buildRoster: 슬롯 인덱스 위치에 배치, 빈칸 null', () => {
  const roster = buildRoster([mk('a', 'TANK', 0), mk('b', 'DPS', 2)]);
  expect(roster).toHaveLength(5);
  expect(roster[0]?.id).toBe('a');
  expect(roster[1]).toBeNull();
  expect(roster[2]?.id).toBe('b');
  expect(roster[3]).toBeNull();
});
