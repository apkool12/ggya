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

// 러너리그풍 라이트 크림/골드 방송 팔레트
export const COLORS = {
  surfaceBg: '#DDD0B6', // 따뜻한 파치먼트 (한 톤 어둡게 조절)
  panelBg: '#FFFDF8', // 아이보리 화이트
  panelBgStrong: '#F4ECDA', // 라이트 탄
  panelBgMuted: '#E6DAC2',
  panelBgElevated: '#FFFFFF',

  accent: '#B8902F', // 골드
  accentSoft: '#D4B25A',
  accentMuted: '#F0E6CC',

  textPrimary: '#2B2620', // 다크 에스프레소
  textMuted: '#857859', // 토프 그레이
  textOnAccent: '#33280C', // 골드 위 어두운 텍스트

  danger: '#BE3A2B', // 딥 레드
  dangerSoft: 'rgba(190, 58, 43, 0.12)',
  success: '#5E8C36', // 올리브 그린
  successSoft: 'rgba(94, 140, 54, 0.14)',
  warning: '#C2872A',
  warningSoft: 'rgba(194, 135, 42, 0.14)',
  border: 'rgba(184, 144, 47, 0.10)', // 탄/골드 테두리 (대폭 투명화)
  borderStrong: 'rgba(184, 144, 47, 0.20)',
  shadow: '0 12px 32px rgba(43, 38, 32, 0.05)',
  shadowSoft: '0 4px 16px rgba(43, 38, 32, 0.03)',

  highlight: 'rgba(184, 144, 47, 0.16)',
  highlightStrong: 'rgba(184, 144, 47, 0.55)',
} as const;

// 역할군별 색 — 라이트 배경에서 대비되는 진한 톤
export const ROLE_COLORS: Record<'TANK' | 'DPS' | 'SUPPORT', { main: string; soft: string }> = {
  TANK: { main: '#2F6E96', soft: 'rgba(47, 110, 150, 0.14)' }, // 스틸 블루
  DPS: { main: '#C0512E', soft: 'rgba(192, 81, 46, 0.14)' }, // 테라코타
  SUPPORT: { main: '#5E7D2E', soft: 'rgba(94, 125, 46, 0.14)' }, // 올리브
};

export const ROLE_COLORS_KO: Record<'탱커' | '딜러' | '힐러', { main: string; soft: string }> = {
  탱커: ROLE_COLORS.TANK,
  딜러: ROLE_COLORS.DPS,
  힐러: ROLE_COLORS.SUPPORT,
};

// 팀 번호 뱃지/포인트 컬러 (골드 + 주얼 톤 순환)
export const TEAM_ACCENTS = ['#B8902F', '#9C3B2E', '#3F6E4A', '#7A4E86', '#2F6E96', '#B5853F'] as const;

// 어두운 네임플레이트(선수 사진 아래 라벨) 색
export const NAMEPLATE_BG = '#2B2A33';
export const NAMEPLATE_TEXT = '#F4ECDA';

import type { SxProps, Theme } from '@mui/material/styles';

export const panelSx: SxProps<Theme> = {
  backgroundColor: COLORS.panelBg,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 3,
  boxShadow: COLORS.shadowSoft,
};

export const panelStrongSx: SxProps<Theme> = {
  backgroundColor: COLORS.panelBgStrong,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 3,
};

export const adPanelSx: SxProps<Theme> = {
  backgroundColor: COLORS.panelBg,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 3,
  boxShadow: COLORS.shadowSoft,
};
