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

// 러너리그풍 브라운/골드 방송 팔레트
export const COLORS = {
  surfaceBg: '#1A1410',
  panelBg: '#241B14',
  panelBgStrong: '#2E2218',
  panelBgMuted: '#3A2C20',
  panelBgElevated: '#2A1F17',

  accent: '#C9962E', // 골드
  accentSoft: '#E0B252',
  accentMuted: '#3A2C1A',

  textPrimary: '#F4E9DA', // 크림
  textMuted: '#B49C82', // 토프
  textOnAccent: '#1A1206', // 골드 위 어두운 텍스트

  danger: '#E0613E', // 번트 오렌지
  dangerSoft: 'rgba(224, 97, 62, 0.16)',
  success: '#A7B85A', // 올리브 그린
  successSoft: 'rgba(167, 184, 90, 0.16)',
  warning: '#E0A53E',
  warningSoft: 'rgba(224, 165, 62, 0.16)',
  border: '#3A2C20',
  borderStrong: '#503C2A',
  shadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
  shadowSoft: '0 10px 26px rgba(0, 0, 0, 0.42)',

  highlight: 'rgba(201, 150, 46, 0.18)',
  highlightStrong: 'rgba(201, 150, 46, 0.55)',
} as const;

// 역할군별 색 — 브라운 배경에 어울리는 어시 톤, 구분은 유지
export const ROLE_COLORS: Record<'TANK' | 'DPS' | 'SUPPORT', { main: string; soft: string }> = {
  TANK: { main: '#79A6B8', soft: 'rgba(121, 166, 184, 0.18)' }, // 스틸 블루
  DPS: { main: '#D9774B', soft: 'rgba(217, 119, 75, 0.18)' }, // 테라코타
  SUPPORT: { main: '#AEBE63', soft: 'rgba(174, 190, 99, 0.18)' }, // 올리브
};

export const ROLE_COLORS_KO: Record<'탱커' | '딜러' | '힐러', { main: string; soft: string }> = {
  탱커: ROLE_COLORS.TANK,
  딜러: ROLE_COLORS.DPS,
  힐러: ROLE_COLORS.SUPPORT,
};

// 팀 카드 포인트 컬러 (브라운 톤 안에서 순환)
export const TEAM_ACCENTS = ['#C9962E', '#D9774B', '#AEBE63', '#C98AA0', '#79A6B8', '#B5853F'] as const;

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
