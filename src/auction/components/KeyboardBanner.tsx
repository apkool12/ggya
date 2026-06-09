import { Box, Typography } from '@mui/material';
import { LocalFireDepartment } from '@mui/icons-material';
import { COLORS, adPanelSx } from '../constants';

const KEY_ROW_1 = [1, 2, 3, 4, 5, 6, 7];
const KEY_ROW_2 = [1, 2, 3, 4, 5, 6];

export default function KeyboardBanner() {
  return (
    <Box
      sx={{
        minHeight: 0,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        p: 1.1,
        ...adPanelSx,
      }}
    >
      <Box>
        <Typography
          sx={{
            fontWeight: 800,
            color: COLORS.textMuted,
            fontSize: '0.64rem',
            mb: 0.3,
            fontFamily: 'Pretendard, sans-serif',
          }}
        >
          <LocalFireDepartment sx={{ fontSize: '0.85rem', verticalAlign: 'middle' }} /> Byte 스폰서
        </Typography>
        <Typography sx={{ fontWeight: 800, fontSize: '0.72rem', fontFamily: 'Pretendard, sans-serif', pr: 11 }}>
          밤샘 코딩 몬스터 무한 지원
        </Typography>
      </Box>
      <Box
        sx={{
          position: 'absolute',
          right: 8,
          bottom: 7,
          width: 92,
          p: 0.8,
          background: COLORS.panelBgStrong,
          borderRadius: 2,
          transform: 'rotate(-12deg)',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.3,
        }}
      >
        <Box sx={{ display: 'flex', gap: 0.3 }}>
          {KEY_ROW_1.map((k) => (
            <span key={k} style={{ flex: 1, height: 5, background: COLORS.textMuted, borderRadius: 1 }} />
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: 0.3 }}>
          {KEY_ROW_2.map((k) => (
            <span key={k} style={{ flex: 1, height: 5, background: COLORS.highlightStrong, borderRadius: 1 }} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
