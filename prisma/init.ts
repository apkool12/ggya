import 'dotenv/config';
import { prisma } from '../src/server/db';
import {
  seedTeams,
  seedPlayers,
  ensureAdmin,
  ensureAuctionState,
} from './seedData';

/**
 * 배포 시작 시 호출되는 안전한 초기화 (자가 치유).
 * 엔티티별로 "비어 있을 때만" 채운다 → 기존 데이터는 절대 지우지 않으면서,
 * 부분적으로만 시드된 깨진 상태(예: 팀만 있고 선수 없음)도 자동 복구한다.
 */
async function main() {
  const [teams, players] = await Promise.all([
    prisma.team.count(),
    prisma.player.count(),
  ]);

  if (teams === 0) {
    console.log('[init] 팀 없음 — 팀/팀장 시드.');
    await seedTeams();
  }
  if (players === 0) {
    console.log('[init] 선수 없음 — 선수 시드.');
    await seedPlayers();
  }

  await ensureAdmin();
  await ensureAuctionState();

  const [t2, p2] = await Promise.all([
    prisma.team.count(),
    prisma.player.count(),
  ]);
  console.log(`[init] 완료. teams=${t2}, players=${p2}, admin="${process.env.ADMIN_USERNAME ?? 'admin'}".`);
}

main()
  .catch((e) => {
    console.error('[init] 실패:', e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
