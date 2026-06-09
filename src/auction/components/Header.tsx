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
  px: 1.5,
  fontSize: '0.7rem',
  fontWeight: 700,
  color: COLORS.textPrimary,
  backgroundColor: COLORS.panelBgStrong,
  borderRadius: 2,
  fontFamily: 'Pretendard, sans-serif',
  '&:hover': { backgroundColor: COLORS.highlight },
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
        px: { xs: 1.5, md: 2 },
        py: 1,
        mb: 1.5,
        background: COLORS.panelBg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 2,
        boxShadow: COLORS.shadowSoft,
        flexWrap: { xs: 'wrap', md: 'nowrap' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 900, color: COLORS.textPrimary, fontFamily: 'Pretendard, sans-serif' }}
        >
          GGya
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, color: COLORS.textMuted, fontFamily: 'Pretendard, sans-serif' }}
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

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
        {user?.role === 'ADMIN' && (
          <>
            <Button size="small" component={Link} href="/admin" sx={chipSx}>
              관리자페이지
            </Button>
            <Button size="small" onClick={onReset} sx={{ ...chipSx, color: COLORS.danger }}>
              초기화
            </Button>
          </>
        )}

        {user ? (
          <>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: COLORS.textPrimary, fontFamily: 'Pretendard, sans-serif' }}
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

        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: COLORS.success,
            display: 'flex',
            alignItems: 'center',
            gap: 0.35,
            fontFamily: 'Pretendard, sans-serif',
          }}
        >
          <FiberManualRecord sx={{ fontSize: 9 }} />
          LIVE
        </Typography>
      </Box>
    </Box>
  );
}
