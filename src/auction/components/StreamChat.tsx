'use client';

import { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { Chat } from '@mui/icons-material';
import { COLORS, panelSx } from '../constants';
import { useAuctionContext } from '../AuctionContext';

export default function StreamChat() {
  const { chat } = useAuctionContext();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat]);

  return (
    <Box
      sx={{
        p: 1.15,
        ...panelSx,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <Typography
        sx={{
          fontWeight: 800,
          color: COLORS.textPrimary,
          fontSize: '0.76rem',
          pb: 0.65,
          mb: 0.65,
          borderBottom: `1px solid ${COLORS.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 0.6,
          fontFamily: 'Pretendard, sans-serif',
        }}
      >
        <Chat sx={{ fontSize: '1rem' }} />
        채팅
      </Typography>

      <Box
        ref={containerRef}
        sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0.55 }}
      >
        {chat.map((c, idx) => (
          <Box key={idx}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 800, color: COLORS.textPrimary, fontSize: '0.64rem', fontFamily: 'Pretendard, sans-serif' }}
            >
              {c.sender}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: COLORS.textMuted, fontSize: '0.68rem', lineHeight: 1.35, fontFamily: 'Pretendard, sans-serif' }}
            >
              {c.message}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
