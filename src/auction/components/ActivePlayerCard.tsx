'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Casino, SportsEsports } from '@mui/icons-material';
import { AnimatePresence, motion } from 'framer-motion';
import { COLORS } from '../constants';
import { useAuctionContext } from '../AuctionContext';
import type { Player } from '../types';

const ROULETTE_MS = 1300;

function RouletteOverlay({ pool }: { pool: Player[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setIdx((i) => i + 1), 75);
    return () => window.clearInterval(id);
  }, []);
  const p = pool.length ? pool[idx % pool.length] : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        background: 'rgba(20, 15, 11, 0.92)',
        zIndex: 5,
        borderRadius: 8,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.6,
          color: COLORS.accent,
          fontWeight: 900,
          fontSize: '0.8rem',
          letterSpacing: 2,
          fontFamily: 'Pretendard, sans-serif',
        }}
      >
        <Casino sx={{ fontSize: '1rem' }} /> 랜덤 추첨 중…
      </Box>
      <Box
        sx={{
          width: 96,
          height: 96,
          borderRadius: 2,
          overflow: 'hidden',
          border: `2px solid ${COLORS.accent}`,
          boxShadow: `0 8px 32px ${COLORS.highlight}`,
        }}
      >
        {p && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={p.avatar}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </Box>
      <Typography
        sx={{
          fontWeight: 900,
          fontSize: '1.3rem',
          color: '#F4ECDA',
          fontFamily: 'Pretendard, sans-serif',
        }}
      >
        {p?.name ?? '...'}
      </Typography>
    </motion.div>
  );
}



function IdleState() {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        px: 3,
        gap: 1.5,
      }}
    >
      <SportsEsports sx={{ fontSize: '1.8rem', color: COLORS.textMuted }} />
      <Typography
        variant="h6"
        sx={{
          color: COLORS.textPrimary,
          fontWeight: 800,
          fontFamily: 'Pretendard, sans-serif',
        }}
      >
        경매 대기 중
      </Typography>
      <Typography
        sx={{
          color: COLORS.textMuted,
          fontSize: '0.8rem',
          fontFamily: 'Pretendard, sans-serif',
        }}
      >
        우측 명단에서 선수를 선택하세요
      </Typography>
    </Box>
  );
}

interface ActiveBodyProps {
  activePlayer: Player;
  currentBid: number;
  highestBidder: { name: string } | null;
  awaiting: boolean;
}

