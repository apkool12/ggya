import { recoverTimer } from '@/server/auctionEngine';
import { buildSnapshot } from '@/server/snapshot';
import { subscribe } from '@/server/sse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  await recoverTimer();
  const encoder = new TextEncoder();
  let unsub: () => void = () => {};
  let ping: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (s: string) => {
        try {
          controller.enqueue(encoder.encode(s));
        } catch {
          /* controller closed */
        }
      };
      send(`data: ${JSON.stringify(await buildSnapshot())}\n\n`);
      unsub = subscribe(send);
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
