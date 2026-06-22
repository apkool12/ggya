'use client';

import { memo, useCallback } from 'react';
import { Avatar, Box, Button, Typography } from '@mui/material';
import { Casino } from '@mui/icons-material';
import { COLORS, NAMEPLATE_BG, NAMEPLATE_TEXT, panelSx } from '../constants';
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
        py: 0.5,
        minHeight: 76,
        background: isActive ? CELL_BG[player.status] : 'transparent',
        border: `1px solid ${isActive ? COLORS.highlightStrong : 'transparent'}`,
        borderRadius: 0, // 직사각형화
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
        variant="square" // 직사각형화
        sx={{
          width: 42,
          height: 42,
          border: `1.5px solid ${isActive ? COLORS.accent : 'rgba(184, 144, 47, 0.15)'}`,
          boxShadow: isActive ? `0 0 0 2px ${COLORS.accent}` : '0 2px 6px rgba(0, 0, 0, 0.08)',
        }}
      />
      <Box
        sx={{
          width: '84%',
          px: 0.6,
          py: 0.25,
          borderRadius: 0, // 직사각형화
          background: isLocked ? 'transparent' : NAMEPLATE_BG,
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
          fontSize: '0.62rem',
          color: player.status === '낙찰완료' ? COLORS.success : player.status === '유찰' ? COLORS.danger : COLORS.textMuted,
          fontWeight: 900,
          fontFamily: 'Pretendard, sans-serif',
          mt: 0.1,
        }}
      >
        {player.status === '낙찰완료' && player.cost !== undefined && `${player.cost}P`}
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
  
  // 메인 화면에서는 실수 클릭을 방지하기 위해 선택 제어 비활성화
  const canSelect = false;

  const sortedPlayers = [...players].sort((a, b) => a.order - b.order);
  const playerRows = Array.from({ length: Math.ceil(sortedPlayers.length / 4) }, (_, rowIndex) =>
    sortedPlayers.slice(rowIndex * 4, rowIndex * 4 + 4),
  );

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
      <Box
        sx={{
          pb: 0.9,
          mb: 0.9,
          borderBottom: `1px solid rgba(184, 144, 47, 0.08)`,
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
                borderRadius: 0, // 직사각형화
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
                gridTemplateColumns: 'repeat(4, 1fr)',
                alignItems: 'center',
                gap: 0.8,
                py: 0.65,
                borderBottom:
                  rowIndex < playerRows.length - 1 ? `1px solid rgba(184, 144, 47, 0.08)` : 'none',
              }}
            >
              {[0, 1, 2, 3].map((slotIndex) => {
                const player = row[slotIndex];
                const playerIndex = rowIndex * 4 + slotIndex;
                return (
                  <Box
                    key={slotIndex}
                    sx={{
                      display: 'block',
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
