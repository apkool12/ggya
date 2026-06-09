'use client';

import { createTheme } from '@mui/material/styles';
import { COLORS } from '@/auction/constants';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: COLORS.accent,
      contrastText: COLORS.textOnAccent,
    },
    background: {
      default: COLORS.surfaceBg,
      paper: COLORS.panelBg,
    },
    text: {
      primary: COLORS.textPrimary,
      secondary: COLORS.textMuted,
    },
    error: {
      main: COLORS.danger,
    },
  },
  typography: {
    fontFamily: [
      'Pretendard',
      '-apple-system',
      'BlinkMacSystemFont',
      'system-ui',
      'Roboto',
      'sans-serif',
    ].join(','),
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          fontFamily: 'Pretendard, sans-serif',
          boxShadow: 'none',
          border: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        outlined: {
          border: 'none',
          backgroundColor: COLORS.panelBgStrong,
          '&:hover': {
            border: 'none',
            backgroundColor: COLORS.highlight,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          border: 'none',
        },
        root: {
          backgroundColor: COLORS.panelBgStrong,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: COLORS.panelBg,
          borderRadius: 8,
          boxShadow: 'none',
        },
      },
    },
  },
});
