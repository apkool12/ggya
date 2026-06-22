import { subscribeChat, recentChat } from '@/server/chatBus';
import { ensureDiscordStarted } from '@/server/discord';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 디스코드 채널 미러용 채팅 SSE. 경매 스트림과 분리(빈도·관심사 차이).
export async function GET() {
  ensureDiscordStarted();
  const encoder = new TextEncoder();
  let unsub: () => void = () => {};
  let ping: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    start(controller) {
      const send = (s: string) => {
        try {
          controller.enqueue(encoder.encode(s));
        } catch {
          /* controller closed */
        }
      };
      // 접속 즉시 최근 기록을 전송해 빈 패널을 피한다.
      for (const msg of recentChat()) send(`data: ${JSON.stringify(msg)}\n\n`);
      unsub = subscribeChat(send);
      ping = setInterval(() => send(`: ping\n\n`), 15000);
    },
    cancel() {
      unsub();
      clearInterval(ping);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
