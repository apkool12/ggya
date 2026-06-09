type Subscriber = (data: string) => void;

// 인메모리 구독자 집합 — 단일 Node 프로세스 한정.
// 다중 인스턴스 확장 시 Postgres LISTEN/NOTIFY 또는 Redis pub/sub로 대체 필요.
const subscribers = new Set<Subscriber>();

export function subscribe(fn: Subscriber): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

export function broadcast(snapshot: unknown): void {
  const payload = `data: ${JSON.stringify(snapshot)}\n\n`;
  for (const fn of subscribers) {
    try {
      fn(payload);
    } catch {
      /* dropped client */
    }
  }
}
