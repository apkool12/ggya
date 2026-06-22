import { Client, Events, GatewayIntentBits } from 'discord.js';
import { CHAT_INTERVAL_MS } from '../auction/constants';
import { publishChat, type ChatMsg } from './chatBus';

// 봇 미설정/로그인 실패 시 화면이 비지 않게 흘려보낼 방송 분위기용 문구(자체 내장).
const CHAT_TEMPLATES: ChatMsg[] = [
  { sender: '네클릿짱', message: '오 순당무 힐러진 든든하네요', color: '#b39ddb' },
  { sender: '자낳대원년멤버', message: '이번 매물 진짜 치열할듯', color: '#81c784' },
  { sender: '치직치직', message: '러너팀 엠비션 먹으면 딜러진 끝남', color: '#e0e0e0' },
  { sender: '포인트부자', message: '1000P 다 박아도 인정이죠', color: '#ff8a80' },
  { sender: 'LckFan', message: '따효니 벌써 입찰 대기중이네', color: '#ffd54f' },
  { sender: '롤선생', message: '딜러 박나나 가성비 좋은데?', color: '#4db6ac' },
];

// 같은 닉네임이 항상 같은 색을 갖도록 하는 고정 팔레트(방송 톤).
const COLOR_PALETTE = [
  '#ff5252', '#ffb74d', '#4fc3f7', '#b39ddb', '#81c784',
  '#e0e0e0', '#ff8a80', '#ffd54f', '#4db6ac', '#ea80fc',
];

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length];
}

// 최초 1회만 시작하도록 가드. recoverTimer와 동일한 지연 초기화 패턴.
let started = false;
let simTimer: ReturnType<typeof setInterval> | null = null;

// 봇 미설정/로그인 실패 시 방송 화면이 비지 않도록 시뮬레이션 채팅을 흘려보낸다.
function startSimulationFallback(): void {
  if (simTimer) return;
  simTimer = setInterval(() => {
    const t = CHAT_TEMPLATES[Math.floor(Math.random() * CHAT_TEMPLATES.length)];
    publishChat({ sender: t.sender, message: t.message, color: t.color });
  }, CHAT_INTERVAL_MS);
}

export function ensureDiscordStarted(): void {
  if (started) return;
  started = true;

  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_CHANNEL_ID;

  if (!token || !channelId) {
    console.warn('[discord] DISCORD_BOT_TOKEN/DISCORD_CHANNEL_ID 미설정 — 시뮬레이션 채팅으로 폴백합니다.');
    startSimulationFallback();
    return;
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.once(Events.ClientReady, (c) => {
    console.log(`[discord] 봇 연결 완료: ${c.user.tag} (채널 ${channelId})`);
  });

  client.on(Events.MessageCreate, (message) => {
    if (message.channelId !== channelId) return;
    if (message.author.bot) return;
    const content = message.content.trim();
    if (!content) return; // 첨부/임베드만 있는 메시지는 무시

    const sender = message.member?.displayName ?? message.author.username;
    const hex = message.member?.displayHexColor;
    const color = hex && hex !== '#000000' ? hex : colorFor(sender);
    const msg: ChatMsg = { sender, message: content, color };
    publishChat(msg);
  });

  client.on(Events.Error, (err) => {
    console.error('[discord] 클라이언트 오류:', err);
  });

  client.login(token).catch((err) => {
    console.error('[discord] 로그인 실패 — 시뮬레이션 채팅으로 폴백합니다:', err);
    startSimulationFallback();
  });
}
