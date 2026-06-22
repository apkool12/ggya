'use client';

import { memo } from 'react';
import { Avatar, Box, Typography } from '@mui/material';
import { PlayArrow } from '@mui/icons-material';
import { COLORS, TEAM_ACCENTS, panelSx } from '../constants';
import type { Player, Team } from '../types';
import { useAuctionContext } from '../AuctionContext';

interface QueueCellProps {
  player: Player;
  team: Team | null;
}

const QueueCell = memo(function QueueCell({ player, team }: QueueCellProps) {
  const isSold = player.status === '낙찰완료';
  const isUnsold = player.status === '유찰';
  const isActive = player.status === '경매중';
  const isWaiting = player.status === '대기중';

  const teamAccent = team ? TEAM_ACCENTS[Number(team.id) % TEAM_ACCENTS.length] ?? COLORS.accent : COLORS.textMuted;
  const displayName = team ? (team.name.startsWith('TEAM ') ? team.name.slice(5) : team.name) : '';

  return (
    <Box
      sx={{
        width: 104,
        height: 124,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 0.75,
        backgroundColor: isActive ? COLORS.panelBgStrong : COLORS.panelBg,
        border: `1.5px solid ${
          isActive ? COLORS.accent : isSold ? 'rgba(94, 140, 54, 0.3)' : 'transparent'
        }`,
        boxShadow: isActive
          ? `0 0 10px rgba(184, 144, 47, 0.35)`
          : isSold
            ? 'none'
            : '0 2px 6px rgba(0, 0, 0, 0.02)',
        opacity: isWaiting ? 0.65 : isUnsold ? 0.45 : 1,
        position: 'relative',
        transition: 'all 0.25s ease-in-out',
        borderRadius: 0, // 직사각형화
      }}
    >
      {/* 순서 번호 뱃지 */}
      <Typography
        variant="caption"
        sx={{
          position: 'absolute',
          top: 3,
          left: 4,
          fontWeight: 900,
          fontSize: '0.6rem',
          color: COLORS.textMuted,
          zIndex: 2,
        }}
      >
        #{player.order + 1}
      </Typography>



      <Avatar
        src={player.avatar}
        variant="square" // 직사각형화
        sx={{
          width: 58,
          height: 58,
          mt: 1,
          border: `1.5px solid ${isActive ? COLORS.accent : 'rgba(184, 144, 47, 0.15)'}`,
          filter: isUnsold || isSold ? 'grayscale(80%)' : 'none',
        }}
      />

      <Box sx={{ width: '100%', textAlign: 'center', mt: 0.5 }}>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '0.74rem',
            color: isUnsold || isSold ? COLORS.textMuted : COLORS.textPrimary,
            fontFamily: 'Pretendard, sans-serif',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {player.name}
        </Typography>
      </Box>

      {/* 하단 정보 뱃지 */}
      <Box sx={{ width: '100%', mt: 0.25 }}>
        {isActive && (
          <Box
            sx={{
              py: 0.15,
              backgroundColor: 'rgba(184, 144, 47, 0.18)',
              color: COLORS.accent,
              fontSize: '0.58rem',
              fontWeight: 900,
              fontFamily: 'Pretendard, sans-serif',
              textAlign: 'center',
            }}
          >
            진행중
          </Box>
        )}
        {isSold && team && (
          <Box
            sx={{
              py: 0.15,
              backgroundColor: teamAccent,
              color: '#FFFFFF',
              fontSize: '0.58rem',
              fontWeight: 900,
              fontFamily: 'Pretendard, sans-serif',
              textAlign: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {displayName} · {player.cost}P
          </Box>
        )}
        {isUnsold && (
          <Box
            sx={{
              py: 0.15,
              backgroundColor: COLORS.dangerSoft,
              color: COLORS.danger,
              fontSize: '0.58rem',
              fontWeight: 900,
              fontFamily: 'Pretendard, sans-serif',
              textAlign: 'center',
            }}
          >
            유찰
          </Box>
        )}
        {isWaiting && (
          <Box
            sx={{
              py: 0.15,
              backgroundColor: COLORS.panelBgStrong,
              color: COLORS.textMuted,
              fontSize: '0.58rem',
              fontWeight: 800,
              fontFamily: 'Pretendard, sans-serif',
              textAlign: 'center',
            }}
          >
            대기
          </Box>
        )}
      </Box>
    </Box>
  );
});

export default function AuctionQueue() {
  const { players, teams } = useAuctionContext();

  // 순서대로 정렬
  const sortedPlayers = [...players].sort((a, b) => a.order - b.order);

  // 한 행에 7개씩 분할
  const colsPerRow = 7;
  const rows: Player[][] = [];
  for (let i = 0; i < sortedPlayers.length; i += colsPerRow) {
    rows.push(sortedPlayers.slice(i, i + colsPerRow));
  }

  return (
    <Box
      sx={{
        p: 2,
        ...panelSx,
        borderRadius: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2.25,
        width: '100%',
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          pb: 0.75,
          borderBottom: `1px solid rgba(184, 144, 47, 0.08)`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography
          sx={{ fontWeight: 900, fontSize: '0.8rem', fontFamily: 'Pretendard, sans-serif', letterSpacing: 0.5 }}
        >
          경매 순서 및 현황
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflowY: 'auto',
          flexGrow: 1,
          width: '100%',
        }}
      >
        {rows.map((row, rowIndex) => (
          <Box
            key={rowIndex}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              width: '100%',
              flexWrap: { xs: 'wrap', md: 'nowrap' }, // 모바일에서는 줄바꿈
            }}
          >
            {row.map((player, cellIndex) => {
              const team = player.teamId ? teams.find((t) => t.id === player.teamId) ?? null : null;
              return (
                <Box
                  key={player.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <QueueCell player={player} team={team} />
                  {cellIndex < row.length - 1 && (
                    <PlayArrow
                      sx={{
                        fontSize: '1.25rem',
                        color: '#B8902F',
                        opacity: 0.8,
                        display: { xs: 'none', md: 'block' }, // 모바일에서는 chevron 생략하여 레이아웃 깔끔하게 유지
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
  );
}
