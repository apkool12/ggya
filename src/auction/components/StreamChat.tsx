'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Chat } from '@mui/icons-material';
import { COLORS, MAX_CHAT_HISTORY, panelSx } from '../constants';
import type { ChatMessage } from '../types';

// 디스코드 채널 메시지를 SSE로 미러링(읽기 전용).
// 봇 미설정 시 서버가 시뮬레이션 채팅을 흘려보낸다.
export default function StreamChat() {
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const es = new EventSource('/api/chat/stream');
    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data) as ChatMessage;
        setChat((prev) => [...prev, msg].slice(-MAX_CHAT_HISTORY));
      } catch {
        /* ignore malformed frame */
      }
    };
    return () => es.close();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat]);

  return (
    <Box
      sx={{
        p: 2,
        ...panelSx,
        borderRadius: 0, // 직사각형화
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
          borderBottom: `1px solid rgba(184, 144, 47, 0.08)`,
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
              sx={{ fontWeight: 800, color: c.color || COLORS.textPrimary, fontSize: '0.64rem', fontFamily: 'Pretendard, sans-serif' }}
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
