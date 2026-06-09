# 경매 대시보드 풀스택화 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 클라이언트 전용 오버워치 경매 목업을 Next + Node 백엔드(PostgreSQL, Prisma) + SSE 실시간 + 역할 기반 인증(관리자/팀장) 풀스택 앱으로 전환하고, 입찰/낙찰/타이머 로직 버그를 고치고, 전체 디자인을 폴리시한다.

**Architecture:** Next 16 App Router의 Route Handler(Node 런타임)가 백엔드. 경매 상태는 PostgreSQL에 영속(Prisma). 모듈 싱글톤 "경매 엔진"이 상태 변경을 트랜잭션으로 처리하고 서버 권위 타이머를 돌리며, 인메모리 SSE 버스로 모든 접속 클라이언트에 스냅샷을 푸시한다. 인증은 httpOnly 쿠키 JWT(jose) + bcryptjs 해시. 프론트는 초기 스냅샷 fetch + EventSource 구독으로 상태를 받고, 액션은 API POST로 보낸다.

**Tech Stack:** Next 16.2.6, React 19, MUI 9, PostgreSQL, Prisma, jose(JWT), bcryptjs, vitest(테스트), tsx(seed/script).

---

## 참고 / 규약

- 코드 작성 전 반드시 `node_modules/next/dist/docs/`의 관련 가이드를 확인(특히 route handler, cookies, 미들웨어, route segment config). AGENTS.md 지시 준수.
- 역할 enum(DB): `TANK | DPS | SUPPORT`. 화면 표시: `탱커 | 딜러 | 힐러`. 매핑은 `src/shared/roles.ts`에 단일 정의.
- 슬롯 매핑(고정): `TANK → [0]`, `DPS → [1,2]`, `SUPPORT → [3,4]` (로스터 5칸).
- 상태 phase: `IDLE | BIDDING | AWAITING_CONFIRM`.
- 시작점/상수는 기존 `src/auction/constants.ts`의 값 재사용: `STARTING_POINTS=1000`, `ROSTER_SIZE=5`, `MIN_STARTING_BID=5`, `BID_INCREMENTS=[5,10,50,100]`, `TIMER_INITIAL_SECONDS=15`.
- 현재 디렉터리는 git 저장소가 아님 → Task 0에서 `git init`. 테스트 프레임워크 없음 → Task 0에서 vitest 도입.

---

## Phase 0 — 툴링 / 의존성

### Task 0.1: git 초기화 및 .gitignore 확인

**Files:**
- Modify: `.gitignore` (이미 존재, `.env*` 포함 여부 확인)

- [ ] **Step 1: git 저장소 초기화**

Run:
```bash
cd /Users/eunsik/Desktop/Dev/e-sport && git init
```
Expected: `Initialized empty Git repository ...`

- [ ] **Step 2: .gitignore에 env/prisma 산출물 보장**

`.gitignore`에 아래 줄이 없으면 추가:
```
.env
.env*.local
/prisma/*.db
```
(`node_modules`, `.next`는 기존에 있는지 확인하고 없으면 추가.)

- [ ] **Step 3: 최초 커밋**

```bash
git add -A && git commit -m "chore: init git repo for fullstack migration"
```

### Task 0.2: 백엔드/테스트 의존성 설치

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 런타임 의존성 설치**

```bash
npm install @prisma/client pg jose bcryptjs
```

- [ ] **Step 2: 개발 의존성 설치**

```bash
npm install -D prisma tsx vitest @types/pg @types/bcryptjs
```

- [ ] **Step 3: package.json scripts 추가**

`scripts`에 추가:
```json
"test": "vitest run",
"test:watch": "vitest",
"db:migrate": "prisma migrate dev",
"db:seed": "tsx prisma/seed.ts",
"db:generate": "prisma generate"
```
그리고 최상위에 prisma seed 설정 추가:
```json
"prisma": { "seed": "tsx prisma/seed.ts" }
```

- [ ] **Step 4: 커밋**

```bash
git add package.json package-lock.json && git commit -m "chore: add backend + test deps"
```

### Task 0.3: vitest 설정

**Files:**
- Create: `vitest.config.ts`

- [ ] **Step 1: 설정 작성**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 2: 동작 확인용 임시 테스트**

Create `src/shared/smoke.test.ts`:
```ts
import { expect, test } from 'vitest';
test('vitest works', () => { expect(1 + 1).toBe(2); });
```
Run: `npm test` → Expected: PASS (1 passed). 확인 후 이 파일 삭제.

- [ ] **Step 3: 커밋**

```bash
git add vitest.config.ts && git commit -m "chore: configure vitest"
```

---

## Phase 1 — 데이터베이스 / Prisma

### Task 1.1: 로컬 Postgres 설치 및 DB 생성

**Files:** 없음 (환경 셋업)

- [ ] **Step 1: Postgres 설치/기동** (사용자 환경에 미설치 확인됨)

Run:
```bash
brew install postgresql@16 && brew services start postgresql@16
```
설치 후 `psql`이 PATH에 없으면 `echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc`.

- [ ] **Step 2: DB 생성**

Run:
```bash
createdb e_sport
```
Expected: 오류 없이 종료. 확인: `psql -d e_sport -c '\conninfo'`.

> 사용자가 직접 실행해야 하면 프롬프트에 `! brew install ...` 형태로 안내.

### Task 1.2: 환경변수 파일

**Files:**
- Create: `.env`
- Create: `.env.example`

- [ ] **Step 1: .env.example 작성**

```
DATABASE_URL="postgresql://localhost:5432/e_sport"
JWT_SECRET="change-me-to-a-long-random-string"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin1234"
```

- [ ] **Step 2: .env 작성** (로컬 실제값. macOS Homebrew는 보통 현재 OS 유저가 superuser)

```
DATABASE_URL="postgresql://localhost:5432/e_sport"
JWT_SECRET="dev-secret-please-rotate-aaaaaaaaaaaaaaaaaaaaaaaa"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin1234"
```
연결 실패 시 `postgresql://<현재유저>@localhost:5432/e_sport`로 조정.

- [ ] **Step 3: 커밋** (`.env`는 gitignore됨)

```bash
git add .env.example && git commit -m "chore: add env example"
```

### Task 1.3: Prisma 스키마

**Files:**
- Create: `prisma/schema.prisma`

- [ ] **Step 1: 스키마 작성**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  LEADER
}

enum PlayerRole {
  TANK
  DPS
  SUPPORT
}

enum PlayerStatus {
  WAITING
  ACTIVE
  SOLD
  UNSOLD
}

enum AuctionPhase {
  IDLE
  BIDDING
  AWAITING_CONFIRM
}

model User {
  id           String  @id @default(cuid())
  username     String  @unique
  passwordHash String
  role         Role
  team         Team?   @relation(fields: [teamId], references: [id], onDelete: SetNull)
  teamId       String? @unique
  createdAt    DateTime @default(now())
}

model Team {
  id             String   @id @default(cuid())
  name           String
  leaderName     String
  avatarUrl      String
  startingPoints Int      @default(1000)
  points         Int      @default(1000)
  order          Int      @default(0)
  createdAt      DateTime @default(now())
  leaderAccount  User?
  roster         Player[]
}