function ActiveBody({
  activePlayer,
  currentBid,
  highestBidder,
  awaiting,
}: ActiveBodyProps) {
  const picks = activePlayer.mostPicks ?? [];

  return (
    <motion.div
      key={activePlayer.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        minHeight: 0,
      }}
    >
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, gap: 4, alignItems: 'stretch' }}>
        <Box
          sx={{
            flex: '0 0 31%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.2,
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              width: 104,
              height: 130,
              flexShrink: 0,
              borderRadius: 2,
              overflow: 'hidden',
              background: COLORS.panelBgStrong,
              border: `1px solid rgba(184, 144, 47, 0.10)`,
              position: 'relative',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activePlayer.avatar}
              alt={activePlayer.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: '0.64rem',
                fontWeight: 900,
                color: COLORS.textMuted,
                mb: 0.5,
                fontFamily: 'Pretendard, sans-serif',
              }}
            >
              경매 선수
            </Typography>
            <Typography
              sx={{
                fontWeight: 950,
                fontSize: '1.25rem',
                lineHeight: 1.1,
                color: COLORS.textPrimary,
                fontFamily: 'Pretendard, sans-serif',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {activePlayer.name}
            </Typography>
            
            {/* 탱/딜/힐 최대 티어 표시 */}
            <Box sx={{ mt: 1.25, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
              <Typography sx={{ fontSize: '0.58rem', fontWeight: 900, color: COLORS.textMuted, fontFamily: 'Pretendard, sans-serif' }}>
                포지션별 티어
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography sx={{ fontSize: '0.66rem', fontWeight: 850, color: COLORS.textPrimary, fontFamily: 'Pretendard, sans-serif' }}>
                  탱: {activePlayer.tankTier || '-'}
                </Typography>
                <Typography sx={{ fontSize: '0.66rem', fontWeight: 850, color: COLORS.textPrimary, fontFamily: 'Pretendard, sans-serif' }}>
                  딜: {activePlayer.dpsTier || '-'}
                </Typography>
                <Typography sx={{ fontSize: '0.66rem', fontWeight: 850, color: COLORS.textPrimary, fontFamily: 'Pretendard, sans-serif' }}>
                  힐: {activePlayer.supportTier || '-'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            flex: '1 1 auto',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 1,
            px: 0.5,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: '0.64rem',
                  fontWeight: 900,
                  color: COLORS.textMuted,
                  fontFamily: 'Pretendard, sans-serif',
                }}
              >
                현재 입찰가
              </Typography>
              <Typography
                sx={{
                  mt: 0.2,
                  fontWeight: 950,
                  fontSize: '2.5rem',
                  lineHeight: 1,
                  color: COLORS.textPrimary,
                  fontFamily: 'Pretendard, sans-serif',
                }}
              >
                {currentBid}P
              </Typography>
            </Box>
            <Box
              sx={{
                alignSelf: 'center',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.6,
                color: awaiting
                  ? COLORS.danger
                  : highestBidder
                    ? COLORS.success
                    : COLORS.warning,
                fontSize: '0.74rem',
                fontWeight: 900,
                whiteSpace: 'nowrap',
                fontFamily: 'Pretendard, sans-serif',
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: awaiting ? COLORS.danger : highestBidder ? COLORS.success : COLORS.warning,
                  animation: 'bidPulse 1.6s infinite ease-in-out',
                  '@keyframes bidPulse': {
                    '0%': { transform: 'scale(0.8)', opacity: 0.5 },
                    '50%': { transform: 'scale(1.2)', opacity: 1 },
                    '100%': { transform: 'scale(0.8)', opacity: 0.5 },
                  },
                }}
              />
              {awaiting ? '낙찰 확정 대기' : highestBidder ? '입찰 진행 중' : '입찰 대기'}
            </Box>
          </Box>

          <Box
            sx={{
              px: 1.25,
              py: 0.85,
              borderRadius: 2.5,
              background: COLORS.panelBgStrong,
              border: `1px solid rgba(184, 144, 47, 0.08)`,
              color: highestBidder ? COLORS.textPrimary : COLORS.textMuted,
              fontSize: '0.78rem',
              fontWeight: 800,
              fontFamily: 'Pretendard, sans-serif',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {highestBidder
              ? `현재 최고 입찰팀 · ${highestBidder.name}`
              : '왼쪽 팀 카드를 클릭해서 입찰팀을 선택하세요'}
          </Box>
        </Box>

        <Box
          sx={{
            flex: '0 0 38%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minWidth: 0,
            gap: 1,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: '0.68rem',
                color: COLORS.textMuted,
                letterSpacing: 0.5,
                mb: 0.8,
                fontFamily: 'Pretendard, sans-serif',
              }}
            >
              MOST PICKS
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {[0, 1, 2].map((idx) => {
                const url = picks[idx];
                return (
                  <Box
                    key={idx}
                    sx={{
                      width: 96,
                      height: 96,
                      borderRadius: 0,
                      overflow: 'hidden',
                      background: COLORS.panelBgStrong,
                      border: `1.5px solid ${url ? COLORS.accent : 'rgba(184, 144, 47, 0.15)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={url}
                        alt=""
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <Typography sx={{ color: COLORS.textMuted, fontWeight: 800, fontSize: '0.75rem' }}>?</Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
}

export default function ActivePlayerCard() {
  const { activePlayer, currentBid, highestBidder, phase, players } = useAuctionContext();
  const awaiting = phase === 'AWAITING_CONFIRM';

  // 활성 선수가 새로 정해지면 모든 화면에서 잠깐 룰렛 연출
  const [spinning, setSpinning] = useState(false);
  const prevId = useRef<string | null>(null);
  useEffect(() => {
    const id = activePlayer?.id ?? null;
    if (id && id !== prevId.current && prevId.current !== null) {
      setSpinning(true);
      const t = window.setTimeout(() => setSpinning(false), ROULETTE_MS);
      prevId.current = id;
      return () => window.clearTimeout(t);
    }
    prevId.current = id;
  }, [activePlayer?.id]);

  const pool = players.length ? players : activePlayer ? [activePlayer] : [];

  return (
    <Box
      sx={{
        flexGrow: 1,
        background: COLORS.panelBg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 3,
        boxShadow: COLORS.shadowSoft,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2.25,
        minHeight: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <AnimatePresence>{spinning && <RouletteOverlay pool={pool} />}</AnimatePresence>
      <AnimatePresence mode="wait">
        {activePlayer ? (
          <ActiveBody
            activePlayer={activePlayer}
            currentBid={currentBid}
            highestBidder={highestBidder}
            awaiting={awaiting}
          />
        ) : (
          <IdleState />
        )}
      </AnimatePresence>
    </Box>
  );
}
