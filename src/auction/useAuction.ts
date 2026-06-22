'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { roleToKo } from '@/shared/roles';
import type {
  AuctionPhaseEn,
  AuctionSnapshot,
  PlayerStatusEn,
  SnapPlayer,
  SnapTeam,
} from '@/shared/snapshot-types';
import type { Player, PlayerStatus, Team } from './types';

const STATUS_KO: Record<PlayerStatusEn, PlayerStatus> = {
  WAITING: '대기중',
  ACTIVE: '경매중',
  SOLD: '낙찰완료',
  UNSOLD: '유찰',
};

const EMPTY: AuctionSnapshot = {
  teams: [],
  players: [],
  phase: 'IDLE',
  activePlayerId: null,
  currentBid: 0,
  highestBidderTeamId: null,
  bidDeadline: null,
  logs: [],
  serverNow: new Date().toISOString(),
};

function toPlayer(p: SnapPlayer): Player {
  return {
    id: p.id,
    name: p.name,
    role: roleToKo(p.role),
    avatar: p.avatarUrl,
    status: STATUS_KO[p.status],
    cost: p.cost ?? undefined,
    mostPicks: p.mostPicks,
    order: p.order,
    teamId: p.teamId,
    tankTier: p.tankTier,
    dpsTier: p.dpsTier,
    supportTier: p.supportTier,
  };
}

function toTeam(t: SnapTeam): Team {
  return {
    id: t.id,
    name: t.name,
    leader: t.leaderName,
    avatar: t.avatarUrl,
    points: t.points,
    startingPoints: t.startingPoints,
    roster: t.roster.map((slot) => (slot ? toPlayer(slot) : null)),
  };
}

interface ActionResult {
  ok: boolean;
  error?: string;
}

export interface AuctionApi {
  teams: Team[];
  players: Player[];
  logs: string[];
  currentBid: number;
  phase: AuctionPhaseEn;
  timer: number;
  activePlayer: Player | null;
  highestBidder: Team | null;
  nextPlayer: Player | null;
  waitingCount: number;
  unsoldPlayers: Player[];
  selectPlayer: (playerId: string) => Promise<ActionResult>;
  drawPlayer: () => Promise<ActionResult>;
  placeBid: (teamId: string, amount: number) => Promise<ActionResult>;
  confirmWin: () => Promise<ActionResult>;
  markUnsold: () => Promise<ActionResult>;
  resetAll: () => Promise<ActionResult>;
}

export function useAuction(): AuctionApi {
  const [snap, setSnap] = useState<AuctionSnapshot>(EMPTY);
  const [now, setNow] = useState(() => Date.now());
  const clockSkew = useRef(0); // serverNow - clientNow (ms)

  const applySnap = useCallback((s: AuctionSnapshot) => {
    clockSkew.current = new Date(s.serverNow).getTime() - Date.now();
    setSnap(s);
  }, []);

  // 초기 스냅샷 + SSE 구독
  useEffect(() => {
    let closed = false;
    fetch('/api/auction/state')
      .then((r) => r.json())
      .then((s: AuctionSnapshot) => {
        if (!closed) applySnap(s);
      })
      .catch(() => {});

    const es = new EventSource('/api/auction/stream');
    es.onmessage = (e) => {
      try {
        applySnap(JSON.parse(e.data) as AuctionSnapshot);
      } catch {
        /* ignore malformed frame */
      }
    };
    return () => {
      closed = true;
      es.close();
    };
  }, [applySnap]);

  // 표시용 시계 (카운트다운)
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, []);

  const timer = useMemo(() => {
    if (!snap.bidDeadline) return 0;
    const remainMs = new Date(snap.bidDeadline).getTime() - (now + clockSkew.current);
    return Math.max(0, remainMs / 1000);
  }, [snap.bidDeadline, now]);

  const teams = useMemo(() => snap.teams.map(toTeam), [snap.teams]);
  const players = useMemo(() => snap.players.map(toPlayer), [snap.players]);

  const activePlayer = useMemo(
    () => players.find((p) => p.id === snap.activePlayerId) ?? null,
    [players, snap.activePlayerId],
  );
  const highestBidder = useMemo(
    () => teams.find((t) => t.id === snap.highestBidderTeamId) ?? null,
    [teams, snap.highestBidderTeamId],
  );
  const waitingCount = useMemo(
    () => players.filter((p) => p.status === '대기중').length,
    [players],
  );
  const unsoldPlayers = useMemo(
    () => players.filter((p) => p.status === '유찰'),
    [players],
  );
  const nextPlayer = useMemo(
    () => players.find((p) => p.status === '대기중') ?? null,
    [players],
  );

  const post = useCallback(async (url: string, body?: unknown): Promise<ActionResult> => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return { ok: false, error: (d.error as string) ?? '요청이 거부되었습니다.' };
    }
    return { ok: true };
  }, []);

  const selectPlayer = useCallback(
    (playerId: string) => post('/api/auction/select', { playerId }),
    [post],
  );
  const drawPlayer = useCallback(() => post('/api/auction/draw'), [post]);
  const placeBid = useCallback(
    (teamId: string, amount: number) => post('/api/auction/bid', { teamId, amount }),
    [post],
  );
  const confirmWin = useCallback(() => post('/api/auction/confirm'), [post]);
  const markUnsold = useCallback(() => post('/api/auction/unsold'), [post]);
  const resetAll = useCallback(() => post('/api/auction/reset'), [post]);

  return {
    teams,
    players,
    logs: snap.logs,
    currentBid: snap.currentBid,
    phase: snap.phase,
    timer,
    activePlayer,
    highestBidder,
    nextPlayer,
    waitingCount,
    unsoldPlayers,
    selectPlayer,
    drawPlayer,
    placeBid,
    confirmWin,
    markUnsold,
    resetAll,
  };
}
