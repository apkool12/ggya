'use client';

import type { ChangeEvent } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { FiberManualRecord } from '@mui/icons-material';
import { COLORS } from '../constants';
import { useAuctionContext } from '../AuctionContext';

const chipSx = {
  height: 28,
  px: 1.5,
  fontSize: '0.7rem',
  fontWeight: 700,
  color: COLORS.textPrimary,
  backgroundColor: COLORS.panelBgStrong,
  borderRadius: 2,
  fontFamily: 'Pretendard, sans-serif',
  '&:hover': { backgroundColor: COLORS.highlight },
};

export default function Header() {
  const { exportJson, importJson, resetAll } = useAuctionContext();

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) importJson(file);
    event.target.value = '';
  };

  return (
    <Box
      sx={{
        display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          px: { xs: 1.5, md: 2 },
          py: 1,
          mb: 1.5,
          background: COLORS.panelBg,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 2,
          boxShadow: COLORS.shadowSoft,
          flexWrap: { xs: 'wrap', md: 'nowrap' },
        }}
      >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 900,
            color: COLORS.textPrimary,
            fontFamily: 'Pretendard, sans-serif',
            letterSpacing: 0,
          }}
        >
          GGya
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: COLORS.textMuted,
            fontFamily: 'Pretendard, sans-serif',
          }}
        >
          E-SPORTS AUCTION
        </Typography>
      </Box>

      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          color: COLORS.textMuted,
          fontSize: '0.8rem',
          fontFamily: 'Pretendard, sans-serif',
          minWidth: 0,
          display: { xs: 'none', md: 'block' },
        }}
      >
        국립한밭대학교 · 컴퓨터공학과 제 42대 학생회 Byte
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
        <Button size="small" onClick={exportJson} sx={chipSx}>
          JSON보내기
        </Button>
        <Button size="small" component="label" sx={chipSx}>
          JSON 불러오기
          <input type="file" accept=".json" hidden onChange={onFileChange} />
        </Button>
        <Button
          size="small"
          onClick={resetAll}
          sx={{ ...chipSx, color: COLORS.danger }}
        >
          초기화
        </Button>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: COLORS.success,
            display: 'flex',
            alignItems: 'center',
            gap: 0.35,
            fontFamily: 'Pretendard, sans-serif',
          }}
        >
          <FiberManualRecord sx={{ fontSize: 9 }} />
          LIVE
        </Typography>
      </Box>
    </Box>
  );
}
