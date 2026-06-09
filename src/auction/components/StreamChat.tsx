'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Chat } from '@mui/icons-material';
import { CHAT_INTERVAL_MS, COLORS, MAX_CHAT_HISTORY, panelSx } from '../constants';
import { CHAT_TEMPLATES, INITIAL_CHAT } from '../data';
import type { ChatMessage } from '../types';

// 채팅은 서버 비범위 — 방송 분위기용 클라이언트 시뮬레이션.
export default function StreamChat() {
  const [chat, setChat] = useState<ChatMessage[]>(INITIAL_CHAT);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      const msg = CHAT_TEMPLATES[Math.floor(Math.random() * CHAT_TEMPLATES.length)];
      setChat((prev) => [...prev, msg].slice(-MAX_CHAT_HISTORY));
    }, CHAT_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, []);

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
