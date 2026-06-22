'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Alert, Box, Button, Snackbar, Typography } from '@mui/material';
import { CheckCircleOutlined, FlashOn, Lock } from '@mui/icons-material';
import { BID_INCREMENTS, COLORS, panelSx } from '../constants';
import { useAuctionContext } from '../AuctionContext';
import { useAuth } from '@/auth/AuthContext';
import type { Team } from '../types';

const teamLabel = (name: string) => (name.startsWith('TEAM ') ? name.slice(5) : name);

function TimerBox({ timer, awaiting }: { timer: number; awaiting: boolean }) {
  return (
    <Box
      sx={{
        flex: '0 0 88px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        p: 0.85,
        backgroundColor: awaiting ? COLORS.danger : COLORS.accent,
        borderRadius: 2,
        color: '#FFFFFF', // 흰색 글씨로 변경
        textAlign: 'center',
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.6rem' }}>
        {awaiting ? '확정 대기' : 'TIME'}
      </Typography>
      <Typography
        variant="h4"
        sx={{ fontWeight: 900, fontFamily: 'monospace', mt: 0.3, fontSize: '1.45rem', lineHeight: 1 }}
      >
        {timer.toFixed(2)}
      </Typography>
    </Box>
  );
}

export default function BiddingConsole() {
  const {
    teams,
    activePlayer,
    timer,
    phase,
    highestBidder,
    placeBid,
    confirmWin,
    markUnsold,
  } = useAuctionContext();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const disabled = !activePlayer;
  const awaiting = phase === 'AWAITING_CONFIRM';

  const onBid = async (teamId: string, amount: number) => {
    const r = await placeBid(teamId, amount);
    if (!r.ok) setError(r.error ?? '입찰 실패');
  };
  const onConfirm = async () => {
    const r = await confirmWin();
    if (!r.ok) setError(r.error ?? '낙찰 실패');
  };
  const onUnsold = async () => {
    const r = await markUnsold();
    if (!r.ok) setError(r.error ?? '유찰 실패');
  };

  const incrementButtons = (team: Team) =>
    BID_INCREMENTS.map((val) => (
      <Button
        key={val}
        size="small"
        onClick={() => onBid(team.id, val)}
        disabled={disabled}
        sx={{
          minWidth: 0,
          flex: 1,
          py: 0.5,
          fontWeight: 800,
          fontSize: '0.74rem',
          color: COLORS.textPrimary,
          background: COLORS.panelBg,
          border: `1px solid rgba(184, 144, 47, 0.08)`,
          boxShadow: '0 1px 2px rgba(0,0,0,0.01)',
          '&:hover': { background: COLORS.highlight },
          '&.Mui-disabled': { color: COLORS.textMuted },
        }}
      >
        +{val}
      </Button>
    ));

  const renderControls = () => {
    // 비로그인 — 관전 모드
    if (!user) {
      return (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            color: COLORS.textMuted,
            background: COLORS.panelBgStrong,
            borderRadius: 2.5,
            px: 1.5,
          }}
        >
          <Lock sx={{ fontSize: '1rem' }} />
          <Typography sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
            관전 모드 ·{' '}
            <Box component={Link} href="/login" sx={{ color: COLORS.accent, fontWeight: 800 }}>
              로그인
            </Box>
            하면 입찰할 수 있습니다
          </Typography>
        </Box>
      );
    }

    // 팀장 — 자기 팀만
    if (user.role === 'LEADER') {
      const myTeam = teams.find((t) => t.id === user.teamId);
      if (!myTeam)
        return (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', px: 1.5 }}>
            <Typography sx={{ color: COLORS.textMuted, fontWeight: 700, fontSize: '0.8rem' }}>
              연결된 팀이 없습니다.
            </Typography>
          </Box>
        );
      return (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 0.6,
            background: COLORS.panelBgStrong,
            borderRadius: 2.5,
            p: 1.25,
          }}
        >
          <Typography
            sx={{ fontWeight: 800, fontSize: '0.7rem', color: COLORS.textMuted, display: 'flex', gap: 0.4, alignItems: 'center' }}
          >
            <FlashOn sx={{ fontSize: '0.85rem' }} /> {teamLabel(myTeam.name)} · 잔여 {myTeam.points}P
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.6 }}>{incrementButtons(myTeam)}</Box>
        </Box>
      );
    }

    // 관리자 — 전체 진행 제어
    return (
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.6, minWidth: 0 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 0.6,
            flex: 1,
          }}
        >
          {teams.map((team) => (
            <Box
              key={team.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 0.6,
                pl: 1.75,
                pr: 0.75,
                borderRadius: 2.5,
                background: highestBidder?.id === team.id ? COLORS.highlight : COLORS.panelBgStrong,
                border: `1px solid ${highestBidder?.id === team.id ? 'rgba(184, 144, 47, 0.25)' : 'rgba(184, 144, 47, 0.08)'}`,
              }}
            >
              <Typography
                sx={{
                  flex: '0 0 68px',
                  fontWeight: 850,
                  fontSize: '0.76rem',
                  color: COLORS.textPrimary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontFamily: 'Pretendard, sans-serif',
                }}
              >
                {teamLabel(team.name)}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.4, flex: 1 }}>{incrementButtons(team)}</Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ p: 2, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 0.9, ...panelSx }}>
      <Box sx={{ display: 'flex', gap: 0.9, alignItems: 'stretch', minHeight: 96 }}>
        <TimerBox timer={timer} awaiting={awaiting} />
        {renderControls()}
      </Box>

      {/* 관리자 전용 낙찰/유찰/경매 시작 */}
      {user?.role === 'ADMIN' && (
        <Box sx={{ display: 'flex', gap: 0.75, width: '100%' }}>
          {!activePlayer ? (
            <Button
              variant="contained"
              onClick={async () => {
                const res = await fetch('/api/auction/next', { method: 'POST' });
                if (!res.ok) {
                  const d = await res.json().catch(() => ({}));
                  setError(d.error ?? '경매 시작 실패');
                }
              }}
              sx={{
                flex: 1,
                height: 40,
                fontWeight: 900,
                background: '#FFFFFF',
                color: COLORS.textPrimary,
                border: `1px solid rgba(184, 144, 47, 0.20)`,
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(43, 38, 32, 0.05)',
                transition: 'all 0.2s',
                '&:hover': {
                  background: COLORS.panelBgStrong,
                  borderColor: 'rgba(184, 144, 47, 0.35)',
                  boxShadow: '0 4px 12px rgba(43, 38, 32, 0.08)',
                },
              }}
            >
              경매 시작 (다음 순서 선수)
            </Button>
          ) : (
            <>
              <Button
                onClick={onUnsold}
                disabled={disabled}
                sx={{
                  flex: 1,
                  height: 40,
                  fontWeight: 800,
                  borderRadius: '8px',
                  background: COLORS.dangerSoft,
                  color: COLORS.danger,
                  '&:hover': { background: 'rgba(190, 58, 43, 0.2)' },
                  '&.Mui-disabled': { color: COLORS.textMuted, background: COLORS.panelBgMuted },
                }}
              >
                유찰
              </Button>
              <Button
                variant="contained"
                onClick={onConfirm}
                disabled={disabled}
                startIcon={<CheckCircleOutlined sx={{ fontSize: '1rem' }} />}
                sx={{
                  flex: 2,
                  height: 40,
                  fontWeight: 900,
                  background: '#FFFFFF',
                  color: COLORS.success,
                  border: `1px solid rgba(94, 140, 54, 0.30)`,
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(43, 38, 32, 0.05)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    background: 'rgba(94, 140, 54, 0.08)',
                    borderColor: 'rgba(94, 140, 54, 0.55)',
                    boxShadow: '0 4px 12px rgba(94, 140, 54, 0.12)',
                  },
                  '&.Mui-disabled': {
                    background: COLORS.panelBgMuted,
                    color: COLORS.textMuted,
                    borderColor: 'transparent',
                    boxShadow: 'none',
                  },
                }}
              >
                낙찰 확정{highestBidder ? ` · ${teamLabel(highestBidder.name)}` : ''}
              </Button>
            </>
          )}
        </Box>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="warning" variant="filled" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
