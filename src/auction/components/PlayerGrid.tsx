'use client';

import { memo, useCallback } from 'react';
import { Avatar, Box, Button, Typography } from '@mui/material';
import { Casino } from '@mui/icons-material';
import { COLORS, NAMEPLATE_BG, NAMEPLATE_TEXT, ROLE_COLORS_KO, panelSx } from '../constants';
import type { Player, PlayerStatus } from '../types';
import { useAuctionContext } from '../AuctionContext';
import { useAuth } from '@/auth/AuthContext';

interface PlayerCellProps {
  player: Player;
  index: number;
  canSelect: boolean;
  onSelect: (id: string) => void;
}

const CELL_BG: Record<PlayerStatus, string> = {
  대기중: COLORS.panelBgStrong,
  경매중: COLORS.highlight,
  낙찰완료: COLORS.panelBgMuted,
  유찰: COLORS.dangerSoft,
};

const PlayerCell = memo(function PlayerCell({ player, index, canSelect, onSelect }: PlayerCellProps) {
  const isLocked = player.status === '낙찰완료' || player.status === '유찰';
  const isActive = player.status === '경매중';
  const clickable = canSelect && !isLocked;
  const roleColor = ROLE_COLORS_KO[player.role].main;

  const handleClick = useCallback(() => {
    if (clickable) onSelect(player.id);
  }, [clickable, onSelect, player.id]);

  return (
    <Box
      onClick={handleClick}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.55,
        py: 0.45,
        minHeight: 76,
        background: isActive ? CELL_BG[player.status] : 'transparent',
        border: `1px solid ${isActive ? COLORS.highlightStrong : 'transparent'}`,
        borderRadius: 1.5,
        cursor: clickable ? 'pointer' : 'default',
        opacity: isLocked ? 0.5 : 1,
        transition: 'background-color 0.15s',
        '&:hover': clickable ? { background: COLORS.highlight } : {},
      }}
    >
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          top: 2,
          left: 4,
          fontWeight: 800,
          fontSize: '0.55rem',
          color: COLORS.textMuted,
        }}
      >
        {index + 1}
      </Typography>
      <Avatar
        src={player.avatar}
        variant="rounded"
        sx={{
          width: 42,
          height: 42,
          border: `2px solid ${roleColor}`,
          boxShadow: isActive ? `0 0 0 2px ${roleColor}` : '0 2px 8px rgba(0, 0, 0, 0.35)',
        }}
      />
      <Box
        sx={{
          maxWidth: '100%',
          px: 0.6,
          py: 0.2,
          borderRadius: 0.8,
          background: isLocked ? 'transparent' : NAMEPLATE_BG,
          borderBottom: isLocked ? 'none' : `2px solid ${roleColor}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 800,
            color: isLocked ? COLORS.textMuted : NAMEPLATE_TEXT,
            fontSize: '0.66rem',
            textAlign: 'center',
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: 'Pretendard, sans-serif',
          }}
        >
          {player.name}
        </Typography>
      </Box>
      <Typography
        variant="caption"
        sx={{
          display: 'none',
          fontSize: '0.5rem',
          color: isActive ? COLORS.textPrimary : COLORS.textMuted,
          fontWeight: 700,
          fontFamily: 'Pretendard, sans-serif',
        }}
      >
        {player.status === '낙찰완료' && `${player.cost}P`}
        {player.status === '유찰' && '유찰'}
        {player.status === '대기중' && '대기'}
        {isActive && '진행'}
      </Typography>
    </Box>
  );
});

export default function PlayerGrid() {
  const { players, activePlayer, nextPlayer, waitingCount, selectPlayer, drawPlayer } =
    useAuctionContext();
  const { user } = useAuth();
  const canSelect = user?.role === 'ADMIN';
  const playerRows = Array.from({ length: Math.ceil(players.length / 4) }, (_, rowIndex) =>
    players.slice(rowIndex * 4, rowIndex * 4 + 4),
  );

  return (
    <Box
      sx={{
        p: 1.35,
        ...panelSx,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          pb: 0.9,
          mb: 0.9,
          borderBottom: `1px solid ${COLORS.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {activePlayer ? (
          <Typography sx={{ fontWeight: 800, fontSize: '0.75rem', fontFamily: 'Pretendard, sans-serif' }}>
            <Box component="span" sx={{ color: COLORS.textPrimary }}>
              {activePlayer.name}
            </Box>
            {nextPlayer && (
              <Box component="span" sx={{ color: COLORS.textMuted, ml: 1 }}>
                → {nextPlayer.name}
              </Box>
            )}
          </Typography>
        ) : (
          <Typography
            sx={{ fontWeight: 800, fontSize: '0.8rem', fontFamily: 'Pretendard, sans-serif' }}
          >
            경매 대기 명단
          </Typography>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {canSelect && (
            <Button
              size="small"
              startIcon={<Casino sx={{ fontSize: '0.95rem' }} />}
              onClick={() => drawPlayer()}
              disabled={waitingCount === 0}
              sx={{
                py: 0.3,
                px: 1.1,
                fontSize: '0.68rem',
                fontWeight: 900,
                color: COLORS.textOnAccent,
                background: COLORS.accent,
                '& .MuiButton-startIcon': { mr: 0.35 },
                '&:hover': { background: COLORS.accentSoft },
                '&.Mui-disabled': { background: COLORS.panelBgMuted, color: COLORS.textMuted },
              }}
            >
              랜덤 추첨
            </Button>
          )}
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 800,
              color: COLORS.textMuted,
              fontFamily: 'Pretendard, sans-serif',
            }}
          >
            대기 {waitingCount}명
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 0.5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
          {playerRows.map((row, rowIndex) => (
            <Box
              key={row.map((player) => player.id).join('-')}
              sx={{
                display: 'grid',
                gridTemplateColumns:
                  'minmax(58px, 1fr) 28px minmax(58px, 1fr) 28px minmax(58px, 1fr) 28px minmax(58px, 1fr)',
                alignItems: 'center',
                gap: 0.8,
                py: 0.65,
                borderBottom:
                  rowIndex < playerRows.length - 1 ? `1px solid ${COLORS.border}` : 'none',
              }}
            >
              {[0, 1, 2, 3].map((slotIndex) => {
                const player = row[slotIndex];
                const playerIndex = rowIndex * 4 + slotIndex;
                return (
                  <Box
                    key={slotIndex}
                    sx={{
                      display: 'contents',
                    }}
                  >
                    {player ? (
                      <PlayerCell
                        player={player}
                        index={playerIndex}
                        canSelect={canSelect}
                        onSelect={selectPlayer}
                      />
                    ) : (
                      <Box />
                    )}
                    {slotIndex < 3 && row[slotIndex + 1] && (
                      <Box
                        sx={{
                          width: 0,
                          height: 0,
                          borderTop: '6px solid transparent',
                          borderBottom: '6px solid transparent',
                          borderLeft: `9px solid ${COLORS.accentSoft}`,
                          opacity: player ? 0.65 : 0,
                          justifySelf: 'center',
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
