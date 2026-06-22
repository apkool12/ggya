import { MAX_CHAT_HISTORY } from '../auction/constants';

// 채팅 1건. 클라이언트 ChatMessage(src/auction/types.ts)와 구조 호환.
export interface ChatMsg {
  sender: string;
  message: string;
  color: string;
}

type Subscriber = (data: string) => void;

// 채팅 전용 인메모리 구독자 집합 + 최근 메시지 버퍼.
// 경매용 sse.ts와 동일하게 단일 Node 프로세스 한정.
// 다중 인스턴스 확장 시 Postgres LISTEN/NOTIFY 또는 Redis pub/sub로 대체 필요.
const subscribers = new Set<Subscriber>();
const buffer: ChatMsg[] = [];

export function subscribeChat(fn: Subscriber): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

// 신규 접속자에게 보낼 최근 기록 (오래된 → 최신 순).
export function recentChat(): ChatMsg[] {
  return [...buffer];
}

export function publishChat(msg: ChatMsg): void {
  buffer.push(msg);
  if (buffer.length > MAX_CHAT_HISTORY) buffer.splice(0, buffer.length - MAX_CHAT_HISTORY);

  const payload = `data: ${JSON.stringify(msg)}\n\n`;
  for (const fn of subscribers) {
    try {
      fn(payload);
    } catch {
      /* dropped client */
    }
  }
}
