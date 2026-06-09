'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Alert, Box, Button, TextField, Typography } from '@mui/material';
import { useAuth } from '@/auth/AuthContext';
import { COLORS } from '@/auction/constants';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const r = await login(username, password);
    setSubmitting(false);
    if (!r.ok) {
      setError(r.error ?? '로그인 실패');
      return;
    }
    const me = await (await fetch('/api/auth/me')).json();
    router.push(me.user?.role === 'ADMIN' ? '/admin' : '/');
  };

  return (
    <Box
      sx={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(900px 500px at 50% -10%, rgba(184,144,47,0.22) 0%, rgba(184,144,47,0) 60%), linear-gradient(180deg, #F3EAD7 0%, #E4D8BF 100%)',
        p: 2,
      }}
    >
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{
          width: '100%',
          maxWidth: 380,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          p: 4,
          borderRadius: 3,
          background: COLORS.panelBg,
          border: `1px solid ${COLORS.border}`,
          boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            GGya 경매 로그인
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            관리자 또는 팀장 계정으로 로그인하세요.
          </Typography>
        </Box>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          fullWidth
        />
        <TextField
          label="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />
        <Button type="submit" variant="contained" size="large" disabled={submitting}>
          {submitting ? '로그인 중…' : '로그인'}
        </Button>
        <Button component={Link} href="/" size="small" sx={{ alignSelf: 'center' }}>
          ← 경매 화면으로 (관전)
        </Button>
      </Box>
    </Box>
  );
}