model Player {
  id         String       @id @default(cuid())
  name       String
  role       PlayerRole
  avatarUrl  String
  status     PlayerStatus @default(WAITING)
  cost       Int?
  team       Team?        @relation(fields: [teamId], references: [id], onDelete: SetNull)
  teamId     String?
  slotIndex  Int?
  order      Int          @default(0)
  mostPicks  String[]     @default([])
}

model AuctionState {
  id                  Int          @id @default(1)
  phase               AuctionPhase @default(IDLE)
  activePlayerId      String?
  currentBid          Int          @default(0)
  highestBidderTeamId String?
  bidDeadline         DateTime?
  updatedAt           DateTime     @updatedAt
}

model LogEntry {
  id        Int      @id @default(autoincrement())
  message   String
  createdAt DateTime @default(now())
}
```

- [ ] **Step 2: 마이그레이션 생성 + 클라이언트 생성**

Run:
```bash
npm run db:migrate -- --name init
```
Expected: `prisma/migrations/<ts>_init/` 생성, "Your database is now in sync", Prisma Client 생성됨.

- [ ] **Step 3: 커밋**

```bash
git add prisma/schema.prisma prisma/migrations && git commit -m "feat(db): prisma schema + initial migration"
```

### Task 1.4: 공유 역할 매핑

**Files:**
- Create: `src/shared/roles.ts`
- Test: `src/shared/roles.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

```ts
import { expect, test } from 'vitest';
import { roleToKo, koToRole, SLOT_INDEXES } from './roles';

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
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- roles` → Expected: FAIL (Cannot find module './roles').

- [ ] **Step 3: 구현**

```ts
export type PlayerRoleEn = 'TANK' | 'DPS' | 'SUPPORT';
export type PlayerRoleKo = '탱커' | '딜러' | '힐러';

const EN_TO_KO: Record<PlayerRoleEn, PlayerRoleKo> = {
  TANK: '탱커', DPS: '딜러', SUPPORT: '힐러',
};
const KO_TO_EN: Record<PlayerRoleKo, PlayerRoleEn> = {
  탱커: 'TANK', 딜러: 'DPS', 힐러: 'SUPPORT',
};

export const SLOT_INDEXES: Record<PlayerRoleEn, number[]> = {
  TANK: [0], DPS: [1, 2], SUPPORT: [3, 4],
};

export const roleToKo = (r: PlayerRoleEn): PlayerRoleKo => EN_TO_KO[r];
export const koToRole = (r: PlayerRoleKo): PlayerRoleEn => KO_TO_EN[r];
```

- [ ] **Step 4: 통과 확인 + 커밋**

Run: `npm test -- roles` → PASS.
```bash
git add src/shared/roles.ts src/shared/roles.test.ts && git commit -m "feat: shared role mapping"
```

### Task 1.5: 시드 스크립트

**Files:**
- Create: `prisma/seed.ts`

- [ ] **Step 1: 시드 작성** (기존 `src/auction/data.ts`의 팀4·선수14·mostPicks·OW URL을 이전. 선수 `order`는 배열 인덱스, status WAITING.)

```ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { INITIAL_PLAYERS, INITIAL_TEAMS, PLAYER_MOST_PICKS } from '../src/auction/data';
import { koToRole } from '../src/shared/roles';

const prisma = new PrismaClient();

async function main() {
  // 초기화 (개발 편의)
  await prisma.player.deleteMany();
  await prisma.user.deleteMany();
  await prisma.team.deleteMany();
  await prisma.logEntry.deleteMany();

  // 팀 + 팀장 계정
  for (let i = 0; i < INITIAL_TEAMS.length; i++) {
    const t = INITIAL_TEAMS[i];
    const team = await prisma.team.create({
      data: {
        name: t.name, leaderName: t.leader, avatarUrl: t.avatar,
        startingPoints: t.points, points: t.points, order: i,
      },
    });
    // 팀장 계정: username = leader_<순번>, 기본 비번 leader123
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
    where: { id: 1 }, update: {}, create: { id: 1, phase: 'IDLE' },
  });

  console.log('Seed complete.');
}

main().finally(() => prisma.$disconnect());
```

- [ ] **Step 2: 시드 실행**

Run: `npm run db:seed`
Expected: `Seed complete.` 확인: `psql -d e_sport -c 'select count(*) from "Player";'` → 14.

- [ ] **Step 3: 커밋**

```bash
git add prisma/seed.ts && git commit -m "feat(db): seed teams/players/users from data.ts"
```

---

## Phase 2 — 서버 코어 (DB 클라이언트 · 인증)

### Task 2.1: Prisma 클라이언트 싱글톤

**Files:**
- Create: `src/server/db.ts`

- [ ] **Step 1: 작성** (dev HMR에서 커넥션 폭증 방지 표준 패턴)

```ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

- [ ] **Step 2: 커밋**

```bash
git add src/server/db.ts && git commit -m "feat(server): prisma client singleton"
```

### Task 2.2: 세션/인증 유틸 (순수 로직 + jose)

**Files:**
- Create: `src/server/auth.ts`
- Test: `src/server/auth.test.ts`

- [ ] **Step 1: 실패 테스트 작성** (JWT 발급/검증 라운드트립)

```ts
import { expect, test } from 'vitest';
import { signSession, verifySession } from './auth';

test('세션 토큰 발급/검증 라운드트립', async () => {
  const token = await signSession({ sub: 'u1', role: 'LEADER', teamId: 't1', username: 'leader1' });
  const payload = await verifySession(token);
  expect(payload?.sub).toBe('u1');
  expect(payload?.role).toBe('LEADER');
  expect(payload?.teamId).toBe('t1');
});

