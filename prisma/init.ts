import 'dotenv/config';
import { prisma } from '../src/server/db';
import { seedData } from './seedData';

/**
 * 배포 시작 시 호출되는 안전한 초기화.
 * DB가 비어 있을 때만 시드한다. 데이터가 이미 있으면 아무것도 지우지 않고 건너뛴다.
 * → 매 재배포/재시작마다 실행돼도 라이브 데이터를 보존한다.
 */
async function main() {
  const teams = await prisma.team.count();
  if (teams > 0) {
    console.log(`[init] 기존 데이터 감지(teams=${teams}) — 시드 건너뜀.`);
    return;
  }
  console.log('[init] 빈 DB 감지 — 초기 시드 실행.');
  await seedData();
  console.log('[init] 초기 시드 완료.');
}

main()
  .catch((e) => {
    console.error('[init] 시드 실패:', e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
