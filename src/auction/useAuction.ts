'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CHAT_INTERVAL_MS,
  INITIAL_LOGS,
  MAX_CHAT_HISTORY,
  MIN_STARTING_BID,
  STORAGE_KEYS,
  TIMER_INITIAL_SECONDS,
  TIMER_STEP_SECONDS,
  TIMER_TICK_MS,
} from './constants';
import {
  CHAT_TEMPLATES,
  INITIAL_CHAT,
  INITIAL_PLAYERS,
  INITIAL_TEAMS,
  shuffleInPlace,
} from './data';
import type { AuctionSnapshot, ChatMessage, Player, Team } from './types';

const readStorage = <T,>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export interface AuctionApi {
  // state
  teams: Team[];
  players: Player[];
  logs: string[];
  chat: ChatMessage[];
  currentBid: number;
  customBid: string;
  timer: number;
  timerActive: boolean;

  // derived
  activePlayer: Player | null;
  highestBidder: Team | null;
  nextPlayer: Player | null;
  waitingCount: number;
  unsoldPlayers: Player[];

  // actions
  setCustomBid: (v: string) => void;
  selectPlayer: (player: Player) => void;
  quickBid: (amount: number) => void;
  submitManualBid: () => void;
  setBidder: (team: Team) => void;
  markUnsold: () => void;
  confirmBidWin: () => void;
  exportJson: () => void;
  importJson: (file: File) => void;
  resetAll: () => void;
  toggleTimer: () => void;
  resetTimer: () => void;
}

