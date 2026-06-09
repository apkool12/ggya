import { expect, test } from 'vitest';
import { signSession, verifySession } from './auth';

test('세션 토큰 발급/검증 라운드트립', async () => {
  const token = await signSession({
    sub: 'u1',
    role: 'LEADER',
    teamId: 't1',
    username: 'leader1',
  });
  const payload = await verifySession(token);
  expect(payload?.sub).toBe('u1');
  expect(payload?.role).toBe('LEADER');
  expect(payload?.teamId).toBe('t1');
});

test('변조 토큰은 null', async () => {
  expect(await verifySession('not-a-jwt')).toBeNull();
});
