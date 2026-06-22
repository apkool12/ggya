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
import type { PlayerRole, Team } from './types';
import { COLORS, TEAM_ACCENTS } from './constants';

export const getRoleIcon = (role: PlayerRole, sx?: any) => {
  switch (role) {
    case '딜러':
      return <Bolt sx={{ fontSize: '0.9rem', color: COLORS.accent, ...sx }} />;
    case '힐러':
      return <Healing sx={{ fontSize: '0.9rem', color: COLORS.accent, ...sx }} />;
    case '탱커':
    default:
      return <Shield sx={{ fontSize: '0.9rem', color: COLORS.accent, ...sx }} />;
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
    icon: <ErrorIcon sx={{ fontSize: '0.85rem', color: COLORS.danger }} />,
    color: COLORS.danger,
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

export const renderLogWithIcon = (log: string, teams?: Team[]) => {
  const rule = LOG_RULES.find((r) => r.match(log));
  const cleanLog = (rule ? log.replace(rule.strip, '') : log)
    .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]|[\u{2600}-\u{26FF}]/gu, '')
    .trim();

  // [입찰] 플러리 팀장 - 순당무 - 95포인트
  const bidMatch = cleanLog.match(/^\[입찰\]\s*(.+?)\s*팀장\s*-\s*(.+?)\s*-\s*(.+)$/);
  if (bidMatch) {
    const leaderName = bidMatch[1];
    const playerName = bidMatch[2];
    const pointsStr = bidMatch[3];

    const matchedTeam = teams?.find(
      (t) => t.leader === leaderName || t.name.includes(leaderName),
    );
    const teamIndex = (matchedTeam && teams) ? teams.indexOf(matchedTeam) : -1;
    const teamColor = teamIndex !== -1
      ? TEAM_ACCENTS[teamIndex % TEAM_ACCENTS.length]
      : COLORS.accent;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap' }}>
        <span style={{ color: teamColor, fontWeight: 900 }}>{leaderName} 팀장</span>
        <span style={{ color: 'rgba(43, 38, 32, 0.4)' }}>-</span>
        <span style={{ color: COLORS.textPrimary, fontWeight: 700 }}>{playerName}</span>
        <span style={{ color: 'rgba(43, 38, 32, 0.4)' }}>-</span>
        <span style={{ color: COLORS.accent, fontWeight: 900 }}>{normalizePoints(pointsStr)}</span>
      </Box>
    );
  }

  // [낙찰] 플러리 팀장 - 순당무 - 95포인트 낙찰 완료!
  const winMatch = cleanLog.match(/^\[낙찰\]\s*(.+?)\s*팀장\s*-\s*(.+?)\s*-\s*(.+)$/);
  if (winMatch) {
    const leaderName = winMatch[1];
    const playerName = winMatch[2];
    const restStr = winMatch[3];

    const matchedTeam = teams?.find(
      (t) => t.leader === leaderName || t.name.includes(leaderName),
    );
    const teamIndex = (matchedTeam && teams) ? teams.indexOf(matchedTeam) : -1;
    const teamColor = teamIndex !== -1
      ? TEAM_ACCENTS[teamIndex % TEAM_ACCENTS.length]
      : COLORS.accent;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap' }}>
        <span style={{ color: teamColor, fontWeight: 900 }}>{leaderName} 팀장</span>
        <span style={{ color: 'rgba(43, 38, 32, 0.4)' }}>-</span>
        <span style={{ color: COLORS.textPrimary, fontWeight: 700 }}>{playerName}</span>
        <span style={{ color: 'rgba(43, 38, 32, 0.4)' }}>-</span>
        <span style={{ color: COLORS.success, fontWeight: 900 }}>{normalizePoints(restStr)}</span>
      </Box>
    );
  }

  const color = rule?.color ?? COLORS.textPrimary;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
      <span style={{ color }}>{normalizePoints(cleanLog)}</span>
    </Box>
  );
};
