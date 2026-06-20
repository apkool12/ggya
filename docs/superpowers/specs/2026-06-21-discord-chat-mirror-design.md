# 디스코드 채팅 미러 (읽기 전용) 설계

날짜: 2026-06-21

## 목적

경매 방송 화면의 채팅 패널(`StreamChat`)을 현재의 클라이언트 측 랜덤 시뮬레이션에서,
지정한 디스코드 채널의 실제 메시지를 실시간으로 보여주는 **읽기 전용 미러**로 교체한다.
웹에서 디스코드로 보내는 경로는 없다(단방향).

## 범위

- 포함: 디스코드 채널 → 웹 채팅 패널 실시간 표시, 봇 설정 가이드, 봇 미설정 시 시뮬레이션 폴백.
- 제외: 웹 → 디스코드 전송, 입력 UI, 경매 이벤트의 디스코드 알림, 메시지 영구 저장(DB).

## 아키텍처

단일 상주 Node 프로세스라는 기존 전제를 그대로 따른다. 경매 상태용 SSE(`sse.ts` +
`/api/auction/stream`)와 동일한 패턴을 채팅에도 별도로 둔다. 채팅은 경매 스냅샷과
무관하고 빈도가 높으므로 스냅샷에 합치지 않고 분리한다.

```
Discord Gateway (websocket)
        │ messageCreate
        ▼
src/server/discord.ts  ── 봇 싱글톤 + 인메모리 링버퍼 + 시뮬레이션 폴백
        │ publishChat(msg)
        ▼
src/server/chatBus.ts  ── 채팅 전용 구독자 집합 + 최근 메시지 버퍼
        │ broadcast
        ▼
/api/chat/stream (SSE)  ── 접속 시 버퍼 flush + 구독 등록 + 15s ping
        │ EventSource
        ▼
StreamChat.tsx  ── 누적 표시 (slice(-MAX_CHAT_HISTORY))
```

## 컴포넌트

### `src/server/chatBus.ts` (신규)

- 채팅 전용 구독자 `Set<(data: string) => void>`.
- 최근 `MAX_CHAT_HISTORY`개 메시지를 담는 인메모리 링버퍼.
- `subscribeChat(fn)`: 구독 등록 + 해제 함수 반환.
- `publishChat(msg: ChatMessage)`: 버퍼에 push(초과분 절단) 후 모든 구독자에 SSE 프레임 전송.
- `recentChat(): ChatMessage[]`: 신규 접속자에게 보낼 최근 기록.
- 경매용 `sse.ts`와 같은 인메모리·단일 프로세스 전제(주석 명시).

### `src/server/discord.ts` (신규)

- `discord.js` `Client` 싱글톤. 인텐트: `Guilds`, `GuildMessages`, `MessageContent`.
- 환경변수 `DISCORD_BOT_TOKEN`, `DISCORD_CHANNEL_ID`.
- `ensureDiscordStarted()`: 모듈 레벨 플래그로 가드하여 최초 1회만 실행
  (`recoverTimer`와 동일한 지연 초기화 패턴).
  - 토큰/채널 ID가 **둘 다 있으면**: `client.login()` 후 `messageCreate` 구독.
    대상 채널이고 봇 메시지가 아닐 때만 `{ sender, message, color }`로 변환해 `publishChat`.
    - `sender`: `member.displayName ?? author.username`.
    - `color`: 멤버의 역할 색이 기본값이 아니면 그 색, 아니면 username 해시로
      고정 팔레트에서 선택(같은 유저는 항상 같은 색).
  - 토큰/채널 ID가 **하나라도 없으면**: 봇을 시작하지 않고 **시뮬레이션 폴백** 가동
    — `CHAT_TEMPLATES`에서 `CHAT_INTERVAL_MS` 간격으로 골라 `publishChat`. 개발/데모 시
    방송 화면이 비지 않게 한다.
- 연결 실패·재연결은 `discord.js` 기본 동작에 위임. 로그인 실패 시 에러 로깅 후
  시뮬레이션 폴백으로 강등(화면이 죽지 않도록).

### `src/app/api/chat/stream/route.ts` (신규)

- 기존 `auction/stream/route.ts`와 동일 구조의 SSE GET 핸들러.
- `runtime = 'nodejs'`, `dynamic = 'force-dynamic'`.
- start: `ensureDiscordStarted()` 호출 → `recentChat()` 각 건을 즉시 전송 →
  `subscribeChat(send)` 등록 → 15초 ping.
- cancel: 구독 해제 + ping clear.

### `src/auction/components/StreamChat.tsx` (수정)

- `setInterval` 랜덤 시뮬레이션 제거.
- `new EventSource('/api/chat/stream')` 구독, `onmessage`로 받은 `ChatMessage`를
  `slice(-MAX_CHAT_HISTORY)`로 누적. 기존 렌더 로직(sender/message 표시)은 유지.
- 초기 상태는 빈 배열(서버 버퍼가 최근 기록을 보내줌). `INITIAL_CHAT` 의존 제거.
- 메시지에 `color`가 있으면 sender 색상에 반영(현 디자인 톤 유지 범위에서).

## 데이터 흐름

1. 봇이 디스코드 채널 메시지 수신 → `publishChat`.
2. `chatBus`가 버퍼에 적재 후 구독 중인 모든 SSE 연결로 전송.
3. 각 웹 클라이언트의 `EventSource`가 수신 → 패널에 누적 표시.
4. 신규 접속자는 접속 즉시 버퍼의 최근 메시지를 받아 빈 화면을 피한다.

## 에러 처리

- 봇 미설정/로그인 실패 → 시뮬레이션 폴백(화면 유지).
- SSE 전송 중 컨트롤러 닫힘 → try/catch로 무시(기존 패턴 동일).
- 잘못된 SSE 프레임 → 클라이언트에서 parse 실패 시 해당 프레임 무시.

## 테스트

- `chatBus`: 버퍼가 `MAX_CHAT_HISTORY`를 초과하지 않는지, 구독/해제, 발행 시 구독자에
  전달되는지 단위 테스트(vitest).
- `discord.js`는 외부 I/O라 단위 테스트 대상에서 제외(환경변수 분기 로직만 순수 함수로
  분리해 검증 가능하면 분리).
- 수동 검증: 봇 미설정 시 시뮬레이션이 패널에 흐르는지, `next build`/`tsc` 통과.

## 설정 가이드 (별도 문서: docs/discord-bot-setup.md)

1. Discord Developer Portal에서 Application 생성 → Bot 추가.
2. Bot 토큰 발급(Reset Token).
3. **Privileged Gateway Intents → MESSAGE CONTENT INTENT 활성화**.
4. OAuth2 URL Generator로 `bot` 스코프, 권한(View Channels, Read Message History)
   선택 후 서버 초대.
5. 디스코드 설정 → 고급 → 개발자 모드 on → 대상 채널 우클릭 → ID 복사.
6. `.env`에 `DISCORD_BOT_TOKEN`, `DISCORD_CHANNEL_ID` 설정.

## 폴백 정책 결정

봇 미설정 환경에서는 **기존 랜덤 시뮬레이션을 서버 측 폴백으로 유지**한다(빈 패널 대신).
시뮬레이션 코드(`CHAT_TEMPLATES`)는 서버 폴백에서 재사용한다.
