'use client';

import { memo } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { PersonOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { COLORS, NAMEPLATE_BG, NAMEPLATE_TEXT, TEAM_ACCENTS } from '../constants';
import type { Player, Team } from '../types';
import { useAuctionContext } from '../AuctionContext';

interface TeamCardProps {
  team: Team;
  accent: string;
  seq: number;
  highlighted: boolean;
}

const RosterSlot = memo(function RosterSlot({ slot }: { slot: Player | null }) {
  if (!slot) {
    return (
      <Box
        sx={{
          width: '100%',
          aspectRatio: '1/1',
          background: COLORS.panelBgStrong,
          border: `1.5px solid ${COLORS.accent}`, // 깔끔한 금색 실선
          borderRadius: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PersonOutlined sx={{ fontSize: '1.05rem', color: COLORS.textMuted, opacity: 0.4 }} />
      </Box>
    );
  }



  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        style={{ width: '100%' }}
      >
        <Box sx={{ width: '100%', position: 'relative', overflow: 'visible' }}>
          {/* 사람 위에 보라색 포인트 뱃지 배치 */}
          <Box
            sx={{
              position: 'absolute',
              top: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#7A4E86',
              color: '#FFFFFF',
              px: 0.8,
              py: 0.15,
              borderRadius: 0,
              fontSize: '0.6rem',
              fontWeight: 900,
              fontFamily: 'Pretendard, sans-serif',
              zIndex: 3,
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
              whiteSpace: 'nowrap',
              lineHeight: 1.2,
            }}
          >
            {slot.cost}
          </Box>
          <Box
            sx={{
              width: '100%',
              aspectRatio: '1/1',
              borderRadius: 0,
              overflow: 'hidden',
              border: `1.5px solid ${COLORS.accent}`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slot.avatar}
              alt={slot.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </Box>
        </Box>
        <Box
          sx={{
            mt: 0.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.35,
            width: '100%',
            minWidth: 0,
          }}
        >

          <Typography
            sx={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: COLORS.textPrimary,
              textAlign: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontFamily: 'Pretendard, sans-serif',
              lineHeight: 1.2,
            }}
          >
            {slot.name}
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
});

const TeamCard = memo(function TeamCard({ team, accent, seq, highlighted }: TeamCardProps) {
  const displayName = team.name.startsWith('TEAM ') ? team.name.slice(5) : team.name;

  return (
    <Box
      sx={{
        borderRadius: 0,
        overflow: 'hidden',
        backgroundColor: highlighted ? COLORS.highlight : COLORS.panelBg,
        border: `1px solid ${highlighted ? COLORS.highlightStrong : COLORS.border}`,
        boxShadow: highlighted ? `0 0 0 1px ${accent}, ${COLORS.shadowSoft}` : 'none',
        transition: 'background-color 0.2s, border-color 0.2s',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 1.25,
          backgroundColor: COLORS.panelBgStrong,
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 0 }}>
          <Box
            sx={{
              px: 1,
              py: 0.25,
              flexShrink: 0,
              borderRadius: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#2B2620', // 통일된 다크 에스프레소
              color: '#FFFFFF', // 흰색 글씨
              fontWeight: 800,
              fontSize: '0.7rem',
              fontFamily: 'Pretendard, sans-serif',
            }}
          >
            {seq}
          </Box>
          <Typography
            sx={{
              fontWeight: 850,
              color: COLORS.textPrimary,
              fontSize: '0.85rem',
              fontFamily: 'Pretendard, sans-serif',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {displayName}
          </Typography>
        </Box>

        {/* 우측 상단 흰색 포인트 박스 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.25,
            px: 1.5,
            py: 0.5,
            backgroundColor: '#FFFFFF',
            border: `1px solid rgba(184, 144, 47, 0.12)`,
            borderRadius: 0,
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontWeight: 300, // 포인트 얇게
              color: COLORS.textMuted,
              fontSize: '0.72rem',
              fontFamily: 'Pretendard, sans-serif',
            }}
          >
            포인트
          </Typography>
          <Typography
            sx={{
              fontWeight: 900, // 점수 bold
              color: accent,
              fontSize: '0.86rem',
              fontFamily: 'Pretendard, sans-serif',
            }}
          >
            {team.points}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: 1.75 }}>
        <Grid container spacing={0.8}>
          {team.roster.map((slot, idx) => (
            <Grid size={{ xs: 2.4 }} key={idx}>
              <RosterSlot slot={slot} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
});

export default function TeamPanel() {
  const { teams, highestBidder } = useAuctionContext();
  return (
    <>
      {teams.map((team, idx) => (
        <TeamCard
          key={team.id}
          team={team}
          seq={idx + 1}
          accent={TEAM_ACCENTS[idx % TEAM_ACCENTS.length]}
          highlighted={highestBidder?.id === team.id}
        />
      ))}
    </>
  );
}
