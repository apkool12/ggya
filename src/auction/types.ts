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
  order: number;
  teamId?: string | null;
  tankTier: string;
  dpsTier: string;
  supportTier: string;
  /** 한 줄 소개 (경매 순서 추첨 화면에 노출, 관리자 편집 가능) */
  intro?: string;
}

export interface Team {
  id: string;
  name: string;
  leader: string;
  avatar: string;
  points: number;
  startingPoints?: number;
  /** 팀장 선호 픽 영웅 portrait URL[] */
  mostPicks?: string[];
  /** 팀장 한 줄 소개 */
  intro?: string;
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
