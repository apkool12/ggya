'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Casino, SportsEsports } from '@mui/icons-material';
import { AnimatePresence, motion } from 'framer-motion';
import { COLORS, ROLE_COLORS_KO } from '../constants';
import { getRoleIcon } from '../log-utils';
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
          border: `3px solid ${COLORS.accent}`,
          boxShadow: `0 0 30px ${COLORS.highlightStrong}`,
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

type KoRole = '탱커' | '딜러' | '힐러';
const roleColorOf = (role: string) =>
  ROLE_COLORS_KO[(role as KoRole) in ROLE_COLORS_KO ? (role as KoRole) : '탱커'];

const ROLE_LABEL: Record<string, string> = {
  탱커: 'TANK',
  딜러: 'DAMAGE',
  힐러: 'SUPPORT',
};

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
  activePlayer: {
    id: string;
    name: string;
    role: string;
    avatar: string;
    mostPicks?: string[];
  };
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
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, gap: 1.5, alignItems: 'stretch' }}>
        <Box
          sx={{
            flex: '0 0 31%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.2,
            minWidth: 0,
            pr: 1.5,
            borderRight: `1px solid ${COLORS.border}`,
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
              border: `1px solid ${COLORS.border}`,
              position: 'relative',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activePlayer.avatar}
              alt={activePlayer.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
              {getRoleIcon(activePlayer.role as '탱커' | '딜러' | '힐러')}
            </Box>
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
                fontWeight: 900,
                fontSize: '1.12rem',
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
            <Box
              sx={{
                mt: 0.9,
                px: 1,
                py: 0.55,
                width: 'fit-content',
                borderRadius: 1.5,
                background: roleColorOf(activePlayer.role).soft,
                color: roleColorOf(activePlayer.role).main,
                border: `1px solid ${roleColorOf(activePlayer.role).main}`,
                fontSize: '0.72rem',
                fontWeight: 900,
                fontFamily: 'Pretendard, sans-serif',
              }}
            >
              {ROLE_LABEL[activePlayer.role] ?? activePlayer.role}
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
            gap: 0.9,
            px: 0.25,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
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
                  fontSize: '2.36rem',
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
                alignSelf: 'flex-start',
                px: 1,
                py: 0.55,
                borderRadius: 1.5,
                background: awaiting
                  ? COLORS.dangerSoft
                  : highestBidder
                    ? COLORS.successSoft
                    : COLORS.warningSoft,
                color: awaiting ? COLORS.danger : highestBidder ? COLORS.success : COLORS.warning,
                fontSize: '0.7rem',
                fontWeight: 900,
                whiteSpace: 'nowrap',
                fontFamily: 'Pretendard, sans-serif',
              }}
            >
              {awaiting ? '낙찰 확정 대기' : highestBidder ? '입찰 중' : '입찰 대기'}
            </Box>
          </Box>

          <Box
            sx={{
              px: 1.1,
              py: 0.75,
              borderRadius: 2,
              background: COLORS.panelBgStrong,
              border: `1px solid ${COLORS.border}`,
              color: highestBidder ? COLORS.textPrimary : COLORS.textMuted,
              fontSize: '0.78rem',
              fontWeight: 700,
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
            pl: 1.75,
            borderLeft: `1px solid ${COLORS.border}`,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: '0.72rem',
                color: roleColorOf(activePlayer.role).main,
                letterSpacing: 1,
                mb: 0.9,
                fontFamily: 'Pretendard, sans-serif',
              }}
            >
              선호 픽 · MOST 3
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[0, 1, 2].map((idx) => {
                const url = picks[idx];
                return (
                  <Box
                    key={idx}
                    sx={{
                      flex: 1,
                      aspectRatio: '1 / 1',
                      maxWidth: 88,
                      borderRadius: 2,
                      overflow: 'hidden',
                      background: COLORS.panelBgStrong,
                      border: `2px solid ${url ? roleColorOf(activePlayer.role).main : COLORS.border}`,
                      boxShadow: url ? `0 6px 16px ${roleColorOf(activePlayer.role).soft}` : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {url ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt=""
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 3,
                            right: 4,
                            px: 0.5,
                            borderRadius: 0.8,
                            background: 'rgba(0,0,0,0.55)',
                            color: '#fff',
                            fontSize: '0.55rem',
                            fontWeight: 800,
                          }}
                        >
                          {idx + 1}
                        </Box>
                      </>
                    ) : (
                      <Typography sx={{ color: COLORS.textMuted, fontWeight: 800 }}>?</Typography>
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
        borderRadius: 2,
        boxShadow: COLORS.shadowSoft,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: { xs: 2, lg: 1.5 },
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
