import bcrypt from 'bcryptjs';
import {
  INITIAL_PLAYERS,
  INITIAL_TEAMS,
  PLAYER_MOST_PICKS,
} from '../src/auction/data';
import { koToRole } from '../src/shared/roles';
import { prisma } from '../src/server/db';

/** 팀 + 팀장 계정 적재. (빈 상태 가정 — 삭제하지 않음) */
export async function seedTeams() {
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
}

/** 선수 적재. (빈 상태 가정 — 삭제하지 않음) */
export async function seedPlayers() {
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
}

/**
 * 관리자 계정을 보장한다. (없으면 생성, 있으면 비밀번호를 env 값으로 갱신)
 * 데이터를 지우지 않으므로 매 시작마다 호출해도 안전하다 → 로그인 항상 가능.
 */
export async function ensureAdmin() {
  const username = process.env.ADMIN_USERNAME ?? 'admin';
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? 'admin1234', 10);
  await prisma.user.upsert({
    where: { username },
    update: { passwordHash, role: 'ADMIN' },
    create: { username, passwordHash, role: 'ADMIN' },
  });
}

/** 경매 상태 단일 행 보장. */
export async function ensureAuctionState() {
  await prisma.auctionState.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, phase: 'IDLE' },
  });
}

/**
 * 전체 초기 데이터 적재. (기존 데이터 삭제는 하지 않음 — 빈 DB 가정)
 * 파괴적 리셋(seed)에서 사용.
 */
export async function seedData() {
  await seedTeams();
  await seedPlayers();
  await ensureAdmin();
  await ensureAuctionState();
}
