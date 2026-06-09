'use client';

import { memo } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { PersonOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { COLORS, NAMEPLATE_BG, NAMEPLATE_TEXT, ROLE_COLORS_KO, TEAM_ACCENTS } from '../constants';
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
        <Box
          sx={{
            mt: 0.4,
            px: 0.4,
            py: 0.3,
            borderRadius: 1,
            background: NAMEPLATE_BG,
            borderBottom: `2px solid ${roleColor}`,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontSize: '0.62rem',
              fontWeight: 800,
              color: NAMEPLATE_TEXT,
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
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontSize: '0.52rem',
              fontWeight: 800,
              color: COLORS.accentSoft,
              textAlign: 'center',
              fontFamily: 'Pretendard, sans-serif',
              lineHeight: 1.1,
            }}
          >
            {slot.cost}P
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 0 }}>
          <Box
            sx={{
              width: 26,
              height: 26,
              flexShrink: 0,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(145deg, ${COLORS.accentSoft}, ${accent})`,
              border: `1.5px solid ${COLORS.accent}`,
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5)',
              color: COLORS.textOnAccent,
              fontWeight: 900,
              fontSize: '0.7rem',
              fontFamily: 'Pretendard, sans-serif',
            }}
          >
            {seq}
          </Box>
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
          seq={idx + 1}
          accent={TEAM_ACCENTS[idx % TEAM_ACCENTS.length]}
          highlighted={highestBidder?.id === team.id}
        />
      ))}
    </>
  );
}
