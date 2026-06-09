'use client';

import { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { Terminal as TerminalIcon } from '@mui/icons-material';
import { COLORS, panelSx } from '../constants';
import { renderLogWithIcon } from '../log-utils';
import { useAuctionContext } from '../AuctionContext';

export default function TerminalLog() {
  const { logs } = useAuctionContext();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [logs]);

  return (
    <Box sx={{ minHeight: 0, p: 1.1, display: 'flex', flexDirection: 'column', overflow: 'hidden', ...panelSx }}>
      <Typography
        sx={{
          fontWeight: 800,
          color: COLORS.textMuted,
          fontSize: '0.68rem',
          pb: 0.5,
          mb: 0.5,
          borderBottom: `1px solid ${COLORS.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 0.6,
          fontFamily: 'Pretendard, sans-serif',
        }}
      >
        <TerminalIcon sx={{ fontSize: '0.9rem' }} />
        LOG
      </Typography>
      <Box
        ref={containerRef}
        sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0.3 }}
      >
        {logs.map((log, idx) => (
          <Box
            key={idx}
            sx={{ fontSize: '0.7rem', color: COLORS.textPrimary, lineHeight: 1.35, fontFamily: 'Pretendard, monospace, sans-serif' }}
          >
            {renderLogWithIcon(log)}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
