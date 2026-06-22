'use client';

import { Box } from '@mui/material';
import { AuctionContext } from './AuctionContext';
import { useAuction } from './useAuction';
import Header from './components/Header';
import TeamPanel from './components/TeamPanel';
import ActivePlayerCard from './components/ActivePlayerCard';
import TerminalLog from './components/TerminalLog';
import BiddingConsole from './components/BiddingConsole';
import PlayerGrid from './components/PlayerGrid';
import UnsoldList from './components/UnsoldList';
import StreamChat from './components/StreamChat';
import DraftRevealScreen from './components/DraftRevealScreen';

export default function AuctionDashboard() {
  const api = useAuction();

  // 순서 추첨 단계인 경우 전체 관람객에게 추첨 연출 화면 노출
  if (api.phase === 'DRAFTING') {
    return (
      <AuctionContext.Provider value={api}>
        <DraftRevealScreen />
      </AuctionContext.Provider>
    );
  }

  return (
    <AuctionContext.Provider value={api}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateRows: 'auto minmax(0, 1fr)',
          width: '100%',
          minHeight: '100svh',
          height: { xs: 'auto', lg: '100svh' },
          background:
            'radial-gradient(1200px 600px at 70% -10%, rgba(184,144,47,0.2) 0%, rgba(184,144,47,0) 60%), linear-gradient(180deg, #C2B396 0%, #B4A485 50%, #A49474 100%)',
          overflow: { xs: 'auto', lg: 'hidden' },
          p: { xs: 1.5, md: 2 },
          position: 'relative',
          gap: 1.5,
        }}
      >
        <Header />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: 'minmax(280px, 0.9fr) minmax(500px, 1.42fr) minmax(340px, 1.08fr)',
            },
            width: '100%',
            height: '100%',
            minHeight: 0,
            gap: 1.5,
          }}
        >
          {/* 좌측 열: 팀별 상황판 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              gap: 1.25,
              overflowY: 'auto',
              pr: { lg: 0.25 },
            }}
          >
            <TeamPanel />
          </Box>

          {/* 중간 열: 현재 대상자 & 입찰 패널 */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateRows: {
                xs: 'auto auto auto',
                lg: '210px minmax(96px, 1fr) auto',
              },
              minHeight: 0,
              gap: 1.5,
            }}
          >
            <ActivePlayerCard />
            <TerminalLog />
            <BiddingConsole />
          </Box>

          {/* 우측 열: 대기 목록 & 유찰 목록 & 스트리밍 채팅 */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateRows: {
                xs: 'auto auto auto',
                lg: 'minmax(330px, 1.8fr) 80px minmax(110px, 0.7fr)',
              },
              minHeight: 0,
              gap: 1.5,
            }}
          >
            <PlayerGrid />
            <UnsoldList />
            <StreamChat />
          </Box>
        </Box>
      </Box>
    </AuctionContext.Provider>
  );
}
