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

export const COLORS = {
  surfaceBg: '#F6F7F9',
  panelBg: '#FFFFFF',
  panelBgStrong: '#F1F3F5',
  panelBgMuted: '#E5E7EB',
  panelBgElevated: '#FFFFFF',

  accent: '#111827',
  accentSoft: '#374151',
  accentMuted: '#E8EEF7',

  textPrimary: '#111827',
  textMuted: '#6B7280',
  textOnAccent: '#FFFFFF',

  danger: '#E11D48',
  dangerSoft: '#FFF1F2',
  success: '#059669',
  successSoft: '#ECFDF5',
  warning: '#D97706',
  warningSoft: '#FFFBEB',
  border: '#E5E7EB',
  borderStrong: '#D1D5DB',
  shadow: '0 18px 45px rgba(17, 24, 39, 0.08)',
  shadowSoft: '0 10px 24px rgba(17, 24, 39, 0.05)',

  highlight: '#DBEAFE',
  highlightStrong: '#BFDBFE',
} as const;

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
