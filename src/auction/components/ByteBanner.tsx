import { Box, Button, Typography } from '@mui/material';
import { Shield } from '@mui/icons-material';
import { COLORS, adPanelSx } from '../constants';

export default function ByteBanner() {
  return (
    <Box
      sx={{
        flexGrow: 1,
        minHeight: 112,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        p: 1.6,
        ...adPanelSx,
      }}
    >
      <Box sx={{ zIndex: 2, width: '68%' }}>
        <Typography
          sx={{
            fontWeight: 800,
            color: COLORS.textMuted,
            fontSize: '0.72rem',
            mb: 0.5,
            display: 'flex',
            alignItems: 'center',
            gap: 0.4,
            fontFamily: 'Pretendard, sans-serif',
          }}
        >
          <Shield sx={{ fontSize: '0.85rem' }} /> Byte 학술 캠페인
        </Typography>
        <Typography
          sx={{
            fontWeight: 900,
            color: COLORS.textPrimary,
            fontSize: '0.95rem',
            lineHeight: 1.3,
            mb: 1,
            fontFamily: 'Pretendard, sans-serif',
          }}
        >
          포인터 모르면
          <br />
          입찰·낙찰 불가
        </Typography>
        <Button
          size="small"
          variant="contained"
          sx={{
            fontSize: '0.65rem',
            fontWeight: 700,
            background: COLORS.accent,
            '&:hover': { background: COLORS.accentSoft },
          }}
        >
          디버깅 신청
        </Button>
      </Box>
      <Box
        sx={{
          position: 'absolute',
          right: 12,
          bottom: 10,
          px: 1.5,
          py: 1,
          background: COLORS.panelBgStrong,
          borderRadius: 2,
          transform: 'rotate(6deg)',
        }}
      >
        <Typography sx={{ fontWeight: 900, fontStyle: 'italic', fontFamily: 'monospace' }}>
          int* p
        </Typography>
      </Box>
    </Box>
  );
}
