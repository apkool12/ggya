'use client';

import { Box, Button, Grid, IconButton, TextField, Typography } from '@mui/material';
import { CheckCircleOutlined, FlashOn, Pause, PlayArrow, RotateLeft } from '@mui/icons-material';
import { BID_INCREMENTS, COLORS, panelSx } from '../constants';
import { useAuctionContext } from '../AuctionContext';

export default function BiddingConsole() {
  const {
    activePlayer,
    timer,
    timerActive,
    customBid,
    setCustomBid,
    quickBid,
    submitManualBid,
    toggleTimer,
    resetTimer,
    highestBidder,
    markUnsold,
    confirmBidWin,
  } = useAuctionContext();

  const disabled = !activePlayer;

  return (
    <Box sx={{ p: 1.1, overflow: 'hidden', ...panelSx }}>
      <Grid container spacing={1} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 4 }}>
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              p: 0.85,
              backgroundColor: COLORS.accent,
              borderRadius: 2,
              color: COLORS.textOnAccent,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="caption"
              sx={{ fontWeight: 800, fontSize: '0.62rem', fontFamily: 'Pretendard, sans-serif' }}
            >
              TIME
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                fontFamily: 'monospace',
                mt: 0.4,
                fontSize: '1.5rem',
                lineHeight: 1,
              }}
            >
              {timer.toFixed(2)}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 8 }}>
          <Box
            sx={{
              height: '100%',
              p: 0.95,
              backgroundColor: COLORS.panelBgStrong,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                color: COLORS.textMuted,
                fontSize: '0.65rem',
                mb: 0.7,
                display: 'flex',
                alignItems: 'center',
                gap: 0.35,
                fontFamily: 'Pretendard, sans-serif',
              }}
            >
              <FlashOn sx={{ fontSize: '0.85rem' }} />
              빠른 입찰
            </Typography>
            <Grid container spacing={0.7}>
              {BID_INCREMENTS.map((val) => (
                <Grid size={{ xs: 3 }} key={val}>
                  <Button
                    fullWidth
                    size="small"
                    onClick={() => quickBid(val)}
                    disabled={disabled}
                    sx={{
                      py: 0.65,
                      fontWeight: 800,
                      color: COLORS.textPrimary,
                      background: COLORS.panelBg,
                      fontFamily: 'Pretendard, sans-serif',
                      '&:hover': { background: COLORS.highlight },
                      '&.Mui-disabled': { color: COLORS.textMuted },
                    }}
                  >
                    +{val}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 0.75, mt: 0.95, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="P 직접 입력"
          value={customBid}
          onChange={(e) => setCustomBid(e.target.value)}
          disabled={disabled}
          sx={{
            flex: '1 1 220px',
            '& .MuiInputBase-root': {
              height: 40,
              borderRadius: 2,
              alignItems: 'center',
            },
            '& input': {
              py: 0,
              height: 40,
              lineHeight: '40px',
            },
          }}
        />

        <Button
          variant="contained"
          onClick={submitManualBid}
          disabled={disabled || !customBid}
          sx={{
            height: 40,
            px: 2,
            fontWeight: 700,
            background: COLORS.accent,
            '&:hover': { background: '#27272A' },
          }}
        >
          입찰
        </Button>

        <Button
          onClick={markUnsold}
          disabled={disabled}
          sx={{
            height: 40,
            px: 1.6,
            flexShrink: 0,
            fontWeight: 800,
            background: COLORS.dangerSoft,
            color: COLORS.danger,
            '&:hover': { background: '#FFE4E6' },
            '&.Mui-disabled': {
              color: COLORS.textMuted,
              background: COLORS.panelBgMuted,
            },
          }}
        >
          유찰
        </Button>

        <Button
          variant="contained"
          startIcon={<CheckCircleOutlined />}
          onClick={confirmBidWin}
          disabled={disabled || !highestBidder}
          sx={{
            height: 40,
            px: 1.6,
            flexShrink: 0,
            fontWeight: 800,
            background: COLORS.accent,
            '& .MuiButton-startIcon': { mr: 0.45 },
            '&:hover': { background: '#27272A' },
            '&.Mui-disabled': {
              background: COLORS.panelBgMuted,
              color: COLORS.textMuted,
            },
          }}
        >
          낙찰
        </Button>

        <IconButton
          size="small"
          onClick={toggleTimer}
          disabled={disabled}
          sx={{
            width: 40,
            height: 40,
            bgcolor: COLORS.panelBgStrong,
            color: timerActive ? COLORS.danger : COLORS.textPrimary,
          }}
        >
          {timerActive ? <Pause /> : <PlayArrow />}
        </IconButton>
        <IconButton
          size="small"
          onClick={resetTimer}
          disabled={disabled}
          sx={{ width: 40, height: 40, bgcolor: COLORS.panelBgStrong }}
        >
          <RotateLeft />
        </IconButton>
      </Box>
    </Box>
  );
}
