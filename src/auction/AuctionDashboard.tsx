'use client';

import { Box } from '@mui/material';
import { AuctionContext } from './AuctionContext';
import { useAuction } from './useAuction';
import Header from './components/Header';
import TeamPanel from './components/TeamPanel';
import ByteBanner from './components/ByteBanner';
import ScheduleBanner from './components/ScheduleBanner';
import ActivePlayerCard from './components/ActivePlayerCard';
import TerminalLog from './components/TerminalLog';
import BiddingConsole from './components/BiddingConsole';
import PlayerGrid from './components/PlayerGrid';
import UnsoldList from './components/UnsoldList';
import StreamChat from './components/StreamChat';
import KeyboardBanner from './components/KeyboardBanner';

export default function AuctionDashboard() {
  const api = useAuction();

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
            'linear-gradient(180deg, #F9FAFB 0%, #F3F4F6 44%, #EEF2F7 100%)',
          overflow: { xs: 'auto', lg: 'hidden' },
          p: { xs: 1, md: 1.5 },
          position: 'relative',
          gap: 1.25,
        }}
      >
        <Header />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: 'minmax(270px, 0.9fr) minmax(500px, 1.42fr) minmax(340px, 1.08fr)',
            },
            width: '100%',
            height: '100%',
            minHeight: 0,
            gap: 1.25,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              gap: 1,
              overflowY: 'auto',
              pr: { lg: 0.25 },
            }}
          >
            <TeamPanel />
            <ByteBanner />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateRows: {
                xs: 'auto auto auto auto',
                lg: '88px 206px minmax(128px, 1fr) 164px',
              },
              minHeight: 0,
              gap: 1.25,
            }}
          >
            <ScheduleBanner />
            <ActivePlayerCard />
            <TerminalLog />
            <BiddingConsole />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateRows: {
                xs: 'auto auto auto auto',
                lg: 'minmax(330px, 1.7fr) 86px minmax(110px, 0.65fr) 66px',
              },
              minHeight: 0,
              gap: 1.25,
            }}
          >
            <PlayerGrid />
            <UnsoldList />
            <StreamChat />
            <KeyboardBanner />
          </Box>
        </Box>
      </Box>
    </AuctionContext.Provider>
  );
}
