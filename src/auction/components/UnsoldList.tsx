'use client';

import { Box, Typography } from '@mui/material';
import { COLORS, panelSx } from '../constants';
import { useAuctionContext } from '../AuctionContext';
import { useAuth } from '@/auth/AuthContext';

export default function UnsoldList() {
  const { unsoldPlayers, selectPlayer } = useAuctionContext();
  const { user } = useAuth();
  const canSelect = user?.role === 'ADMIN';

  return (
    <Box
      sx={{
        p: 1.75,
        ...panelSx,
        borderRadius: 0, // 직사각형화
        minHeight: 0,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1.2,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          width: 88,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 0.8,
        }}
      >
        <Typography
          sx={{
            fontWeight: 900,
            color: COLORS.danger,
            fontSize: '0.86rem',
            whiteSpace: 'nowrap',
            fontFamily: 'Pretendard, sans-serif',
          }}
        >
          유찰순서
        </Typography>
        <Box
          sx={{
            fontSize: '0.68rem',
            fontWeight: 900,
            color: COLORS.textMuted,
            fontFamily: 'Pretendard, sans-serif',
          }}
        >
          {unsoldPlayers.length}
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          overflowX: 'auto',
          overflowY: 'hidden',
          borderLeft: `1px solid rgba(184, 144, 47, 0.08)`,
          pl: 1.5,
        }}
      >
        {unsoldPlayers.length > 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'nowrap',
              alignItems: 'center',
              gap: 0.9,
              width: 'max-content',
              minWidth: '100%',
            }}
          >
            {unsoldPlayers.map((player, idx) => (
              <Box
                key={player.id}
                sx={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.9,
                }}
              >
                <Box
                  onClick={canSelect ? () => selectPlayer(player.id) : undefined}
                  sx={{
                    cursor: canSelect ? 'pointer' : 'default',
                    fontSize: '0.78rem',
                    fontWeight: 850,
                    color: COLORS.textPrimary,
                    whiteSpace: 'nowrap',
                    fontFamily: 'Pretendard, sans-serif',
                    '&:hover': canSelect
                      ? {
                          color: COLORS.danger,
                          textDecoration: 'underline',
                          textUnderlineOffset: 3,
                        }
                      : {},
                  }}
                >
                  {player.name}
                </Box>
                {idx < unsoldPlayers.length - 1 && (
                  <Typography
                    sx={{
                      color: 'rgba(133, 120, 89, 0.4)',
                      fontWeight: 900,
                      fontSize: '0.8rem',
                      mx: 0.2,
                      userSelect: 'none',
                    }}
                  >
                    ·
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        ) : (
          <Typography
            sx={{
              color: COLORS.textMuted,
              fontSize: '0.76rem',
              fontWeight: 700,
              fontFamily: 'Pretendard, sans-serif',
            }}
          >
            아직 유찰된 선수가 없습니다
          </Typography>
        )}
      </Box>
    </Box>
  );
}
