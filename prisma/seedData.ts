import bcrypt from 'bcryptjs';
import {
  INITIAL_PLAYERS,
  INITIAL_TEAMS,
  PLAYER_MOST_PICKS,
} from '../src/auction/data';
import { koToRole } from '../src/shared/roles';
import { prisma } from '../src/server/db';

/**
 * 초기 데이터를 적재한다. (기존 데이터 삭제는 하지 않음 — 빈 DB 가정)
 * 파괴적 리셋(seed)과 빈-DB-전용 init 양쪽에서 공용으로 쓴다.
 */
export async function seedData() {
  // 팀 + 팀장 계정
  for (let i = 0; i < INITIAL_TEAMS.length; i++) {
    const t = INITIAL_TEAMS[i];
    const team = await prisma.team.create({
      data: {
        name: t.name,
        leaderName: t.leader,
        avatarUrl: t.avatar,
        startingPoints: t.points,
        points: t.points,
        order: i,
      },
    });
    await prisma.user.create({
      data: {
        username: `leader${i + 1}`,
        passwordHash: await bcrypt.hash('leader123', 10),
        role: 'LEADER',
        teamId: team.id,
      },
    });
  }

  // 선수
  for (let i = 0; i < INITIAL_PLAYERS.length; i++) {
    const p = INITIAL_PLAYERS[i];
    await prisma.player.create({
      data: {
        name: p.name,
        role: koToRole(p.role as '탱커' | '딜러' | '힐러'),
        avatarUrl: p.avatar,
        status: 'WAITING',
        order: i,
        mostPicks: [...(PLAYER_MOST_PICKS[p.id] ?? [])],
        tankTier: p.tankTier,
        dpsTier: p.dpsTier,
        supportTier: p.supportTier,
      },
    });
  }

  // 관리자
  await prisma.user.create({
    data: {
      username: process.env.ADMIN_USERNAME ?? 'admin',
      passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD ?? 'admin1234', 10),
      role: 'ADMIN',
    },
  });

  // 경매 상태 단일 행
  await prisma.auctionState.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, phase: 'IDLE' },
  });
}
