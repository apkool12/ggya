import { Box, Grid, Typography } from '@mui/material';
import { COLORS, panelSx } from '../constants';

const ScheduleSlot = ({ date, label }: { date: string; label: string }) => (
  <Box sx={{ p: 0.65, backgroundColor: COLORS.panelBgStrong, border: `1px solid ${COLORS.border}`, borderRadius: 2 }}>
    <Typography variant="caption" sx={{ color: COLORS.textMuted, fontWeight: 700, fontFamily: 'Pretendard, sans-serif' }}>
      {date}
    </Typography>
    <Typography sx={{ fontWeight: 800, color: COLORS.textPrimary, fontSize: '0.82rem', fontFamily: 'Pretendard, sans-serif' }}>
      {label}
    </Typography>
  </Box>
);

export default function ScheduleBanner() {
  return (
    <Box sx={{ p: 0.9, textAlign: 'center', overflow: 'hidden', ...panelSx }}>
      <Typography sx={{ fontWeight: 800, fontSize: '0.74rem', mb: 0.45, fontFamily: 'Pretendard, sans-serif' }}>
        오프라인 본선 일정
      </Typography>
      <Grid container spacing={1} sx={{ mb: 0.25 }}>
        <Grid size={{ xs: 6 }}>
          <ScheduleSlot date="8/19 (월) 18:00" label="4강 (Bo3)" />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <ScheduleSlot date="8/20 (화) 18:00" label="결승 (Bo5)" />
        </Grid>
      </Grid>
      <Typography variant="caption" sx={{ color: COLORS.textMuted, fontFamily: 'Pretendard, sans-serif' }}>
        Byte 공식 YouTube 중계
      </Typography>
    </Box>
  );
}
