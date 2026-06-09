export const STARTING_POINTS = 1000;
export const ROSTER_SIZE = 5;
export const MIN_STARTING_BID = 5;
export const BID_INCREMENTS = [5, 10, 50, 100] as const;

export const TIMER_INITIAL_SECONDS = 15;
export const TIMER_STEP_SECONDS = 0.05;
export const TIMER_TICK_MS = 50;

export const MAX_CHAT_HISTORY = 30;
export const CHAT_INTERVAL_MS = 4000;

export const INITIAL_LOGS = [
  '서버에 접속 중입니다.',
  '서버에 접속을 완료했습니다.',
  '오버워치 경매 시스템 로드 완료.',
];

export const STORAGE_KEYS = {
  teams: 'ow_auction_teams',
  players: 'ow_auction_players',
  shuffleMarker: 'ow_auction_players_shuffled',
} as const;

// e스포츠 방송 톤 다크 팔레트
export const COLORS = {
  surfaceBg: '#0B0F1A',
  panelBg: '#141A2A',
  panelBgStrong: '#1C2436',
  panelBgMuted: '#2A3348',
  panelBgElevated: '#1A2133',

  accent: '#6D63FF',
  accentSoft: '#8B82FF',
  accentMuted: '#232A42',

  textPrimary: '#EEF2F8',
  textMuted: '#93A0B8',
  textOnAccent: '#FFFFFF',

  danger: '#FF5470',
  dangerSoft: 'rgba(255, 84, 112, 0.16)',
  success: '#34D399',
  successSoft: 'rgba(52, 211, 153, 0.16)',
  warning: '#FBBF24',
  warningSoft: 'rgba(251, 191, 36, 0.16)',
  border: '#28304A',
  borderStrong: '#3B4760',
  shadow: '0 20px 50px rgba(0, 0, 0, 0.55)',
  shadowSoft: '0 10px 26px rgba(0, 0, 0, 0.38)',

  highlight: 'rgba(109, 99, 255, 0.18)',
  highlightStrong: 'rgba(109, 99, 255, 0.55)',
} as const;

// 역할군별 색 (단색만 쓰지 않도록 포인트 컬러 분리)
export const ROLE_COLORS: Record<'TANK' | 'DPS' | 'SUPPORT', { main: string; soft: string }> = {
  TANK: { main: '#38BDF8', soft: 'rgba(56, 189, 248, 0.16)' }, // 시안/블루
  DPS: { main: '#FB7185', soft: 'rgba(251, 113, 133, 0.16)' }, // 로즈/레드
  SUPPORT: { main: '#34D399', soft: 'rgba(52, 211, 153, 0.16)' }, // 그린
};

export const ROLE_COLORS_KO: Record<'탱커' | '딜러' | '힐러', { main: string; soft: string }> = {
  탱커: ROLE_COLORS.TANK,
  딜러: ROLE_COLORS.DPS,
  힐러: ROLE_COLORS.SUPPORT,
};

// 팀 카드 포인트 컬러 (순환)
export const TEAM_ACCENTS = ['#6D63FF', '#F59E0B', '#22D3EE', '#F472B6', '#34D399', '#A78BFA'] as const;

import type { SxProps, Theme } from '@mui/material/styles';

export const panelSx: SxProps<Theme> = {
  backgroundColor: COLORS.panelBg,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 2,
  boxShadow: COLORS.shadowSoft,
};

export const panelStrongSx: SxProps<Theme> = {
  backgroundColor: COLORS.panelBgStrong,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 2,
};

export const adPanelSx: SxProps<Theme> = {
  backgroundColor: COLORS.panelBg,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 2,
  boxShadow: COLORS.shadowSoft,
};
