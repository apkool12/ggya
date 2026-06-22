'use client';

import { useState, useEffect, useRef } from 'react';
import { Avatar, Box, Button, Typography, Alert, Snackbar } from '@mui/material';
import { Casino, PlayArrow, ArrowForward } from '@mui/icons-material';
import { COLORS } from '../constants';
import { useAuctionContext } from '../AuctionContext';
import { useAuth } from '@/auth/AuthContext';
import Header from './Header';
import gsap from 'gsap';

interface DraftSlotProps {
  index: number;
  player: any | null;
}

function DraftSlot({ index, player }: DraftSlotProps) {
  return (
    <Box
      className={`slot-card-${index}`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 100,
        position: 'relative',
      }}
    >
      {/* 1. 스퀘어 아바타 박스 (둥근 모서리 & 테두리 색깔 제거) */}
      <Box
        className={`slot-avatar-${index}`}
        sx={{
          width: 95,
          height: 95,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: player ? '#FAF9F6' : 'rgba(43, 38, 32, 0.04)',
          border: '1px solid rgba(43, 38, 32, 0.08)',
          boxShadow: player ? '0 4px 12px rgba(43, 38, 32, 0.06)' : 'none',
          position: 'relative',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        {/* 순번 표시 (좌측 상단 조그마하게) */}
        <Typography
          sx={{
            position: 'absolute',
            top: 4,
            left: 5,
            fontWeight: 900,
            fontSize: '0.55rem',
            color: player ? COLORS.textMuted : 'rgba(43, 38, 32, 0.3)',
            zIndex: 2,
          }}
        >
          #{index + 1}
        </Typography>

        {player ? (
          <Avatar
            src={player.avatar}
            variant="square"
            sx={{
              width: '100%',
              height: '100%',
              borderRadius: '12px',
            }}
          />
        ) : (
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: '1.25rem',
              color: 'rgba(43, 38, 32, 0.1)',
              fontFamily: 'Pretendard, sans-serif',
            }}
          >
            ?
          </Typography>
        )}
      </Box>

      {/* 2. 하단에 이름 표시 (역할 구분 지움, 박스 외부에 배치) */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          mt: 0.75,
          width: '100%',
          minHeight: 22, // 레이아웃 흔들림 방지
        }}
      >
        {player ? (
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: '0.78rem',
              color: COLORS.textPrimary,
              fontFamily: 'Pretendard, sans-serif',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              width: '100%',
            }}
          >
            {player.name}
          </Typography>
        ) : (
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: '0.68rem',
              color: 'rgba(43, 38, 32, 0.25)',
              fontFamily: 'Pretendard, sans-serif',
              textAlign: 'center',
            }}
          >
            대기중
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default function DraftRevealScreen() {
  const { players } = useAuctionContext();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [error, setError] = useState<string | null>(null);
  const [drawing, setDrawing] = useState(false);

  const revealCardRef = useRef<HTMLDivElement>(null);

  // order가 0 이상인 뽑힌 선수들
  const drawnPlayers = players.filter((p) => p.order >= 0).sort((a, b) => a.order - b.order);
  const totalCount = players.length;
  const drawnCount = drawnPlayers.length;
  const isFinished = drawnCount === totalCount && totalCount > 0;

  // 가장 최근에 뽑힌 선수
  const latestDrawnPlayer = drawnPlayers[drawnPlayers.length - 1] ?? null;

  // 애니메이션용 상태
  const [lastPlayedId, setLastPlayedId] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [displayedPlayer, setDisplayedPlayer] = useState<any | null>(null);

  const isFirstLoad = useRef(true);

  // 초기 렌더링 시 그리드 슬롯들 순차 등장 애니메이션 (GSAP)
  useEffect(() => {
    gsap.fromTo(
      '[class^="slot-card-"]',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.02, ease: 'power2.out' }
    );
  }, []);

  // 새로운 선수가 뽑힐 때 슬롯머신 롤링 애니메이션 실행
  useEffect(() => {
    if (!latestDrawnPlayer) {
      setDisplayedPlayer(null);
      isFirstLoad.current = false;
      return;
    }

    if (latestDrawnPlayer.id !== lastPlayedId) {
      setLastPlayedId(latestDrawnPlayer.id);

      if (isFirstLoad.current) {
        // 첫 진입 시에는 롤링 없이 즉시 노출
        setDisplayedPlayer(latestDrawnPlayer);
        isFirstLoad.current = false;
      } else {
        // 슬롯머신 롤링 시작 (미추첨 선수 및 뽑힌 대상을 후보로 롤링)
        const candidates = players.filter((p) => p.order === -1 || p.id === latestDrawnPlayer.id);
        if (candidates.length <= 1) {
          setDisplayedPlayer(latestDrawnPlayer);
          return;
        }

        setIsRolling(true);
        let delay = 40;
        let ticks = 0;
        const maxTicks = 16;

        const tick = () => {
          if (ticks >= maxTicks) {
            setDisplayedPlayer(latestDrawnPlayer);
            setIsRolling(false);

            // 최종 선정 공개 GSAP 임팩트 애니메이션
            if (revealCardRef.current) {
              gsap.fromTo(
                revealCardRef.current,
                { scale: 0.92, opacity: 0.7, rotationX: -15 },
                { scale: 1, opacity: 1, rotationX: 0, duration: 0.55, ease: 'back.out(1.5)', clearProps: 'all' }
              );
            }

            // 하단 해당 슬롯 뒤집기 연출
            const slotAvatar = document.querySelector(`.slot-avatar-${latestDrawnPlayer.order}`);
            if (slotAvatar) {
              gsap.fromTo(
                slotAvatar,
                { rotationY: 180, scale: 0.4, opacity: 0 },
                { rotationY: 0, scale: 1, opacity: 1, duration: 0.75, ease: 'back.out(1.2)' }
              );
            }
            return;
          }

          // 후보군 중 랜덤 추출하여 화면에 표시
          const randomIdx = Math.floor(Math.random() * candidates.length);
          setDisplayedPlayer(candidates[randomIdx]);

          ticks++;
          delay += 20; // 틱 주기가 점점 늘어나며 슬롯머신 감속 연출
          setTimeout(tick, delay);
        };

        tick();
      }
    }
  }, [latestDrawnPlayer, lastPlayedId, players]);

  const onDraw = async () => {
    if (drawing || isRolling) return;
    setDrawing(true);
    try {
      const res = await fetch('/api/auction/draft/draw', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? '추첨 실패');
      }
    } catch {
      setError('네트워크 오류');
    } finally {
      setDrawing(false);
    }
  };

  const onFinish = async () => {
    try {
      const res = await fetch('/api/auction/draft/finish', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? '진행 완료 실패');
      }
    } catch {
      setError('네트워크 오류');
    }
  };

  // 8개씩 행 분배
  const colsPerRow = 8;
  const slotIndices = Array.from({ length: totalCount }, (_, i) => i);
  const rows: number[][] = [];
  for (let i = 0; i < slotIndices.length; i += colsPerRow) {
    rows.push(slotIndices.slice(i, i + colsPerRow));
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        width: '100%',
        minHeight: '100svh',
        height: { xs: 'auto', lg: '100svh' },
        background:
          'radial-gradient(1200px 600px at 70% -10%, rgba(184,144,47,0.15) 0%, rgba(184,144,47,0) 60%), linear-gradient(180deg, #C2B396 0%, #B4A485 50%, #A49474 100%)',
        overflow: { xs: 'auto', lg: 'hidden' },
        p: { xs: 1.5, md: 2 },
        gap: 1.5,
      }}
    >
      <Header />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: { xs: 2.5, md: 3 },
          p: { xs: 1, md: 2 },
          minHeight: 0,
        }}
      >
        {/* 추첨 진행 상단 안내 */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 950,
              color: COLORS.textPrimary,
              fontFamily: 'Pretendard, sans-serif',
              letterSpacing: -0.5,
              mb: 0.5,
            }}
          >
            경매 순서 추첨 진행 중
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 800,
              color: COLORS.textMuted,
              fontFamily: 'Pretendard, sans-serif',
            }}
          >
            추첨 완료: {drawnCount} / {totalCount}
          </Typography>
        </Box>

        {/* 상단 레이아웃: 단일 중앙 배치 추첨 카드 (좌측 방송 패널 및 테두리 색깔 제거, 코멘트 제거, 모서리 둥글게) */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            maxWidth: 550,
            mx: 'auto',
          }}
        >
          <Box
            ref={revealCardRef}
            sx={{
              backgroundColor: COLORS.panelBg,
              border: '1px solid rgba(43, 38, 32, 0.08)',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(43, 38, 32, 0.08)',
              display: 'flex',
              flexDirection: 'row',
              p: 3,
              width: '100%',
              minHeight: 260,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {displayedPlayer ? (
              <Box sx={{ display: 'flex', width: '100%', gap: 3.5, alignItems: 'center' }}>
                {/* 좌측 컬럼: 큰 이미지 + 하단 이름 바 */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: 155,
                    flexShrink: 0,
                  }}
                >
                  <Box
                    sx={{
                      width: 145,
                      height: 145,
                      border: '1px solid rgba(43, 38, 32, 0.1)',
                      backgroundColor: '#FAF9F6',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <Avatar
                      src={displayedPlayer.avatar}
                      variant="square"
                      sx={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '12px',
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      width: 145,
                      backgroundColor: COLORS.textPrimary,
                      color: '#FFFDF8',
                      py: 0.5,
                      textAlign: 'center',
                      borderRadius: '8px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                      mt: 1.25,
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 950,
                        fontSize: '1rem',
                        fontFamily: 'Pretendard, sans-serif',
                        letterSpacing: 0.5,
                      }}
                    >
                      {displayedPlayer.name}
                    </Typography>
                  </Box>
                </Box>

                {/* 우측 컬럼: 랭크/포지션 + 티어 정보 + MOST PICK */}
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, pt: 0.5, gap: 1.5 }}>
                  {isRolling && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography
                        sx={{
                          fontWeight: 900,
                          color: COLORS.textPrimary,
                          fontSize: '0.86rem',
                          fontFamily: 'Pretendard, sans-serif',
                        }}
                      >
                        추첨 진행 중...
                      </Typography>
                    </Box>
                  )}

                  {/* 한 줄 소개 */}
                  {!isRolling && displayedPlayer.intro && (
                    <Typography
                      sx={{
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        fontStyle: 'italic',
                        lineHeight: 1.45,
                        color: COLORS.textPrimary,
                        fontFamily: 'Pretendard, sans-serif',
                      }}
                    >
                      “{displayedPlayer.intro}”
                    </Typography>
                  )}

                  {/* 포지션별 최대 티어 영역 */}
                  <Box>
                    <Typography
                      sx={{
                        fontSize: '0.66rem',
                        fontWeight: 900,
                        color: COLORS.textMuted,
                        fontFamily: 'Pretendard, sans-serif',
                        letterSpacing: 1,
                        mb: 0.75,
                      }}
                    >
                      포지션별 최대 티어
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
                      {[
                        { label: '탱커', val: displayedPlayer.tankTier },
                        { label: '딜러', val: displayedPlayer.dpsTier },
                        { label: '힐러', val: displayedPlayer.supportTier },
                      ].map((item, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            backgroundColor: 'rgba(43, 38, 32, 0.03)',
                            border: '1px solid rgba(43, 38, 32, 0.05)',
                            borderRadius: '8px',
                            py: 0.5,
                            px: 0.75,
                            textAlign: 'center',
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: '0.58rem',
                              fontWeight: 800,
                              color: COLORS.textMuted,
                              fontFamily: 'Pretendard, sans-serif',
                              mb: 0.1,
                            }}
                          >
                            {item.label}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: '0.72rem',
                              fontWeight: 950,
                              color: COLORS.textPrimary,
                              fontFamily: 'Pretendard, sans-serif',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.val || '-'}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* MOST PICK 영역 */}
                  <Box>
                    <Typography
                      sx={{
                        fontSize: '0.68rem',
                        fontWeight: 900,
                        color: COLORS.textMuted,
                        fontFamily: 'Pretendard, sans-serif',
                        letterSpacing: 1.2,
                        mb: 0.75,
                      }}
                    >
                      MOST PICK
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1.25 }}>
                      {displayedPlayer.mostPicks && displayedPlayer.mostPicks.length > 0 ? (
                        displayedPlayer.mostPicks.slice(0, 3).map((pickUrl: string, idx: number) => (
                          <Box
                            key={idx}
                            sx={{
                              width: 52,
                              height: 52,
                              border: '1px solid rgba(43, 38, 32, 0.08)',
                              backgroundColor: 'rgba(43, 38, 32, 0.03)',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                            }}
                          >
                            <Avatar
                              src={pickUrl}
                              variant="square"
                              sx={{ width: '100%', height: '100%', borderRadius: '8px' }}
                            />
                          </Box>
                        ))
                      ) : (
                        [0, 1, 2].map((i) => (
                          <Box
                            key={i}
                            sx={{
                              width: 52,
                              height: 52,
                              border: '1.5px dashed rgba(43, 38, 32, 0.08)',
                              borderRadius: '8px',
                              backgroundColor: 'transparent',
                            }}
                          />
                        ))
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  gap: 1,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 900,
                    color: COLORS.textMuted,
                    fontFamily: 'Pretendard, sans-serif',
                  }}
                >
                  추첨 대기 중
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: COLORS.textMuted,
                    opacity: 0.7,
                    fontFamily: 'Pretendard, sans-serif',
                    textAlign: 'center',
                  }}
                >
                  관리자가 [선수 추첨하기] 버튼을 누르면
                  <br />
                  실시간으로 경매 순서가 공개됩니다.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* 대기 순서 슬롯 그리드 */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2.25,
            justifyContent: 'center',
            alignItems: 'center',
            maxHeight: '45svh',
            overflowY: 'auto',
            p: 2,
            width: '100%',
            maxWidth: 1200,
            mx: 'auto',
          }}
        >
          {rows.map((row, rowIndex) => (
            <Box
              key={rowIndex}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                flexWrap: { xs: 'wrap', md: 'nowrap' },
              }}
            >
              {row.map((slotIndex, cellIndex) => {
                // 슬롯머신이 도는 동안 현재 추첨 진행 중인 슬롯은 비워둠으로써 극적인 효과 부여
                const isThisSlotRolling = isRolling && latestDrawnPlayer && latestDrawnPlayer.order === slotIndex;
                const player = isThisSlotRolling ? null : (players.find((p) => p.order === slotIndex) ?? null);

                return (
                  <Box
                    key={slotIndex}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}
                  >
                    <DraftSlot index={slotIndex} player={player} />
                    {cellIndex < row.length - 1 && (
                      <PlayArrow
                        sx={{
                          fontSize: '1rem',
                          color: COLORS.textMuted,
                          opacity: player ? 0.6 : 0.15,
                          display: { xs: 'none', md: 'block' },
                          transition: 'opacity 0.3s ease',
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>

        {/* 제어 패널 (관리자 전용) */}
        {isAdmin && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
              mt: 2,
            }}
          >
            {!isFinished ? (
              <Button
                variant="contained"
                onClick={onDraw}
                disabled={drawing || isRolling}
                startIcon={<Casino />}
                sx={{
                  fontWeight: 900,
                  px: 4,
                  py: 1.25,
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  backgroundColor: '#FFFFFF',
                  color: COLORS.textPrimary,
                  border: '1px solid rgba(43, 38, 32, 0.15)',
                  boxShadow: '0 2px 8px rgba(43, 38, 32, 0.04)',
                  '&:hover': {
                    backgroundColor: '#FAF9F6',
                    boxShadow: '0 4px 12px rgba(43, 38, 32, 0.08)',
                  },
                }}
              >
                선수 추첨하기
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={onFinish}
                endIcon={<ArrowForward />}
                sx={{
                  fontWeight: 900,
                  px: 4,
                  py: 1.25,
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  backgroundColor: COLORS.success,
                  color: '#FFFDF8',
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: '#527A2F',
                    boxShadow: 'none',
                  },
                }}
              >
                경매 시작하기 (경매 화면으로 이동)
              </Button>
            )}
          </Box>
        )}
      </Box>

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
