# 설계: 경매 대시보드 풀스택화 (인증 · 관리자 · 실시간 입찰 · 디자인)

작성일: 2026-06-10
대상: `e-sport` (Next.js 16.2.6 / MUI 9). 기존 클라이언트 전용 목업 → **Next + Node 백엔드, PostgreSQL, SSE 실시간** 풀스택으로 전환.

## 1. 목표
1. **백엔드(Next Route Handlers, Node 런타임) + PostgreSQL** 영속 저장
2. **인증**: 관리자 + 팀장별 계정 (httpOnly 쿠키 세션, 비밀번호 해시)
3. **관리자페이지**: 팀 전체 CRUD + 팀장 계정 발급
4. **실시간 동기화(SSE)**: 입찰·낙찰·유찰·타이머가 모든 접속자 화면에 즉시 반영
5. **입찰/낙찰/타이머 로직 재설계**: 분리 입찰 모델 등 버그 수정 + 서버 권위 타이머
6. **디자인 전체 폴리시**: e스포츠 방송 톤

## 2. 범위 / 비범위
**범위**: 위 1~6 전부. 로그인/관리자 페이지, REST 액션 API, SSE 스트림, 서버 권위 경매 엔진, 역할 기반 UI, Postgres 스키마/마이그레이션, 로컬 실행 셋업(**로컬 설치 Postgres** + `.env` 가이드).

**비범위**: 선수(매물) CRUD(팀 CRUD만 — 선수는 시드 데이터 유지). 로스터 수동 편집(경매로 채워짐). 멀티 인스턴스 수평 확장(단일 Node 프로세스 가정 — SSE 브로드캐스트는 인메모리 이벤트 버스, 한계 문서화). 실제 채팅(스트림 채팅은 기존 시뮬레이션 유지, 플레이버).

## 3. 기술 스택 / 의존성
- DB 접근: **Prisma** (`@prisma/client` — Next가 자동 external 처리 확인됨) + PostgreSQL.
- 인증: 비밀번호 해시 `bcryptjs`(순수 JS, 네이티브 빌드 회피), 세션 쿠키 JWT `jose`(httpOnly, stateless).
- 실시간: Route Handler SSE (`ReadableStream` + `Response`, `runtime='nodejs'`, `dynamic='force-dynamic'`). 확인된 Next 16 패턴 사용.
- 검증: 입력 검증은 경량 수동 또는 `zod`(선택). 서버 측 권한·동시성 검증 필수.

## 4. 데이터 모델 (Prisma / PostgreSQL)
- **User**: `id, username(unique), passwordHash, role(ADMIN|LEADER), teamId?(LEADER는 팀 연결)`.
- **Team**: `id, name, leaderName, avatarUrl, startingPoints, points(잔여), order, createdAt`.
- **Player**: `id, name, role(TANK|DPS|SUPPORT), avatarUrl, status(WAITING|ACTIVE|SOLD|UNSOLD), cost?, teamId?(낙찰팀), slotIndex?, order, mostPicks(string[])`.
  - 로스터는 `Player.teamId + role/slotIndex`로 파생(별도 테이블 없음). 슬롯: 탱1·딜2·힐2.
- **AuctionState** (단일 행, id=1): `activePlayerId?, currentBid, highestBidderTeamId?, bidDeadline?(timestamptz), phase(IDLE|BIDDING|AWAITING_CONFIRM)`.
- **LogEntry**: `id, message, createdAt` (최근 N개 브로드캐스트/표시).
- 시드: 기존 `data.ts`의 팀 4·선수 14·mostPicks를 초기 마이그레이션 시드로 이전. 관리자 기본 계정 1개 시드(.env의 초기 비번).

## 5. 백엔드 아키텍처
### 5.1 경매 엔진 (`src/server/auctionEngine.ts`, 모듈 싱글톤)
- 상태 변경 함수(select/bid/confirm/unsold/timer/reset)는 **Prisma 트랜잭션**으로 원자 처리.
- **SSE 이벤트 버스**: 인메모리 구독자 집합. 상태 변경 시 최신 스냅샷을 모든 구독자에 push.
- **서버 권위 타이머**: 입찰마다 `bidDeadline = now + 15s` 설정+브로드캐스트. 서버 `setTimeout`이 만료 시 해소(입찰자 없으면 자동 유찰, 있으면 `AWAITING_CONFIRM`로 전환)하고 브로드캐스트. 클라이언트는 `bidDeadline - now`로 카운트다운 렌더(표시 전용).
- 한계: 단일 프로세스 인메모리 버스 — 다중 인스턴스 미지원(문서화). 필요 시 추후 Postgres LISTEN/NOTIFY로 확장 가능.

