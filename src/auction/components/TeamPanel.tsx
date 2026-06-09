'use client';

import { memo } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { PersonOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { COLORS, ROLE_COLORS_KO, TEAM_ACCENTS } from '../constants';
import type { Player, Team } from '../types';
import { useAuctionContext } from '../AuctionContext';

interface TeamCardProps {
  team: Team;
  accent: string;
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
          border: `1px dashed ${COLORS.borderStrong}`,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PersonOutlined sx={{ fontSize: '1.05rem', color: COLORS.textMuted, opacity: 0.5 }} />
      </Box>
    );
  }

  const roleColor = ROLE_COLORS_KO[slot.role].main;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        style={{ width: '100%' }}
      >
        <Box
          sx={{
            width: '100%',
            aspectRatio: '1/1',
            borderRadius: 2,
            overflow: 'hidden',
            border: `2px solid ${roleColor}`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slot.avatar}
            alt={slot.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </Box>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.4,
            fontSize: '0.65rem',
            fontWeight: 700,
            color: COLORS.textPrimary,
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: 'Pretendard, sans-serif',
          }}
        >
          {slot.name}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            fontSize: '0.55rem',
            fontWeight: 700,
            color: roleColor,
            textAlign: 'center',
            fontFamily: 'Pretendard, sans-serif',
          }}
        >
          {slot.cost}P
        </Typography>
      </motion.div>
    </Box>
  );
});

const TeamCard = memo(function TeamCard({ team, accent, highlighted }: TeamCardProps) {
  const displayName = team.name.startsWith('TEAM ') ? team.name.slice(5) : team.name;

  return (
    <Box
      sx={{
        borderRadius: 3,
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
          px: 1.5,
          py: 0.9,
          backgroundColor: COLORS.panelBgStrong,
          borderBottom: `1px solid ${COLORS.border}`,
          borderLeft: `3px solid ${accent}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, minWidth: 0 }}>
          <Box sx={{ width: 7, height: 7, borderRadius: '50%', background: accent, flexShrink: 0 }} />
          <Typography
            sx={{
              fontWeight: 800,
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
        <Typography
          sx={{
            fontWeight: 800,
            color: accent,
            fontSize: '0.78rem',
            fontFamily: 'Pretendard, sans-serif',
            flexShrink: 0,
          }}
        >
          {team.points}P
        </Typography>
      </Box>

      <Box sx={{ p: 1.1 }}>
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
          accent={TEAM_ACCENTS[idx % TEAM_ACCENTS.length]}
          highlighted={highestBidder?.id === team.id}
        />
      ))}
    </>
  );
}
