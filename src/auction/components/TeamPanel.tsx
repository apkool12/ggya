'use client';

import { memo } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { Shield, Bolt, Healing } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { COLORS } from '../constants';
import type { Player, Team, PlayerRole } from '../types';
import { useAuctionContext } from '../AuctionContext';

interface TeamCardProps {
  team: Team;
  highlighted: boolean;
  selectable: boolean;
  onClick: () => void;
}

const SLOT_ROLES: PlayerRole[] = ['탱커', '딜러', '딜러', '힐러', '힐러'];

const RosterSlot = memo(function RosterSlot({
  slot,
  index,
}: {
  slot: Player | null;
  index: number;
}) {
  const role = SLOT_ROLES[index];

  const renderEmptyIcon = () => {
    const iconSx = { fontSize: '1.1rem', color: COLORS.textMuted };
    switch (role) {
      case '탱커':
        return <Shield sx={iconSx} />;
      case '딜러':
        return <Bolt sx={iconSx} />;
      default:
        return <Healing sx={iconSx} />;
    }
  };

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
        {renderEmptyIcon()}
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
        <Box
          sx={{
            width: '100%',
            aspectRatio: '1/1',
            borderRadius: 2,
            overflow: 'hidden',
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
            fontWeight: 600,
            color: COLORS.textMuted,
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

const TeamCard = memo(function TeamCard({
  team,
  highlighted,
  selectable,
  onClick,
}: TeamCardProps) {
  const displayName = team.name.startsWith('TEAM ') ? team.name.slice(5) : team.name;

  return (
    <Box
      onClick={selectable ? onClick : undefined}
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: highlighted ? COLORS.highlight : COLORS.panelBg,
        border: `1px solid ${highlighted ? COLORS.highlightStrong : COLORS.border}`,
        boxShadow: highlighted ? COLORS.shadowSoft : 'none',
        cursor: selectable ? 'pointer' : 'default',
        transition: 'background-color 0.2s, border-color 0.2s, transform 0.2s',
        '&:hover': selectable ? { backgroundColor: COLORS.highlight, borderColor: COLORS.highlightStrong } : {},
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
        }}
      >
        <Typography
          sx={{
            fontWeight: 800,
            color: COLORS.textPrimary,
            fontSize: '0.85rem',
            fontFamily: 'Pretendard, sans-serif',
          }}
        >
          {displayName}
        </Typography>
        <Typography
          sx={{
            fontWeight: 700,
            color: COLORS.textMuted,
            fontSize: '0.75rem',
            fontFamily: 'Pretendard, sans-serif',
          }}
        >
          {team.points}P
        </Typography>
      </Box>

      <Box sx={{ p: 1.1 }}>
        <Grid container spacing={0.8}>
          {team.roster.map((slot, idx) => (
            <Grid size={{ xs: 2.4 }} key={idx}>
              <RosterSlot slot={slot} index={idx} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
});

export default function TeamPanel() {
  const { teams, activePlayer, highestBidder, setBidder } = useAuctionContext();
  return (
    <>
      {teams.map((team) => (
        <TeamCard
          key={team.id}
          team={team}
          highlighted={highestBidder?.id === team.id}
          selectable={!!activePlayer}
          onClick={() => setBidder(team)}
        />
      ))}
    </>
  );
}
