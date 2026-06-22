import { ROSTER_SIZE } from '../auction/constants';
import type {
  AuctionSnapshot,
  PlayerStatusEn,
  SnapPlayer,
  SnapTeam,
} from '../shared/snapshot-types';
import type { PlayerRoleEn } from '../shared/roles';
import { prisma } from './db';

export function buildRoster(teamPlayers: SnapPlayer[]): (SnapPlayer | null)[] {
  const roster: (SnapPlayer | null)[] = Array.from({ length: ROSTER_SIZE }, () => null);
  for (const p of teamPlayers) {
    if (p.slotIndex != null && p.slotIndex >= 0 && p.slotIndex < ROSTER_SIZE) {
      roster[p.slotIndex] = p;
    }
  }
  return roster;
}

interface DbPlayer {
  id: string;
  name: string;
  role: PlayerRoleEn;
  avatarUrl: string;
  status: PlayerStatusEn;
  cost: number | null;
  teamId: string | null;
  slotIndex: number | null;
  mostPicks: string[];
  order: number;
  tankTier: string;
  dpsTier: string;
  supportTier: string;
}

const toSnapPlayer = (p: DbPlayer): SnapPlayer => ({
  id: p.id,
  name: p.name,
  role: p.role,
  avatarUrl: p.avatarUrl,
  status: p.status,
  cost: p.cost,
  teamId: p.teamId,
  slotIndex: p.slotIndex,
  mostPicks: p.mostPicks,
  order: p.order,
  tankTier: p.tankTier,
  dpsTier: p.dpsTier,
  supportTier: p.supportTier,
});

export async function buildSnapshot(): Promise<AuctionSnapshot> {
  const [teams, players, state, logs] = await Promise.all([
    prisma.team.findMany({ orderBy: { order: 'asc' }, include: { roster: true } }),
    prisma.player.findMany({ orderBy: { order: 'asc' } }),
    prisma.auctionState.findUnique({ where: { id: 1 } }),
    prisma.logEntry.findMany({ orderBy: { id: 'desc' }, take: 40 }),
  ]);

  const snapTeams: SnapTeam[] = teams.map((t) => ({
    id: t.id,
    name: t.name,
    leaderName: t.leaderName,
    avatarUrl: t.avatarUrl,
    points: t.points,
    startingPoints: t.startingPoints,
    roster: buildRoster(t.roster.map(toSnapPlayer)),
  }));

  return {
    teams: snapTeams,
    players: players.map(toSnapPlayer),
    phase: state?.phase ?? 'IDLE',
    activePlayerId: state?.activePlayerId ?? null,
    currentBid: state?.currentBid ?? 0,
    highestBidderTeamId: state?.highestBidderTeamId ?? null,
    bidDeadline: state?.bidDeadline ? state.bidDeadline.toISOString() : null,
    logs: logs.reverse().map((l) => l.message),
    serverNow: new Date().toISOString(),
  };
}