test('변조 토큰은 null', async () => {
  expect(await verifySession('not-a-jwt')).toBeNull();
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- auth` → FAIL (모듈 없음).

- [ ] **Step 3: 구현** (테스트는 JWT_SECRET 필요 → vitest.config의 env 또는 기본값 처리)

```ts
import { SignJWT, jwtVerify } from 'jose';

export interface SessionPayload {
  sub: string;
  role: 'ADMIN' | 'LEADER';
  teamId?: string;
  username: string;
}

const secret = () =>
  new TextEncoder().encode(process.env.JWT_SECRET ?? 'dev-secret-please-rotate-aaaaaaaaaaaaaaaaaaaaaaaa');

export const SESSION_COOKIE = 'ow_session';

export async function signSession(p: SessionPayload): Promise<string> {
  return new SignJWT({ role: p.role, teamId: p.teamId, username: p.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(p.sub)
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(secret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      sub: String(payload.sub),
      role: payload.role as 'ADMIN' | 'LEADER',
      teamId: payload.teamId as string | undefined,
      username: payload.username as string,
    };
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: 통과 확인 + 커밋**

Run: `npm test -- auth` → PASS.
```bash
git add src/server/auth.ts src/server/auth.test.ts && git commit -m "feat(server): jwt session sign/verify"
```

### Task 2.3: 요청에서 현재 세션 읽기 헬퍼

**Files:**
- Create: `src/server/session.ts`

- [ ] **Step 1: 작성** (route handler에서 사용; `cookies()` 사용법은 `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md` 확인)

```ts
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySession, type SessionPayload } from './auth';

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function requireAdmin(): Promise<SessionPayload> {
  const s = await getSession();
  if (!s || s.role !== 'ADMIN') throw new Response('Forbidden', { status: 403 });
  return s;
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/server/session.ts && git commit -m "feat(server): session reader + requireAdmin guard"
```

---

## Phase 3 — 경매 엔진 (순수 로직 + 싱글톤 + SSE + 타이머)

### Task 3.1: 입찰/슬롯/만료 순수 로직

**Files:**
- Create: `src/server/auctionLogic.ts`
- Test: `src/server/auctionLogic.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

```ts
import { expect, test } from 'vitest';
import { findEmptySlot, validateBid, resolveExpiry } from './auctionLogic';

test('findEmptySlot: 딜러 첫 슬롯', () => {
  expect(findEmptySlot([], 'DPS')).toBe(1);
  expect(findEmptySlot([1], 'DPS')).toBe(2);
  expect(findEmptySlot([1, 2], 'DPS')).toBe(-1);
});

test('validateBid: 정상 입찰가 증액', () => {
  const r = validateBid({
    phase: 'BIDDING', activePlayerRole: 'DPS', currentBid: 0, amount: 5,
    teamPoints: 1000, teamOccupiedSlots: [],
  });
  expect(r.ok).toBe(true);
  if (r.ok) expect(r.newBid).toBe(5);
});

test('validateBid: 활성 선수 없으면 거절', () => {
  const r = validateBid({
    phase: 'IDLE', activePlayerRole: null, currentBid: 0, amount: 5,
    teamPoints: 1000, teamOccupiedSlots: [],
  });
  expect(r.ok).toBe(false);
});

test('validateBid: 포인트 부족 거절', () => {
  const r = validateBid({
    phase: 'BIDDING', activePlayerRole: 'TANK', currentBid: 900, amount: 200,
    teamPoints: 1000, teamOccupiedSlots: [],
  });
  expect(r.ok).toBe(false);
});

test('validateBid: 포지션 만석 거절', () => {
  const r = validateBid({
    phase: 'BIDDING', activePlayerRole: 'TANK', currentBid: 0, amount: 5,
    teamPoints: 1000, teamOccupiedSlots: [0],
  });
  expect(r.ok).toBe(false);
});

test('resolveExpiry: 입찰자 있으면 확정대기', () => {
  expect(resolveExpiry(true)).toBe('AWAITING_CONFIRM');
});
test('resolveExpiry: 입찰자 없으면 유찰', () => {
  expect(resolveExpiry(false)).toBe('UNSOLD');
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm test -- auctionLogic` → FAIL.

- [ ] **Step 3: 구현**

```ts
import { SLOT_INDEXES, type PlayerRoleEn } from '../shared/roles';
import { MIN_STARTING_BID } from '../auction/constants';

export function findEmptySlot(occupied: number[], role: PlayerRoleEn): number {
  for (const idx of SLOT_INDEXES[role]) {
    if (!occupied.includes(idx)) return idx;
  }
  return -1;
}

export interface BidInput {
  phase: 'IDLE' | 'BIDDING' | 'AWAITING_CONFIRM';
  activePlayerRole: PlayerRoleEn | null;
  currentBid: number;
  amount: number;
  teamPoints: number;
  teamOccupiedSlots: number[];
}
export type BidResult = { ok: true; newBid: number } | { ok: false; error: string };

export function validateBid(i: BidInput): BidResult {
  if (i.phase !== 'BIDDING' || !i.activePlayerRole)
    return { ok: false, error: '현재 입찰 가능한 선수가 없습니다.' };
  if (i.amount <= 0) return { ok: false, error: '증액은 0보다 커야 합니다.' };
  const newBid = i.currentBid + i.amount;
  if (newBid < MIN_STARTING_BID)
    return { ok: false, error: `최소 시작가는 ${MIN_STARTING_BID}P입니다.` };
  if (findEmptySlot(i.teamOccupiedSlots, i.activePlayerRole) === -1)
    return { ok: false, error: '해당 포지션 로스터가 가득 찼습니다.' };
  if (i.teamPoints < newBid)
    return { ok: false, error: '잔여 포인트가 부족합니다.' };
  return { ok: true, newBid };
}

export function resolveExpiry(hasBidder: boolean): 'AWAITING_CONFIRM' | 'UNSOLD' {
  return hasBidder ? 'AWAITING_CONFIRM' : 'UNSOLD';
}
```

- [ ] **Step 4: 통과 확인 + 커밋**

Run: `npm test -- auctionLogic` → PASS.
```bash
git add src/server/auctionLogic.ts src/server/auctionLogic.test.ts && git commit -m "feat(server): pure auction bid/slot/expiry logic"
```

### Task 3.2: SSE 이벤트 버스

**Files:**
- Create: `src/server/sse.ts`

- [ ] **Step 1: 작성** (인메모리 구독자 집합. 단일 프로세스 한정 — 문서화된 한계.)

```ts
type Subscriber = (data: string) => void;

const subscribers = new Set<Subscriber>();

export function subscribe(fn: Subscriber): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

export function broadcast(snapshot: unknown): void {
  const payload = `data: ${JSON.stringify(snapshot)}\n\n`;
  for (const fn of subscribers) {
    try { fn(payload); } catch { /* dropped client */ }
  }
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/server/sse.ts && git commit -m "feat(server): in-memory SSE event bus"
```

### Task 3.3: 스냅샷 빌더

**Files:**
- Create: `src/server/snapshot.ts`
- Test: `src/server/snapshot.test.ts`

스냅샷은 클라이언트가 받는 단일 상태 객체. 프론트 타입과 공유하기 위해 `src/shared/snapshot-types.ts`에 타입 정의.

- [ ] **Step 1: 공유 타입 작성** — Create `src/shared/snapshot-types.ts`

```ts
import type { PlayerRoleEn } from './roles';

export interface SnapPlayer {
  id: string; name: string; role: PlayerRoleEn; avatarUrl: string;
  status: 'WAITING' | 'ACTIVE' | 'SOLD' | 'UNSOLD';
  cost: number | null; teamId: string | null; slotIndex: number | null;
  mostPicks: string[];
}
export interface SnapTeam {
  id: string; name: string; leaderName: string; avatarUrl: string;
  points: number; startingPoints: number;
  roster: (SnapPlayer | null)[]; // 길이 5, 슬롯 인덱스 위치
}
export interface AuctionSnapshot {
  teams: SnapTeam[];
  players: SnapPlayer[];
  phase: 'IDLE' | 'BIDDING' | 'AWAITING_CONFIRM';
  activePlayerId: string | null;
  currentBid: number;
  highestBidderTeamId: string | null;
  bidDeadline: string | null; // ISO
  logs: string[];
  serverNow: string; // ISO, 클라이언트 시계 보정용
}
```

- [ ] **Step 2: 실패 테스트 작성** (로스터 슬롯 배치 검증) — `src/server/snapshot.test.ts`

```ts
import { expect, test } from 'vitest';
import { buildRoster } from './snapshot';
import type { SnapPlayer } from '../shared/snapshot-types';

const mk = (id: string, role: SnapPlayer['role'], slot: number): SnapPlayer => ({
  id, name: id, role, avatarUrl: '', status: 'SOLD', cost: 10,
  teamId: 't1', slotIndex: slot, mostPicks: [],
});

test('buildRoster: 슬롯 인덱스 위치에 배치, 빈칸 null', () => {
  const roster = buildRoster([mk('a', 'TANK', 0), mk('b', 'DPS', 2)]);
  expect(roster).toHaveLength(5);
  expect(roster[0]?.id).toBe('a');
  expect(roster[1]).toBeNull();
  expect(roster[2]?.id).toBe('b');
  expect(roster[3]).toBeNull();
});
```

- [ ] **Step 3: 실패 확인**

Run: `npm test -- snapshot` → FAIL.

- [ ] **Step 4: 구현** — `src/server/snapshot.ts`

```ts
import { prisma } from './db';
import { ROSTER_SIZE } from '../auction/constants';
import type { AuctionSnapshot, SnapPlayer, SnapTeam } from '../shared/snapshot-types';

export function buildRoster(teamPlayers: SnapPlayer[]): (SnapPlayer | null)[] {
  const roster: (SnapPlayer | null)[] = Array.from({ length: ROSTER_SIZE }, () => null);
  for (const p of teamPlayers) {
    if (p.slotIndex != null && p.slotIndex >= 0 && p.slotIndex < ROSTER_SIZE) {
      roster[p.slotIndex] = p;
    }
  }
  return roster;
}

const toSnapPlayer = (p: {
  id: string; name: string; role: 'TANK' | 'DPS' | 'SUPPORT'; avatarUrl: string;
  status: 'WAITING' | 'ACTIVE' | 'SOLD' | 'UNSOLD'; cost: number | null;
  teamId: string | null; slotIndex: number | null; mostPicks: string[];
}): SnapPlayer => ({ ...p });

export async function buildSnapshot(): Promise<AuctionSnapshot> {
  const [teams, players, state, logs] = await Promise.all([
    prisma.team.findMany({ orderBy: { order: 'asc' }, include: { roster: true } }),
    prisma.player.findMany({ orderBy: { order: 'asc' } }),
    prisma.auctionState.findUnique({ where: { id: 1 } }),
    prisma.logEntry.findMany({ orderBy: { id: 'desc' }, take: 40 }),
  ]);

  const snapTeams: SnapTeam[] = teams.map((t) => ({
    id: t.id, name: t.name, leaderName: t.leaderName, avatarUrl: t.avatarUrl,
    points: t.points, startingPoints: t.startingPoints,
    roster: buildRoster(t.roster.map(toSnapPlayer)),
  }));

  return {
    teams: snapTeams,
    players: players.map(toSnapPlayer),
    phase: state?.phase ?? 'IDLE',
    activePlayerId: state?.activePlayerId ?? null,
    currentBid: state?.currentBid ?? 0,
    highestBidderTeamId: state?.highestBidderTeamId ?? null,
    bidDeadline: state?.bidDeadline ? state.bidDeadline.toISOString() : null,
    logs: logs.reverse().map((l) => l.message),
    serverNow: new Date().toISOString(),
  };
}
```

- [ ] **Step 5: 통과 확인 + 커밋**

Run: `npm test -- snapshot` → PASS.
```bash
git add src/server/snapshot.ts src/server/snapshot.test.ts src/shared/snapshot-types.ts && git commit -m "feat(server): snapshot builder + shared types"
```

### Task 3.4: 경매 엔진 싱글톤 (상태 변경 + 서버 타이머 + 브로드캐스트)

**Files:**
- Create: `src/server/auctionEngine.ts`

각 액션은 Prisma 트랜잭션으로 DB를 바꾸고, 로그를 남기고, 새 스냅샷을 broadcast한다. 서버 타이머는 `bidDeadline`까지의 `setTimeout`을 들고 있다가 만료 시 `expire()`를 호출.

- [ ] **Step 1: 작성**

```ts
import { prisma } from './db';
import { broadcast } from './sse';
import { buildSnapshot } from './snapshot';
import { findEmptySlot, resolveExpiry, validateBid } from './auctionLogic';
import { TIMER_INITIAL_SECONDS } from '../auction/constants';

let expiryTimer: ReturnType<typeof setTimeout> | null = null;

async function addLog(message: string) {
  await prisma.logEntry.create({ data: { message } });
}

async function publish() {
  broadcast(await buildSnapshot());
}

function clearExpiryTimer() {
  if (expiryTimer) { clearTimeout(expiryTimer); expiryTimer = null; }
}

function armExpiryTimer(deadline: Date) {
  clearExpiryTimer();
  const ms = Math.max(0, deadline.getTime() - Date.now());
  expiryTimer = setTimeout(() => { void expire(); }, ms);
}

export async function selectPlayer(playerId: string) {
  await prisma.$transaction(async (tx) => {
    const player = await tx.player.findUnique({ where: { id: playerId } });
    if (!player || player.status === 'SOLD') return;
    // 기존 ACTIVE → WAITING 되돌리기
    await tx.player.updateMany({ where: { status: 'ACTIVE' }, data: { status: 'WAITING' } });
    await tx.player.update({ where: { id: playerId }, data: { status: 'ACTIVE' } });
    await tx.auctionState.update({
      where: { id: 1 },
      data: { phase: 'BIDDING', activePlayerId: playerId, currentBid: 0, highestBidderTeamId: null, bidDeadline: null },
    });
  });
  clearExpiryTimer();
  const p = await prisma.player.findUnique({ where: { id: playerId } });
  await addLog(`📢 [경매 타겟] ${p?.name} 선수의 경매가 시작되었습니다.`);
  await publish();
}

export async function placeBid(teamId: string, amount: number): Promise<{ ok: boolean; error?: string }> {
  let deadlineToArm: Date | null = null;
  const result = await prisma.$transaction(async (tx): Promise<{ ok: boolean; error?: string }> => {
    const state = await tx.auctionState.findUniqueOrThrow({ where: { id: 1 } });
    const active = state.activePlayerId
      ? await tx.player.findUnique({ where: { id: state.activePlayerId } })
      : null;
    const team = await tx.team.findUnique({ where: { id: teamId }, include: { roster: true } });
    if (!team) return { ok: false, error: '팀을 찾을 수 없습니다.' };
    const occupied = team.roster.map((r) => r.slotIndex).filter((n): n is number => n != null);

    const v = validateBid({
      phase: state.phase,
      activePlayerRole: active?.role ?? null,
      currentBid: state.currentBid,
      amount,
      teamPoints: team.points,
      teamOccupiedSlots: occupied,
    });
    if (!v.ok) return { ok: false, error: v.error };

    const deadline = new Date(Date.now() + TIMER_INITIAL_SECONDS * 1000);
    await tx.auctionState.update({
      where: { id: 1 },
      data: { currentBid: v.newBid, highestBidderTeamId: teamId, bidDeadline: deadline },
    });
    deadlineToArm = deadline;
    return { ok: true };
  });

  if (result.ok && deadlineToArm) {
    armExpiryTimer(deadlineToArm);
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    const state = await prisma.auctionState.findUnique({ where: { id: 1 } });
    await addLog(`💰 [입찰] ${team?.name} ${state?.currentBid}P로 최고 입찰!`);
    await publish();
  }
  return result;
}

export async function confirmWin(): Promise<{ ok: boolean; error?: string }> {
  const res = await prisma.$transaction(async (tx): Promise<{ ok: boolean; error?: string }> => {
    const state = await tx.auctionState.findUniqueOrThrow({ where: { id: 1 } });
    if (!state.activePlayerId || !state.highestBidderTeamId)
      return { ok: false, error: '낙찰 대상/입찰자가 없습니다.' };
    const active = await tx.player.findUniqueOrThrow({ where: { id: state.activePlayerId } });
    const team = await tx.team.findUniqueOrThrow({ where: { id: state.highestBidderTeamId }, include: { roster: true } });
    const occupied = team.roster.map((r) => r.slotIndex).filter((n): n is number => n != null);
    const slot = findEmptySlot(occupied, active.role);
    if (slot === -1) return { ok: false, error: '포지션 만석.' };
    if (team.points < state.currentBid) return { ok: false, error: '포인트 부족.' };

    await tx.player.update({
      where: { id: active.id },
      data: { status: 'SOLD', cost: state.currentBid, teamId: team.id, slotIndex: slot },
    });
    await tx.team.update({ where: { id: team.id }, data: { points: team.points - state.currentBid } });
    await tx.auctionState.update({
      where: { id: 1 },
      data: { phase: 'IDLE', activePlayerId: null, currentBid: 0, highestBidderTeamId: null, bidDeadline: null },
    });
    return { ok: true };
  });
  if (res.ok) {
    clearExpiryTimer();
    await addLog('🎉 [낙찰] 낙찰 처리되었습니다.');
    await publish();
  }
  return res;
}

export async function markUnsold(): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const state = await tx.auctionState.findUniqueOrThrow({ where: { id: 1 } });
    if (state.activePlayerId)
      await tx.player.update({ where: { id: state.activePlayerId }, data: { status: 'UNSOLD' } });
    await tx.auctionState.update({
      where: { id: 1 },
      data: { phase: 'IDLE', activePlayerId: null, currentBid: 0, highestBidderTeamId: null, bidDeadline: null },
    });
  });
  clearExpiryTimer();
  await addLog('⚠️ [유찰] 선수가 유찰 처리되었습니다.');
  await publish();
}

async function expire(): Promise<void> {
  const state = await prisma.auctionState.findUnique({ where: { id: 1 } });
  if (!state || state.phase !== 'BIDDING') return;
  const decision = resolveExpiry(Boolean(state.highestBidderTeamId));
  if (decision === 'UNSOLD') {
    await markUnsold();
  } else {
    await prisma.auctionState.update({ where: { id: 1 }, data: { phase: 'AWAITING_CONFIRM', bidDeadline: null } });
    clearExpiryTimer();
    await addLog('⏰ [확정 대기] 시간 만료. 최고 입찰팀 낙찰을 확정하세요.');
    await publish();
  }
}

export async function resetAuction(): Promise<void> {
  clearExpiryTimer();
  await prisma.$transaction(async (tx) => {
    await tx.player.updateMany({ data: { status: 'WAITING', cost: null, teamId: null, slotIndex: null } });
    const teams = await tx.team.findMany();
    for (const t of teams) await tx.team.update({ where: { id: t.id }, data: { points: t.startingPoints } });
    await tx.auctionState.update({
      where: { id: 1 },
      data: { phase: 'IDLE', activePlayerId: null, currentBid: 0, highestBidderTeamId: null, bidDeadline: null },
    });
    await tx.logEntry.deleteMany();
  });
  await addLog('🔄 경매가 초기화되었습니다.');
  await publish();
}

// 서버 재시작 시 진행 중이던 타이머 복구
export async function recoverTimer(): Promise<void> {
  const state = await prisma.auctionState.findUnique({ where: { id: 1 } });
  if (state?.phase === 'BIDDING' && state.bidDeadline) {
    if (state.bidDeadline.getTime() <= Date.now()) await expire();
    else armExpiryTimer(state.bidDeadline);
  }
}
```

- [ ] **Step 2: 타입체크**

Run: `npx tsc --noEmit` → Expected: 엔진 관련 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add src/server/auctionEngine.ts && git commit -m "feat(server): auction engine (txn actions + server timer + broadcast)"
```

---

## Phase 4 — API Route Handlers

> 모든 route 파일은 `export const runtime = 'nodejs';` `export const dynamic = 'force-dynamic';` 포함. 변경 핸들러는 세션/역할 검증.

### Task 4.1: 인증 API

**Files:**
- Create: `src/app/api/auth/login/route.ts`
- Create: `src/app/api/auth/logout/route.ts`
- Create: `src/app/api/auth/me/route.ts`

- [ ] **Step 1: login 작성**

```ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/server/db';
import { SESSION_COOKIE, signSession } from '@/server/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { username, password } = await req.json();
  if (!username || !password)
    return NextResponse.json({ error: '아이디/비밀번호를 입력하세요.' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash)))
    return NextResponse.json({ error: '아이디 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });

  const token = await signSession({ sub: user.id, role: user.role, teamId: user.teamId ?? undefined, username: user.username });
  const res = NextResponse.json({ role: user.role, teamId: user.teamId, username: user.username });
  res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 12 });
  return res;
}
```

- [ ] **Step 2: logout 작성**

```ts
import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/server/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
```

- [ ] **Step 3: me 작성**

```ts
import { NextResponse } from 'next/server';
import { getSession } from '@/server/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { username: s.username, role: s.role, teamId: s.teamId ?? null } });
}
```

- [ ] **Step 4: 수동 검증 + 커밋**

`npm run dev` 후:
```bash
curl -i -X POST localhost:3000/api/auth/login -H 'content-type: application/json' -d '{"username":"admin","password":"admin1234"}'
```
Expected: 200 + `Set-Cookie: ow_session=...`.
```bash
git add src/app/api/auth && git commit -m "feat(api): auth login/logout/me"
```

### Task 4.2: 경매 조회 API (state + SSE stream)

**Files:**
- Create: `src/app/api/auction/state/route.ts`
- Create: `src/app/api/auction/stream/route.ts`

- [ ] **Step 1: state 작성**

```ts
import { NextResponse } from 'next/server';
import { buildSnapshot } from '@/server/snapshot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(await buildSnapshot());
}
```

- [ ] **Step 2: stream(SSE) 작성** (구독 + 초기 스냅샷 1회 전송 + keep-alive ping. 패턴은 route.md Streaming 섹션 참고.)

```ts
import { subscribe } from '@/server/sse';
import { buildSnapshot } from '@/server/snapshot';
import { recoverTimer } from '@/server/auctionEngine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  await recoverTimer();
  const encoder = new TextEncoder();
  let unsub: () => void = () => {};
  let ping: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (s: string) => controller.enqueue(encoder.encode(s));
      // 초기 스냅샷
      send(`data: ${JSON.stringify(await buildSnapshot())}\n\n`);
      unsub = subscribe(send);
      ping = setInterval(() => send(`: ping\n\n`), 15000);
    },
    cancel() { unsub(); clearInterval(ping); },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
```

- [ ] **Step 3: 수동 검증 + 커밋**

`curl -N localhost:3000/api/auction/stream` → 즉시 `data: {...}` 수신, 15초마다 `: ping`.
```bash
git add src/app/api/auction/state src/app/api/auction/stream && git commit -m "feat(api): auction state + SSE stream"
```

### Task 4.3: 경매 액션 API

**Files:**
- Create: `src/app/api/auction/select/route.ts`
- Create: `src/app/api/auction/bid/route.ts`
- Create: `src/app/api/auction/confirm/route.ts`
- Create: `src/app/api/auction/unsold/route.ts`
- Create: `src/app/api/auction/reset/route.ts`

- [ ] **Step 1: select (admin)**

```ts
import { NextResponse } from 'next/server';
import { getSession } from '@/server/session';
import { selectPlayer } from '@/server/auctionEngine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const s = await getSession();
  if (s?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { playerId } = await req.json();
  if (!playerId) return NextResponse.json({ error: 'playerId 필요' }, { status: 400 });
  await selectPlayer(playerId);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: bid (admin 또는 해당 팀 leader)**

```ts
import { NextResponse } from 'next/server';
import { getSession } from '@/server/session';
import { placeBid } from '@/server/auctionEngine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { teamId, amount } = await req.json();
  if (!teamId || typeof amount !== 'number')
    return NextResponse.json({ error: 'teamId/amount 필요' }, { status: 400 });
  // 팀장은 본인 팀만
  if (s.role === 'LEADER' && s.teamId !== teamId)
    return NextResponse.json({ error: '본인 팀만 입찰할 수 있습니다.' }, { status: 403 });
  const r = await placeBid(teamId, amount);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: confirm / unsold / reset (admin)** — 각 파일 동일 패턴

confirm:
```ts
import { NextResponse } from 'next/server';
import { getSession } from '@/server/session';
import { confirmWin } from '@/server/auctionEngine';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST() {
  const s = await getSession();
  if (s?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const r = await confirmWin();
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
```
unsold: 위와 동일하되 `import { markUnsold }` 후 `await markUnsold(); return NextResponse.json({ ok: true });`.
reset: 위와 동일하되 `import { resetAuction }` 후 `await resetAuction(); return NextResponse.json({ ok: true });`.

- [ ] **Step 4: 수동 검증 + 커밋**

admin 쿠키로 select→bid→confirm 순서 curl 호출, SSE 탭에서 스냅샷 갱신 확인.
```bash
git add src/app/api/auction && git commit -m "feat(api): auction actions (select/bid/confirm/unsold/reset)"
```

### Task 4.4: 관리자 팀 CRUD API

**Files:**
- Create: `src/app/api/admin/teams/route.ts`
- Create: `src/app/api/admin/teams/[id]/route.ts`

가드: 경매가 IDLE이 아니거나 낙찰이 1건이라도 있으면 팀 구조 변경 시 충돌 → 본 API는 `force` 플래그가 없으면 409 반환하고, `force`면 `resetAuction()` 후 적용.

- [ ] **Step 1: 목록/생성 작성** (`route.ts`)

```ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/server/db';
import { getSession } from '@/server/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const s = await getSession();
  if (s?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const teams = await prisma.team.findMany({ orderBy: { order: 'asc' }, include: { leaderAccount: { select: { username: true } } } });
  return NextResponse.json({ teams });
}

export async function POST(req: Request) {
  const s = await getSession();
  if (s?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { name, leaderName, avatarUrl, startingPoints, leaderUsername, leaderPassword } = await req.json();
  if (!name || !leaderName || !leaderUsername || !leaderPassword)
    return NextResponse.json({ error: '필수 항목 누락' }, { status: 400 });
  const count = await prisma.team.count();
  const team = await prisma.team.create({
    data: {
      name, leaderName, avatarUrl: avatarUrl ?? '',
      startingPoints: startingPoints ?? 1000, points: startingPoints ?? 1000, order: count,
      leaderAccount: { create: { username: leaderUsername, passwordHash: await bcrypt.hash(leaderPassword, 10), role: 'LEADER' } },
    },
  });
  return NextResponse.json({ team });
}
```

- [ ] **Step 2: 수정/삭제 작성** (`[id]/route.ts`)

```ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/server/db';
import { getSession } from '@/server/session';
import { resetAuction } from '@/server/auctionEngine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function hasProgress(): Promise<boolean> {
  const sold = await prisma.player.count({ where: { status: 'SOLD' } });
  const state = await prisma.auctionState.findUnique({ where: { id: 1 } });
  return sold > 0 || (state?.phase ?? 'IDLE') !== 'IDLE';
}

export async function PATCH(req: Request, ctx: RouteContext<'/api/admin/teams/[id]'>) {
  const s = await getSession();
  if (s?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await ctx.params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const k of ['name', 'leaderName', 'avatarUrl', 'startingPoints'] as const)
    if (body[k] !== undefined) data[k] = body[k];
  if (body.startingPoints !== undefined) data.points = body.startingPoints; // 진행 전 가정
  await prisma.team.update({ where: { id }, data });
  if (body.leaderPassword)
    await prisma.user.updateMany({ where: { teamId: id }, data: { passwordHash: await bcrypt.hash(body.leaderPassword, 10) } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request, ctx: RouteContext<'/api/admin/teams/[id]'>) {
  const s = await getSession();
  if (s?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await ctx.params;
  const force = new URL(req.url).searchParams.get('force') === '1';
  if (await hasProgress()) {
    if (!force) return NextResponse.json({ error: '경매 진행 중. force=1로 초기화 후 삭제하세요.' }, { status: 409 });
    await resetAuction();
  }
  await prisma.user.deleteMany({ where: { teamId: id } });
  await prisma.team.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: 수동 검증 + 커밋**

admin 쿠키로 팀 생성/수정/삭제 curl. 진행 중 삭제 시 409 확인.
```bash
git add src/app/api/admin && git commit -m "feat(api): admin team CRUD + progress guard"
```

---

## Phase 5 — 프론트엔드 재배선

### Task 5.1: 인증 컨텍스트

**Files:**
- Create: `src/auth/AuthContext.tsx`
- Modify: `src/app/providers.tsx` (AuthProvider 래핑)

- [ ] **Step 1: AuthContext 작성**

```tsx
'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface CurrentUser { username: string; role: 'ADMIN' | 'LEADER'; teamId: string | null; }
interface AuthApi {
  user: CurrentUser | null; loading: boolean;
  login: (u: string, p: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}
const Ctx = createContext<AuthApi | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    setUser(data.user);
    setLoading(false);
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) return { ok: false, error: (await res.json()).error as string };
    await refresh();
    return { ok: true };
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  }, []);

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth must be used within AuthProvider');
  return v;
}
```

- [ ] **Step 2: providers.tsx에 추가** — 기존 providers 내용 확인 후 최상위(또는 ThemeProvider 안쪽)에서 `<AuthProvider>`로 children 감싸기.

- [ ] **Step 3: 커밋**

```bash
git add src/auth/AuthContext.tsx src/app/providers.tsx && git commit -m "feat(web): auth context"
```

### Task 5.2: useAuction 재작성 (SSE 구독 + API 액션)

**Files:**
- Modify(재작성): `src/auction/useAuction.ts`
- Modify: `src/auction/AuctionContext.tsx` (타입이 바뀌면 맞춤)
- Modify: `src/auction/types.ts` (스냅샷 타입 재사용으로 정리)

기존 localStorage 기반 로직을 제거하고, 스냅샷 상태 + 액션 호출로 대체. 파생 셀렉터(activePlayer, highestBidder, nextPlayer, waitingCount, unsoldPlayers)는 스냅샷에서 계산. 타이머는 `bidDeadline - serverNow` 기반 표시.

- [ ] **Step 1: 재작성**

```ts
'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AuctionSnapshot, SnapPlayer, SnapTeam } from '@/shared/snapshot-types';

const EMPTY: AuctionSnapshot = {
  teams: [], players: [], phase: 'IDLE', activePlayerId: null, currentBid: 0,
  highestBidderTeamId: null, bidDeadline: null, logs: [], serverNow: new Date().toISOString(),
};

export function useAuction() {
  const [snap, setSnap] = useState<AuctionSnapshot>(EMPTY);
  const [now, setNow] = useState(() => Date.now());
  const clockSkew = useRef(0); // serverNow - clientNow

  // 초기 + SSE 구독
  useEffect(() => {
    let es: EventSource | null = null;
    fetch('/api/auction/state').then((r) => r.json()).then((s: AuctionSnapshot) => {
      clockSkew.current = new Date(s.serverNow).getTime() - Date.now();
      setSnap(s);
    });
    es = new EventSource('/api/auction/stream');
    es.onmessage = (e) => {
      const s = JSON.parse(e.data) as AuctionSnapshot;
      clockSkew.current = new Date(s.serverNow).getTime() - Date.now();
      setSnap(s);
    };
    return () => es?.close();
  }, []);

  // 표시용 시계 (100ms)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, []);

  const timer = useMemo(() => {
    if (!snap.bidDeadline) return 0;
    const remainMs = new Date(snap.bidDeadline).getTime() - (now + clockSkew.current);
    return Math.max(0, remainMs / 1000);
  }, [snap.bidDeadline, now]);

  const activePlayer = useMemo<SnapPlayer | null>(
    () => snap.players.find((p) => p.id === snap.activePlayerId) ?? null, [snap]);
  const highestBidder = useMemo<SnapTeam | null>(
    () => snap.teams.find((t) => t.id === snap.highestBidderTeamId) ?? null, [snap]);
  const waitingCount = useMemo(() => snap.players.filter((p) => p.status === 'WAITING').length, [snap]);
  const unsoldPlayers = useMemo(() => snap.players.filter((p) => p.status === 'UNSOLD'), [snap]);
  const nextPlayer = useMemo<SnapPlayer | null>(() => {
    const waiting = snap.players.filter((p) => p.status === 'WAITING');
    return waiting[0] ?? null;
  }, [snap]);

  const post = useCallback(async (url: string, body?: unknown) => {
    const res = await fetch(url, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) { const d = await res.json().catch(() => ({})); return { ok: false, error: d.error }; }
    return { ok: true };
  }, []);

  return {
    snap, teams: snap.teams, players: snap.players, logs: snap.logs,
    currentBid: snap.currentBid, phase: snap.phase, timer,
    activePlayer, highestBidder, nextPlayer, waitingCount, unsoldPlayers,
    selectPlayer: (id: string) => post('/api/auction/select', { playerId: id }),
    placeBid: (teamId: string, amount: number) => post('/api/auction/bid', { teamId, amount }),
    confirmWin: () => post('/api/auction/confirm'),
    markUnsold: () => post('/api/auction/unsold'),
    resetAll: () => post('/api/auction/reset'),
  };
}
export type AuctionApi = ReturnType<typeof useAuction>;
```

- [ ] **Step 2: AuctionContext 타입 정합** — `AuctionContext.tsx`가 `AuctionApi`를 import하므로 타입만 맞으면 통과. `useAuctionContext` 그대로 유지.

- [ ] **Step 3: 타입체크**

Run: `npx tsc --noEmit` → 컴포넌트들이 옛 필드(`chat`, `customBid`, `quickBid`, `setBidder`, `exportJson`, `importJson`, `toggleTimer`, `resetTimer`, `submitManualBid`)를 참조하므로 에러 발생 예상 → Task 5.3에서 해소.

- [ ] **Step 4: 커밋**

```bash
git add src/auction/useAuction.ts src/auction/AuctionContext.tsx src/auction/types.ts && git commit -m "feat(web): rewrite useAuction over SSE + API"
```

### Task 5.3: 컴포넌트 역할 분기 + 신규 API 연결

**Files (Modify):** `src/auction/components/` 전체 — `Header.tsx`, `TeamPanel.tsx`, `ActivePlayerCard.tsx`, `BiddingConsole.tsx`, `PlayerGrid.tsx`, `UnsoldList.tsx`, `TerminalLog.tsx`, `StreamChat.tsx`, `ScheduleBanner.tsx`, `ByteBanner.tsx`, `KeyboardBanner.tsx`

각 컴포넌트가 새 스냅샷 필드/액션을 쓰도록 수정. 핵심 변경만 명시:

- [ ] **Step 1: BiddingConsole 재작성** — 입찰 콘솔이 역할에 따라 분기.
  - 관리자: 활성 선수가 있으면 팀별 빠른입찰 버튼 그리드(각 팀 × `BID_INCREMENTS`) + 낙찰확정/유찰/타이머표시. `phase==='AWAITING_CONFIRM'`이면 "낙찰 확정" 강조.
  - 팀장(`useAuth().user.role==='LEADER'`): 본인 팀(`user.teamId`)에 대한 `BID_INCREMENTS` 입찰 버튼만. 호출 `placeBid(user.teamId, amount)`. 실패 시 `error` 토스트/알림.
  - 비로그인: "관전 모드 · 로그인하면 입찰할 수 있습니다" 안내 + `/login` 링크.
  - 기존 `quickBid/setBidder/submitManualBid/customBid` 제거. 입력 실패는 반환 `{ok,error}`로 처리(스낵바).

```tsx
// 핵심 입찰 핸들러 예시
const onBid = async (teamId: string, amount: number) => {
  const r = await placeBid(teamId, amount);
  if (!r.ok) setSnackbar(r.error ?? '입찰 실패');
};
```

- [ ] **Step 2: Header 수정** — `exportJson/importJson/resetAll` 버튼 영역 교체.
  - 공통: 로고 + 타이틀 유지.
  - 비로그인: "로그인" 버튼(`/login`).
  - 팀장: `{username} · {팀명}` 표시 + 로그아웃.
  - 관리자: "관리자페이지"(`/admin`) 링크 + "초기화"(`resetAll`) + 로그아웃.
  - `resetAll`은 이제 API 호출(서버). `window.confirm` 유지.

- [ ] **Step 3: PlayerGrid 수정** — 카드 클릭 시 관리자만 `selectPlayer(p.id)` 호출(팀장/비로그인은 클릭 비활성 또는 정보만). 상태 색은 enum(`WAITING/ACTIVE/SOLD/UNSOLD`) 기준. 역할 표시는 `roleToKo(p.role)`.

- [ ] **Step 4: TeamPanel 수정** — `team.points`, `team.roster`(이미 슬롯 배열) 사용. 슬롯 라벨(탱/딜/딜/힐/힐). `roleToKo` 사용. `highestBidderTeamId` 하이라이트.

- [ ] **Step 5: ActivePlayerCard 수정** — `activePlayer`(SnapPlayer), `currentBid`, `highestBidder`, `timer` 사용. `mostPicks` 이미지 그대로. `phase==='AWAITING_CONFIRM'` 시 "확정 대기" 배지.

- [ ] **Step 6: TerminalLog 수정** — `logs`(string[]) 그대로 렌더.

- [ ] **Step 7: StreamChat 수정** — 채팅은 서버 비범위. 클라이언트 시뮬레이션 유지하되, `useAuction`에서 제거됐으므로 컴포넌트 내부 `useState`+`setInterval`로 자체 시뮬레이션(기존 `CHAT_TEMPLATES`/`INITIAL_CHAT` 재사용). 플레이버 명시 주석.

- [ ] **Step 8: UnsoldList 수정** — `unsoldPlayers` 사용. 관리자는 클릭 시 `selectPlayer`로 재경매.

- [ ] **Step 9: ScheduleBanner/ByteBanner/KeyboardBanner** — 데이터 의존 없으면 그대로. `KeyboardBanner`가 단축키 안내면 새 동작에 맞게 문구만 정리(또는 제거 검토).

- [ ] **Step 10: 타입체크 통과 + 커밋**

Run: `npx tsc --noEmit` → 에러 없음.
```bash
git add src/auction/components && git commit -m "feat(web): role-aware components over new API"
```

---

## Phase 6 — 페이지 (로그인 / 관리자)

### Task 6.1: 로그인 페이지

**Files:**
- Create: `src/app/login/page.tsx`

- [ ] **Step 1: 작성** — username/password 폼, `useAuth().login` 호출. 성공 시 role 따라 이동(`ADMIN → /admin`, `LEADER → /`). 실패 시 에러 표시. MUI 폼.

```tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import { useAuth } from '@/auth/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const r = await login(username, password);
    if (!r.ok) { setError(r.error ?? '로그인 실패'); return; }
    const me = await (await fetch('/api/auth/me')).json();
    router.push(me.user?.role === 'ADMIN' ? '/admin' : '/');
  };

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ maxWidth: 360, mx: 'auto', mt: 12, display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
      <Typography variant="h5" fontWeight={800}>로그인</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <TextField label="아이디" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />
      <TextField label="비밀번호" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button type="submit" variant="contained">로그인</Button>
    </Box>
  );
}
```

- [ ] **Step 2: 수동 검증 + 커밋**

`admin/admin1234`, `leader1/leader123` 로그인 후 리다이렉트 확인.
```bash
git add src/app/login && git commit -m "feat(web): login page"
```

### Task 6.2: 관리자 페이지 (팀 CRUD)

**Files:**
- Create: `src/app/admin/page.tsx`
- Create: `src/admin/AdminDashboard.tsx`

- [ ] **Step 1: AdminDashboard 작성** — 팀 목록 테이블 + 추가/수정/삭제. 필드: 팀명, 팀장명, 아바타 URL, 시작 포인트, 팀장 아이디/비번. `GET/POST/PATCH/DELETE /api/admin/teams`. 삭제 409면 "경매 진행 중. 초기화 후 삭제할까요?" 확인 → `?force=1` 재요청.

```tsx
'use client';
import { useCallback, useEffect, useState } from 'react';
// ... MUI Table, Dialog, TextField, Button
// fetchTeams(): GET /api/admin/teams
// createTeam(form): POST
// updateTeam(id, form): PATCH
// deleteTeam(id): DELETE → 409면 confirm 후 ?force=1
```
(완전한 폼/다이얼로그는 MUI 표준 패턴으로 구현. 핵심: 각 호출 후 fetchTeams()로 새로고침.)

- [ ] **Step 2: admin/page.tsx 작성** — 서버에서 세션 확인 후 비관리자 리다이렉트.

```tsx
import { redirect } from 'next/navigation';
import { getSession } from '@/server/session';
import AdminDashboard from '@/admin/AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const s = await getSession();
  if (!s || s.role !== 'ADMIN') redirect('/login');
  return <AdminDashboard />;
}
```

- [ ] **Step 3: 수동 검증 + 커밋**

관리자로 팀 추가→메인에서 반영 확인. 비관리자 `/admin` 접근 시 `/login` 리다이렉트 확인.
```bash
git add src/app/admin src/admin && git commit -m "feat(web): admin page with team CRUD"
```

---

## Phase 7 — 디자인 폴리시

### Task 7.1: 디자인 토큰/테마 정비

**Files:**
- Modify: `src/auction/constants.ts` (COLORS), `src/app/theme.ts`, `src/app/globals.css`

- [ ] **Step 1: frontend-design 스킬 적용** — e스포츠 방송 톤으로 색/타이포/간격/그림자 토큰 재정의. 다크 베이스 + 절제된 네온 액센트, 활성 카드/타이머/현재가 강조. 기존 라이트 팔레트를 방송용으로 재조정(가독성·대비 확보).

- [ ] **Step 2: 공통 패널/버튼/칩 스타일 일관화** — `panelSx` 등 공통 sx 정리. 컴포넌트별 임시 스타일 흡수.

- [ ] **Step 3: 시각 확인 + 커밋**

`npm run dev`로 데스크톱/모바일 뷰 확인.
```bash
git add -A && git commit -m "style: e-sports broadcast design polish"
```

### Task 7.2: 반응형/모바일 정리

**Files:**
- Modify: `src/auction/AuctionDashboard.tsx`, 관련 컴포넌트

- [ ] **Step 1: 모바일 레이아웃 점검** — 3열 그리드가 모바일에서 세로 스택으로 자연스럽게 무너지는지, 입찰 콘솔/팀패널 터치 타깃 확인. 깨지는 부분 수정.

- [ ] **Step 2: 커밋**

```bash
git add -A && git commit -m "style: responsive/mobile fixes"
```

---

## Phase 8 — 통합 검증

### Task 8.1: 전체 빌드 + 시나리오 검증

- [ ] **Step 1: 단위 테스트 전체**

Run: `npm test` → 전부 PASS.

- [ ] **Step 2: 타입체크 + 빌드**

Run: `npx tsc --noEmit && npm run build` → 에러 없음.

- [ ] **Step 3: 멀티탭 실시간 시나리오 (수동)**

`npm run dev` 후 verify 스킬 또는 수동:
1. 탭 A(관리자 로그인) + 탭 B(팀장 leader1 로그인) + 탭 C(비로그인).
2. A에서 선수 선택 → A/B/C 모두 활성 선수 갱신.
3. B에서 +10 입찰 → 세 탭 모두 현재가/타이머/최고입찰팀 갱신.
4. 타이머 만료 → 입찰자 있으면 "확정 대기", A에서 낙찰 확정 → 로스터/포인트 갱신, 세 탭 반영.
5. 입찰자 없이 만료 → 자동 유찰, UnsoldList 반영.
6. A 관리자페이지에서 팀 추가/삭제 → 메인 팀패널 반영(진행 중이면 force 가드).

- [ ] **Step 4: 최종 커밋**

```bash
git add -A && git commit -m "test: full build + integration verification"
```

---

## 완료 정의 (Definition of Done)
- 비로그인 관전 / 팀장 본인 팀 입찰 / 관리자 전체 진행이 역할대로 동작.
- 입찰·낙찰·유찰·타이머·팀 변경이 SSE로 모든 접속 화면에 실시간 반영.
- 관리자페이지에서 팀(팀장 계정 포함) CRUD 동작, 진행 중 변경 가드 동작.
- 입찰이 "팀+증액" 단일 동작으로 통합(분리 모델 제거), 서버 권위 타이머 만료 처리 정상.
- `npm test`, `npx tsc --noEmit`, `npm run build` 모두 통과.
- e스포츠 방송 톤 디자인 폴리시 + 모바일 레이아웃 정리 완료.
```