### 5.2 API (Route Handlers, `src/app/api/...`)
- 인증: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`.
- 경매 조회: `GET /api/auction/state`(스냅샷), `GET /api/auction/stream`(SSE).
- 경매 액션: `POST /api/auction/select`(admin), `/bid`(admin 또는 해당 팀 leader, body `{teamId, amount}`), `/confirm`(admin), `/unsold`(admin), `/timer`(admin), `/reset`(admin).
- 관리자 팀: `GET/POST /api/admin/teams`, `PATCH/DELETE /api/admin/teams/[id]` (팀 + 팀장 계정 발급/수정 포함).
- 모든 변경 핸들러는 쿠키 세션 검증 + 역할 검증. `/bid`는 leader가 본인 `teamId`만 가능.

### 5.3 입찰/낙찰/타이머 로직 (버그 수정)
- **입찰 통합**: `placeBid(teamId, amount)` — 활성 선수 존재, 팀 포인트 ≥ `currentBid+amount`, 해당 포지션 빈 슬롯 존재 검증 후, 그 팀을 새 입찰가의 최고 입찰자로 원자 설정 + 타이머 리셋/시작 + 로그. (기존 quickBid/setBidder 분리 모델 제거.)
- **시작가 정리**: 선수 선택 시 `currentBid=0`(미입찰). 첫 입찰은 `MIN_STARTING_BID` 이상.
- **타이머 만료**: 입찰자 없음 → 자동 유찰. 입찰자 있음 → 정지 + `AWAITING_CONFIRM` 안내(관리자가 확정/유찰). 자동 낙찰은 사고 위험으로 수동 확정 유지하되 명확히 안내.
- 동시성: 입찰 트랜잭션에서 `currentBid` 재확인(낙관적). 늦은 입찰은 거절+사유 반환.

## 6. 프론트엔드
- **AuthContext**: `GET /api/auth/me`로 세션 로드, `login/logout`. 루트 providers에 추가.
- **useAuction 재작성**: 더 이상 localStorage가 원천이 아님. 초기 `GET /api/auction/state` + `EventSource('/api/auction/stream')` 구독으로 상태 수신. 액션은 API POST(낙관적 갱신 없이 서버 push 신뢰). 파생 셀렉터 유지.
- **역할 기반 UI**: 비로그인=관전(입찰 콘솔 잠금 안내+로그인 버튼). 팀장=자기 팀 입찰 버튼만. 관리자=전체 제어 + 관리자페이지 링크.
- **라우트**: `/`(공개 방송 뷰), `/login`, `/admin`(관리자 전용, 비관리자 리다이렉트).
- 디자인 폴리시는 모든 화면에 동일 디자인 언어로 적용(frontend-design 스킬). 모바일 레이아웃 정리.

## 7. 파일 구조 (예상)
```
prisma/schema.prisma, prisma/seed.ts
.env.example  # DATABASE_URL, JWT_SECRET, 초기 관리자 계정
src/server/
  db.ts            # Prisma client 싱글톤
  auctionEngine.ts # 상태변경 + SSE 버스 + 서버 타이머
  auth.ts          # 세션 발급/검증(jose), bcrypt 비교
  sse.ts           # 구독자 관리/브로드캐스트
src/app/api/auth/{login,logout,me}/route.ts
src/app/api/auction/{state,stream,select,bid,confirm,unsold,timer,reset}/route.ts
src/app/api/admin/teams/route.ts, .../[id]/route.ts
src/app/login/page.tsx, src/app/admin/page.tsx
src/auth/AuthContext.tsx
src/admin/AdminDashboard.tsx
src/auction/useAuction.ts (재작성), components/* (역할 분기 + 폴리시)
```

## 8. 실행/검증
- 로컬 Postgres 설치/기동: `brew install postgresql@16` → `brew services start postgresql@16` → `createdb e_sport`.
- 그 다음: `.env`(DATABASE_URL, JWT_SECRET, ADMIN 초기 계정) 작성 → `prisma migrate dev` + seed → `next dev`.
- 검증: 단위 테스트(엔진 로직: placeBid 검증, 타이머 만료, 권한)와 통합 시나리오(비로그인 관전, 팀장 입찰 제한, 관리자 진행, 팀 CRUD, 2개 탭 SSE 동기화) + `next build`.

## 9. 위험 / 트레이드오프
- 단일 프로세스 인메모리 SSE 버스 → 수평 확장 불가(문서화, 필요 시 LISTEN/NOTIFY).
- 서버 타이머는 프로세스 재시작 시 휘발 → 재시작 후 `bidDeadline`으로 복구 로직 또는 진행 일시정지(복구 시 deadline 재평가).
- Postgres 로컬 설치 필요(현재 환경 미설치 확인됨) — `brew install postgresql@16` 등 셋업 단계를 구현 초반에 수행. README/.env.example로 안내.
- 목업→실서비스 전환이라 작업량 큼: 마이그레이션·시드·인증·SSE·UI 재배선 단계로 분할 진행.
```