export function useAuction(): AuctionApi {
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [highestBidderId, setHighestBidderId] = useState<string | null>(null);
  const [currentBid, setCurrentBid] = useState<number>(0);
  const [customBid, setCustomBid] = useState<string>('');
  const [timer, setTimer] = useState<number>(TIMER_INITIAL_SECONDS);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>(INITIAL_LOGS);
  const [chat, setChat] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [isHydrated, setIsHydrated] = useState(false);

  // Stable addLog so it can be safely referenced from inside effects/callbacks.
  const addLog = useCallback((msg: string) => {
    setLogs((prev) => [...prev, msg]);
  }, []);

  // Derived selectors
  const activePlayer = useMemo<Player | null>(
    () => players.find((p) => p.status === '경매중') ?? null,
    [players],
  );

  const highestBidder = useMemo<Team | null>(() => {
    if (!highestBidderId) return null;
    return teams.find((t) => t.id === highestBidderId) ?? null;
  }, [highestBidderId, teams]);

  const nextPlayer = useMemo<Player | null>(() => {
    if (!activePlayer) return null;
    const idx = players.findIndex((p) => p.id === activePlayer.id);
    if (idx === -1) return null;
    // Look forward first, then wrap around.
    for (let i = idx + 1; i < players.length; i++) {
      if (players[i].status === '대기중') return players[i];
    }
    for (let i = 0; i < idx; i++) {
      if (players[i].status === '대기중') return players[i];
    }
    return null;
  }, [activePlayer, players]);

  const waitingCount = useMemo(
    () => players.filter((p) => p.status === '대기중').length,
    [players],
  );

  const unsoldPlayers = useMemo(
    () => players.filter((p) => p.status === '유찰'),
    [players],
  );

  // -------------------- Persistence (atomic init + throttled writes) --------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedTeams = readStorage<Team[]>(STORAGE_KEYS.teams);
    const savedPlayers = readStorage<Player[]>(STORAGE_KEYS.players);
    const wasShuffled = window.localStorage.getItem(STORAGE_KEYS.shuffleMarker);

    if (savedTeams) setTeams(savedTeams);

    if (savedPlayers) {
      setPlayers(savedPlayers);
      addLog('저장된 경매 상태를 성공적으로 로드했습니다.');
    } else if (!wasShuffled) {
      setPlayers((prev) => shuffleInPlace(prev));
      window.localStorage.setItem(STORAGE_KEYS.shuffleMarker, 'true');
      addLog('경매 순서가 랜덤으로 무작위 셔플되었습니다.');
    }

    setIsHydrated(true);
  }, [addLog]);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEYS.teams, JSON.stringify(teams));
  }, [teams, isHydrated]);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEYS.players, JSON.stringify(players));
  }, [players, isHydrated]);

  // -------------------- Stream chat simulator --------------------
  useEffect(() => {
    const id = window.setInterval(() => {
      const msg =
        CHAT_TEMPLATES[Math.floor(Math.random() * CHAT_TEMPLATES.length)];
      setChat((prev) => [...prev, msg].slice(-MAX_CHAT_HISTORY));
    }, CHAT_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

  // -------------------- Timer (stable interval; no recreation per tick) --------------------
  useEffect(() => {
    if (!timerActive) return;
    const id = window.setInterval(() => {
      setTimer((prev) => {
        const next = +(prev - TIMER_STEP_SECONDS).toFixed(2);
        return next > 0 ? next : 0;
      });
    }, TIMER_TICK_MS);
    return () => window.clearInterval(id);
  }, [timerActive]);

  // Capture latest snapshot for the expiry side-effect without re-creating the timer effect.
  const activePlayerRef = useRef(activePlayer);
  const highestBidderRef = useRef(highestBidder);
  useEffect(() => {
    activePlayerRef.current = activePlayer;
    highestBidderRef.current = highestBidder;
  }, [activePlayer, highestBidder]);

  useEffect(() => {
    if (!timerActive || timer > 0) return;
    setTimerActive(false);
    addLog('⏰ [TIME OUT] 경매 시간이 만료되었습니다.');
    const current = activePlayerRef.current;
    if (current && !highestBidderRef.current) {
      setPlayers((prev) =>
        prev.map((p) => (p.id === current.id ? { ...p, status: '유찰' } : p)),
      );
      addLog(`⚠️ [유찰] 입찰자가 없어 ${current.name} 선수가 유찰 처리되었습니다.`);
      setHighestBidderId(null);
      setCurrentBid(0);
    }
  }, [timer, timerActive, addLog]);

  // -------------------- Actions --------------------
  const selectPlayer = useCallback(
    (player: Player) => {
      if (player.status === '낙찰완료') {
        addLog(`❌ [알림] ${player.name} 선수는 이미 낙찰 완료되었습니다.`);
        return;
      }

      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id === player.id) return { ...p, status: '경매중' };
          if (p.status === '경매중') return { ...p, status: '대기중' };
          return p;
        }),
      );
      setCurrentBid(MIN_STARTING_BID);
      setHighestBidderId(null);
      setTimer(TIMER_INITIAL_SECONDS);
      setTimerActive(false);
      addLog(
        `📢 [경매 타겟] ${player.name} (${player.role}) 선수의 경매가 시작되었습니다.`,
      );
    },
    [addLog],
  );

  const guardBid = useCallback(
    (nextBid: number): boolean => {
      if (highestBidder) {
        if (nextBid > highestBidder.points) {
          addLog(
            `❌ [오류] 최고 입찰자인 ${highestBidder.name}의 잔여 P(${highestBidder.points}P)를 초과할 수 없습니다.`,
          );
          return false;
        }
        return true;
      }
      const maxPoints = Math.max(...teams.map((t) => t.points));
      if (nextBid > maxPoints) {
        addLog(
          `❌ [오류] 어떤 팀도 입찰할 수 없는 금액(${nextBid}P)입니다. (최대 잔여 P: ${maxPoints}P)`,
        );
        return false;
      }
      return true;
    },
    [addLog, highestBidder, teams],
  );

  const quickBid = useCallback(
    (amount: number) => {
      if (!activePlayer) return;
      const nextBid = currentBid + amount;
      if (!guardBid(nextBid)) return;
      setCurrentBid(nextBid);
      setTimer(TIMER_INITIAL_SECONDS);
      setTimerActive(true);
      addLog(`💰 [입찰] 현재 입찰가 ${nextBid}P로 갱신되었습니다.`);
    },
    [activePlayer, addLog, currentBid, guardBid],
  );

  const submitManualBid = useCallback(() => {
    if (!activePlayer || !customBid) return;
    const bidVal = Number.parseInt(customBid, 10);
    if (Number.isNaN(bidVal) || bidVal <= currentBid) {
      addLog(`❌ [오류] 현재 입찰가(${currentBid}P)보다 큰 금액을 입력해주세요.`);
      return;
    }
    if (!guardBid(bidVal)) return;
    setCurrentBid(bidVal);
    setCustomBid('');
    setTimer(TIMER_INITIAL_SECONDS);
    setTimerActive(true);
    addLog(`💰 [입찰] 수동 입찰가 ${bidVal}P로 갱신되었습니다.`);
  }, [activePlayer, addLog, currentBid, customBid, guardBid]);

  const setBidder = useCallback(
    (team: Team) => {
      if (!activePlayer) return;

      // 해당 포지션(역할군)의 빈 슬롯 확인 (탱커: index 0, 딜러: 1~2, 힐러: 3~4)
      let slotIdx = -1;
      const role = activePlayer.role;
      if (role === '탱커') {
        if (team.roster[0] === null) slotIdx = 0;
      } else if (role === '딜러') {
        if (team.roster[1] === null) slotIdx = 1;
        else if (team.roster[2] === null) slotIdx = 2;
      } else if (role === '힐러') {
        if (team.roster[3] === null) slotIdx = 3;
        else if (team.roster[4] === null) slotIdx = 4;
      }

      if (slotIdx === -1) {
        addLog(`❌ [오류] ${team.name}팀은 이미 해당 포지션(${role})의 로스터가 모두 채워졌습니다.`);
        return;
      }

      if (team.points < currentBid) {
        addLog(`❌ [오류] ${team.name}의 잔여 P가 부족합니다.`);
        return;
      }
      setHighestBidderId(team.id);
      setTimer(TIMER_INITIAL_SECONDS);
      setTimerActive(true);
      addLog(
        `👉 [최고 입찰팀] ${team.name} (${team.leader} 팀장님)가 최고 입찰자로 설정되었습니다! (${currentBid}P)`,
      );
    },
    [activePlayer, addLog, currentBid],
  );

  const markUnsold = useCallback(() => {
    if (!activePlayer) {
      addLog('❌ [오류] 유찰 처리할 입찰 대상 선수가 없습니다.');
      return;
    }
    const targetId = activePlayer.id;
    const targetName = activePlayer.name;
    setPlayers((prev) =>
      prev.map((p) => (p.id === targetId ? { ...p, status: '유찰' } : p)),
    );
    addLog(`⚠️ [유찰 완료] ${targetName} 선수가 수동 유찰 처리되었습니다.`);
    setHighestBidderId(null);
    setCurrentBid(0);
    setTimer(TIMER_INITIAL_SECONDS);
    setTimerActive(false);
  }, [activePlayer, addLog]);

  const confirmBidWin = useCallback(() => {
    if (!activePlayer || !highestBidder) {
      addLog('❌ [오류] 입찰 대상 선수와 최고 입찰자가 있어야 낙찰 처리가 가능합니다.');
      return;
    }

    // 해당 포지션(역할군)의 빈 슬롯 확인 및 할당 (탱커: index 0, 딜러: 1~2, 힐러: 3~4)
    let emptyIdx = -1;
    const role = activePlayer.role;
    if (role === '탱커') {
      if (highestBidder.roster[0] === null) emptyIdx = 0;
    } else if (role === '딜러') {
      if (highestBidder.roster[1] === null) emptyIdx = 1;
      else if (highestBidder.roster[2] === null) emptyIdx = 2;
    } else if (role === '힐러') {
      if (highestBidder.roster[3] === null) emptyIdx = 3;
      else if (highestBidder.roster[4] === null) emptyIdx = 4;
    }

    if (emptyIdx === -1) {
      addLog(`❌ [오류] ${highestBidder.name}팀은 이미 해당 포지션(${role})의 로스터가 모두 채워졌습니다.`);
      return;
    }

    const winningTeamId = highestBidder.id;
    const winningTeamName = highestBidder.name;
    const playerId = activePlayer.id;
    const playerName = activePlayer.name;
    const finalBid = currentBid;

    setTeams((prev) =>
      prev.map((t) => {
        if (t.id !== winningTeamId) return t;
        const roster = [...t.roster];
        roster[emptyIdx] = {
          ...activePlayer,
          status: '낙찰완료',
          cost: finalBid,
        };
        return { ...t, points: t.points - finalBid, roster };
      }),
    );

    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId ? { ...p, status: '낙찰완료', cost: finalBid } : p,
      ),
    );

    addLog(
      `🎉 [낙찰!] ${playerName} 선수가 ${finalBid}P에 [${winningTeamName}]으로 낙찰되었습니다!`,
    );
    setHighestBidderId(null);
    setCurrentBid(0);
    setTimer(TIMER_INITIAL_SECONDS);
    setTimerActive(false);
  }, [activePlayer, addLog, currentBid, highestBidder]);

  const exportJson = useCallback(() => {
    const snapshot: AuctionSnapshot = { teams, players };
    const data = `data:application/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(snapshot, null, 2),
    )}`;
    const filename = `ow_auction_state_${new Date().toISOString().slice(0, 10)}.json`;
    const link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
    addLog('💾 [성공] 현재 경매 현황이 JSON 파일로 다운로드되었습니다.');
  }, [addLog, players, teams]);

  const importJson = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text !== 'string') return;
        try {
          const parsed = JSON.parse(text) as Partial<AuctionSnapshot>;
          if (
            Array.isArray(parsed.teams) &&
            Array.isArray(parsed.players) &&
            parsed.teams.length > 0 &&
            parsed.players.length > 0
          ) {
            setTeams(parsed.teams as Team[]);
            setPlayers(parsed.players as Player[]);
            setHighestBidderId(null);
            setCurrentBid(0);
            setTimerActive(false);
            setTimer(TIMER_INITIAL_SECONDS);
            addLog('📂 [성공] 선택한 JSON 파일에서 경매 데이터를 복원했습니다.');
          } else {
            addLog('❌ [오류] 올바르지 않은 JSON 데이터 형식입니다.');
          }
        } catch {
          addLog('❌ [오류] JSON 파일 파싱 실패.');
        }
      };
      reader.readAsText(file, 'UTF-8');
    },
    [addLog],
  );

  const resetAll = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!window.confirm('모든 경매 현황을 초기 상태로 리셋하시겠습니까?')) return;
    window.localStorage.removeItem(STORAGE_KEYS.teams);
    window.localStorage.removeItem(STORAGE_KEYS.players);
    window.localStorage.removeItem(STORAGE_KEYS.shuffleMarker);
    window.location.reload();
  }, []);

  const toggleTimer = useCallback(() => {
    setTimerActive((prev) => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setTimer(TIMER_INITIAL_SECONDS);
    setTimerActive(false);
    addLog('⏰ 타이머가 15.00초로 재설정되었습니다.');
  }, [addLog]);

  return {
    teams,
    players,
    logs,
    chat,
    currentBid,
    customBid,
    timer,
    timerActive,
    activePlayer,
    highestBidder,
    nextPlayer,
    waitingCount,
    unsoldPlayers,
    setCustomBid,
    selectPlayer,
    quickBid,
    submitManualBid,
    setBidder,
    markUnsold,
    confirmBidWin,
    exportJson,
    importJson,
    resetAll,
    toggleTimer,
    resetTimer,
  };
}
