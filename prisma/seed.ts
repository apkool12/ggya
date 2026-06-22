import 'dotenv/config';
import { prisma } from '../src/server/db';
import { seedData } from './seedData';

async function main() {
  // 개발 편의: 전부 비우고 다시 시드 (파괴적 — 운영 DB에서 직접 쓰지 말 것)
  await prisma.player.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();
  await prisma.logEntry.deleteMany();

  await seedData();

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
