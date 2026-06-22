'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Box, Button, Typography } from '@mui/material';
import { FiberManualRecord } from '@mui/icons-material';
import { COLORS } from '../constants';
import { useAuctionContext } from '../AuctionContext';
import { useAuth } from '@/auth/AuthContext';

const chipSx = {
  height: 28,
  px: 1.75,
  fontSize: '0.72rem',
  fontWeight: 800,
  color: COLORS.textPrimary,
  backgroundColor: COLORS.panelBgStrong,
  borderRadius: 0, // 직사각형화
  fontFamily: 'Pretendard, sans-serif',
  transition: 'background-color 0.2s',
  '&:hover': { backgroundColor: 'rgba(184, 144, 47, 0.16)' },
} as const;

const teamLabel = (name: string) => (name.startsWith('TEAM ') ? name.slice(5) : name);

export default function Header() {
  const { resetAll, teams } = useAuctionContext();
  const { user, logout } = useAuth();
  const router = useRouter();

  const myTeam = user?.role === 'LEADER' ? teams.find((t) => t.id === user.teamId) : null;

  const onReset = async () => {
    if (!window.confirm('모든 경매 현황을 초기 상태로 리셋하시겠습니까?')) return;
    await resetAll();
  };

  const onLogout = async () => {
    await logout();
    router.refresh();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        px: { xs: 2.25, md: 3 },
        py: 1.5,
        background: COLORS.panelBg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 0, // 직사각형화
        boxShadow: COLORS.shadowSoft,
        flexWrap: { xs: 'wrap', md: 'nowrap' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 950, color: COLORS.textPrimary, fontFamily: 'Pretendard, sans-serif', letterSpacing: -0.5 }}
        >
          GGya
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontWeight: 800, color: COLORS.textMuted, fontFamily: 'Pretendard, sans-serif', letterSpacing: 0.5 }}
        >
          E-SPORTS AUCTION
        </Typography>
      </Box>

      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          color: COLORS.textMuted,
          fontSize: '0.8rem',
          fontFamily: 'Pretendard, sans-serif',
          minWidth: 0,
          display: { xs: 'none', md: 'block' },
        }}
      >
        국립한밭대학교 · 컴퓨터공학과 제 42대 학생회 Byte
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        {user?.role === 'ADMIN' && (
          <>
            <Button size="small" component={Link} href="/admin" sx={chipSx}>
              관리자페이지
            </Button>
            <Button size="small" onClick={onReset} sx={{ ...chipSx, color: COLORS.danger, backgroundColor: COLORS.dangerSoft, borderRadius: 0, '&:hover': { backgroundColor: 'rgba(190, 58, 43, 0.2)' } }}>
              초기화
            </Button>
          </>
        )}

        {user ? (
          <>
            <Typography
              variant="caption"
              sx={{ fontWeight: 800, color: COLORS.textPrimary, fontFamily: 'Pretendard, sans-serif' }}
            >
              {user.username}
              {myTeam ? ` · ${teamLabel(myTeam.name)}` : user.role === 'ADMIN' ? ' · 관리자' : ''}
            </Typography>
            <Button size="small" onClick={onLogout} sx={chipSx}>
              로그아웃
            </Button>
          </>
        ) : (
          <Button size="small" component={Link} href="/login" sx={chipSx}>
            로그인
          </Button>
        )}

        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.25,
            py: 0.4,
            borderRadius: 0, // 직사각형화
            backgroundColor: COLORS.successSoft,
            color: COLORS.success,
            fontSize: '0.68rem',
            fontWeight: 800,
            fontFamily: 'Pretendard, sans-serif',
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: COLORS.success,
              animation: 'livePulse 1.6s infinite ease-in-out',
              '@keyframes livePulse': {
                '0%': { transform: 'scale(0.8)', opacity: 0.5 },
                '50%': { transform: 'scale(1.2)', opacity: 1 },
                '100%': { transform: 'scale(0.8)', opacity: 0.5 },
              },
            }}
          />
          LIVE
        </Box>
      </Box>
    </Box>
  );
}
