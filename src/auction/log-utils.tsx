import { Box } from '@mui/material';
import {
  Bolt,
  Casino,
  EmojiEvents,
  Error as ErrorIcon,
  Healing,
  Paid,
  PlayArrow,
  Shield,
  Timer as TimerIcon,
} from '@mui/icons-material';
import type { PlayerRole } from './types';
import { COLORS } from './constants';

export const getRoleIcon = (role: PlayerRole) => {
  switch (role) {
    case '딜러':
      return <Bolt sx={{ fontSize: '0.9rem', color: COLORS.accent }} />;
    case '힐러':
      return <Healing sx={{ fontSize: '0.9rem', color: COLORS.accent }} />;
    case '탱커':
    default:
      return <Shield sx={{ fontSize: '0.9rem', color: COLORS.accent }} />;
  }
};

const LOG_RULES: Array<{
  match: (log: string) => boolean;
  strip: RegExp;
  icon: React.ReactNode;
  color: string;
}> = [
  {
    match: (log) => log.startsWith('🎉'),
    strip: /🎉/g,
    icon: <EmojiEvents sx={{ fontSize: '0.85rem', color: COLORS.accent }} />,
    color: COLORS.textMuted,
  },
  {
    match: (log) => log.startsWith('💰') || log.startsWith('💵'),
    strip: /💰|💵/g,
    icon: <Paid sx={{ fontSize: '0.85rem', color: COLORS.accent }} />,
    color: COLORS.textMuted,
  },
  {
    match: (log) => log.startsWith('❌') || log.startsWith('⚠️'),
    strip: /❌|⚠️/g,
    icon: <ErrorIcon sx={{ fontSize: '0.85rem', color: COLORS.dangerSoft }} />,
    color: COLORS.dangerSoft,
  },
  {
    match: (log) => log.startsWith('👉') || log.startsWith('📢'),
    strip: /👉|📢/g,
    icon: <PlayArrow sx={{ fontSize: '0.85rem', color: COLORS.accent }} />,
    color: COLORS.textMuted,
  },
  {
    match: (log) => log.startsWith('🎲'),
    strip: /🎲/g,
    icon: <Casino sx={{ fontSize: '0.85rem', color: COLORS.accent }} />,
    color: COLORS.textMuted,
  },
  {
    match: (log) => log.startsWith('⏱️'),
    strip: /⏱️/g,
    icon: <TimerIcon sx={{ fontSize: '0.85rem', color: COLORS.accent }} />,
    color: COLORS.textMuted,
  },
  {
    match: (log) => log.startsWith('⏰') || log.startsWith('⏱'),
    strip: /⏰|⏱/g,
    icon: <TimerIcon sx={{ fontSize: '0.85rem', color: COLORS.dangerSoft }} />,
    color: COLORS.dangerSoft,
  },
];

const normalizePoints = (text: string) =>
  text.replace(/포인트/g, 'P').replace(/(\d+)포/g, '$1P');

export const renderLogWithIcon = (log: string) => {
  const rule = LOG_RULES.find((r) => r.match(log));
  const cleanLog = normalizePoints((rule ? log.replace(rule.strip, '') : log).trim());
  const color = rule?.color ?? COLORS.textPrimary;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
      {rule?.icon}
      <span style={{ color }}>{cleanLog}</span>
    </Box>
  );
};
