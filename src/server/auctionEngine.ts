import { TIMER_INITIAL_SECONDS } from '../auction/constants';
import { findFreeSlot, validateBid } from './auctionLogic';
import { prisma } from './db';
import { buildSnapshot } from './snapshot';
import { broadcast } from './sse';

let expiryTimer: ReturnType<typeof setTimeout> | null = null;

async function addLog(message: string) {
  await prisma.logEntry.create({ data: { message } });
}

async function publish() {
  broadcast(await buildSnapshot());
}

function clearExpiryTimer() {
  if (expiryTimer) {
    clearTimeout(expiryTimer);
    expiryTimer = null;
  }
}

function armExpiryTimer(deadline: Date) {
  clearExpiryTimer();
  const ms = Math.max(0, deadline.getTime() - Date.now());
  expiryTimer = setTimeout(() => {
    void expire();
  }, ms);
}

export async function selectPlayer(playerId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const player = await tx.player.findUnique({ where: { id: playerId } });
    if (!player || player.status === 'SOLD') return;
    await tx.player.updateMany({ where: { status: 'ACTIVE' }, data: { status: 'WAITING' } });
    await tx.player.update({ where: { id: playerId }, data: { status: 'ACTIVE' } });
    await tx.auctionState.update({
      where: { id: 1 },
      data: {
        phase: 'BIDDING',
        activePlayerId: playerId,
        currentBid: 0,
        highestBidderTeamId: null,
        bidDeadline: null,
      },
    });
  });
  clearExpiryTimer();
  const p = await prisma.player.findUnique({ where: { id: playerId } });
  await addLog(`📢 [경매 타겟] ${p?.name} 선수의 경매가 시작되었습니다.`);
  await publish();
}

export async function drawRandomPlayer(): Promise<{ ok: boolean; error?: string }> {
  const waiting = await prisma.player.findMany({ where: { status: 'WAITING' } });
  if (waiting.length === 0) {
    await addLog('🎲 [추첨] 남은 대기 선수가 없습니다.');
    await publish();
    return { ok: false, error: '남은 대기 선수가 없습니다.' };
  }
  const pick = waiting[Math.floor(Math.random() * waiting.length)];
  await addLog(`🎲 [랜덤 추첨] ${pick.name} 선수가 추첨되었습니다!`);
  await selectPlayer(pick.id);
  return { ok: true };
}

export async function placeBid(
  teamId: string,
  amount: number,
): Promise<{ ok: boolean; error?: string }> {
  let deadlineToArm: Date | null = null;
  const result = await prisma.$transaction(async (tx): Promise<{ ok: boolean; error?: string }> => {
    const state = await tx.auctionState.findUniqueOrThrow({ where: { id: 1 } });
    const active = state.activePlayerId
      ? await tx.player.findUnique({ where: { id: state.activePlayerId } })
      : null;
    const team = await tx.team.findUnique({ where: { id: teamId }, include: { roster: true } });
    if (!team) return { ok: false, error: '팀을 찾을 수 없습니다.' };
    const occupied = team.roster
      .map((r) => r.slotIndex)
      .filter((n): n is number => n != null);

    const v = validateBid({
      phase: state.phase,
      hasActivePlayer: !!active,
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
    const team = await tx.team.findUniqueOrThrow({
      where: { id: state.highestBidderTeamId },
      include: { roster: true },
    });
    const occupied = team.roster
      .map((r) => r.slotIndex)
      .filter((n): n is number => n != null);
    const slot = findFreeSlot(occupied);
    if (slot === -1) return { ok: false, error: '로스터가 가득 찼습니다.' };
    if (team.points < state.currentBid) return { ok: false, error: '포인트 부족.' };

    await tx.player.update({
      where: { id: active.id },
      data: { status: 'SOLD', cost: state.currentBid, teamId: team.id, slotIndex: slot },
    });
    await tx.team.update({
      where: { id: team.id },
      data: { points: team.points - state.currentBid },
    });
    await tx.auctionState.update({
      where: { id: 1 },
      data: {
        phase: 'IDLE',
        activePlayerId: null,
        currentBid: 0,
        highestBidderTeamId: null,
        bidDeadline: null,
      },
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
      await tx.player.update({
        where: { id: state.activePlayerId },
        data: { status: 'UNSOLD' },
      });
    await tx.auctionState.update({
      where: { id: 1 },
      data: {
        phase: 'IDLE',
        activePlayerId: null,
        currentBid: 0,
        highestBidderTeamId: null,
        bidDeadline: null,
      },
    });
  });
  clearExpiryTimer();
  await addLog('⚠️ [유찰] 선수가 유찰 처리되었습니다.');
  await publish();
}

async function expire(): Promise<void> {
  const state = await prisma.auctionState.findUnique({ where: { id: 1 } });
  if (!state || state.phase !== 'BIDDING') return;
  if (state.highestBidderTeamId) {
    // 시간 만료 → 최고 입찰팀에 자동 낙찰
    await addLog('⏰ [TIME OUT] 시간 만료 — 자동 낙찰 처리합니다.');
    await confirmWin();
  } else {
    await markUnsold();
  }
}

export async function resetAuction(): Promise<void> {
  clearExpiryTimer();
  await prisma.$transaction(async (tx) => {
    await tx.player.updateMany({
      data: { status: 'WAITING', cost: null, teamId: null, slotIndex: null },
    });
    const teams = await tx.team.findMany();
    for (const t of teams)
      await tx.team.update({ where: { id: t.id }, data: { points: t.startingPoints } });
    await tx.auctionState.update({
      where: { id: 1 },
      data: {
        phase: 'IDLE',
        activePlayerId: null,
        currentBid: 0,
        highestBidderTeamId: null,
        bidDeadline: null,
      },
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
