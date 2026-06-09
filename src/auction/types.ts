export type PlayerRole = '탱커' | '딜러' | '힐러';
export type PlayerStatus = '대기중' | '경매중' | '낙찰완료' | '유찰';

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  avatar: string;
  status: PlayerStatus;
  cost?: number;
  /** 선호 픽 영웅 portrait URL[] (서버 스냅샷에서 제공) */
  mostPicks?: string[];
}

export interface Team {
  id: string;
  name: string;
  leader: string;
  avatar: string;
  points: number;
  startingPoints?: number;
  roster: (Player | null)[];
}

export interface ChatMessage {
  sender: string;
  message: string;
  color: string;
}

export interface AuctionSnapshot {
  teams: Team[];
  players: Player[];
}
