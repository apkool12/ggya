import 'dotenv/config';
import { prisma } from '../src/server/db';
import { seedData, ensureAdmin } from './seedData';

/**
 * 배포 시작 시 호출되는 안전한 초기화.
 * - DB가 비어 있을 때만 전체 시드(팀/선수/상태). 데이터가 있으면 건너뜀(비파괴).
 * - 관리자 계정은 항상 보장(upsert)한다 → 어떤 상태에서도 관리자 로그인 가능.
 */
async function main() {
  const teams = await prisma.team.count();
  if (teams > 0) {
    console.log(`[init] 기존 데이터 감지(teams=${teams}) — 전체 시드 건너뜀.`);
  } else {
    console.log('[init] 빈 DB 감지 — 초기 시드 실행.');
    await seedData();
    console.log('[init] 초기 시드 완료.');
  }

  // 데이터 유무와 무관하게 관리자 계정 보장
  await ensureAdmin();
  console.log(`[init] 관리자 계정 보장 완료 (username="${process.env.ADMIN_USERNAME ?? 'admin'}").`);
}

main()
  .catch((e) => {
    console.error('[init] 시드 실패:', e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
