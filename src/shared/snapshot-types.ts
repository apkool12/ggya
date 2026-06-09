import type { PlayerRoleEn } from './roles';

export type PlayerStatusEn = 'WAITING' | 'ACTIVE' | 'SOLD' | 'UNSOLD';
export type AuctionPhaseEn = 'IDLE' | 'BIDDING' | 'AWAITING_CONFIRM';

export interface SnapPlayer {
  id: string;
  name: string;
  role: PlayerRoleEn;
  avatarUrl: string;
  status: PlayerStatusEn;
  cost: number | null;
  teamId: string | null;
  slotIndex: number | null;
  mostPicks: string[];
}

export interface SnapTeam {
  id: string;
  name: string;
  leaderName: string;
  avatarUrl: string;
  points: number;
  startingPoints: number;
  roster: (SnapPlayer | null)[]; // 길이 5, 슬롯 인덱스 위치
}

export interface AuctionSnapshot {
  teams: SnapTeam[];
  players: SnapPlayer[];
  phase: AuctionPhaseEn;
  activePlayerId: string | null;
  currentBid: number;
  highestBidderTeamId: string | null;
  bidDeadline: string | null; // ISO
  logs: string[];
  serverNow: string; // ISO, 클라이언트 시계 보정용
}
