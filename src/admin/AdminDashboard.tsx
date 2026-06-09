'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Add, ArrowBack, Delete, Edit } from '@mui/icons-material';

interface AdminTeam {
  id: string;
  name: string;
  leaderName: string;
  avatarUrl: string;
  startingPoints: number;
  points: number;
  leaderAccount: { username: string } | null;
}

interface FormState {
  id: string | null;
  name: string;
  leaderName: string;
  avatarUrl: string;
  startingPoints: number;
  leaderUsername: string;
  leaderPassword: string;
}

const emptyForm: FormState = {
  id: null,
  name: '',
  leaderName: '',
  avatarUrl: '',
  startingPoints: 1000,
  leaderUsername: '',
  leaderPassword: '',
};

export default function AdminDashboard() {
  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    const res = await fetch('/api/admin/teams');
    if (res.ok) setTeams((await res.json()).teams);
  }, []);

  useEffect(() => {
    void fetchTeams();
  }, [fetchTeams]);

  const openCreate = () => setForm({ ...emptyForm });
  const openEdit = (t: AdminTeam) =>
    setForm({
      id: t.id,
      name: t.name,
      leaderName: t.leaderName,
      avatarUrl: t.avatarUrl,
      startingPoints: t.startingPoints,
      leaderUsername: t.leaderAccount?.username ?? '',
      leaderPassword: '',
    });

  const save = async () => {
    if (!form) return;
    const isEdit = form.id !== null;
    const url = isEdit ? `/api/admin/teams/${form.id}` : '/api/admin/teams';
    const method = isEdit ? 'PATCH' : 'POST';
    const body: Record<string, unknown> = {
      name: form.name,
      leaderName: form.leaderName,
      avatarUrl: form.avatarUrl,
      startingPoints: Number(form.startingPoints),
    };
    if (!isEdit) {
      body.leaderUsername = form.leaderUsername;
      body.leaderPassword = form.leaderPassword;
    } else if (form.leaderPassword) {
      body.leaderPassword = form.leaderPassword;
    }
    const res = await fetch(url, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setToast((await res.json().catch(() => ({}))).error ?? '저장 실패');
      return;
    }
    setForm(null);
    await fetchTeams();
  };

  const remove = async (id: string) => {
    if (!window.confirm('이 팀과 팀장 계정을 삭제할까요?')) return;
    let res = await fetch(`/api/admin/teams/${id}`, { method: 'DELETE' });
    if (res.status === 409) {
      if (!window.confirm('경매가 진행 중입니다. 경매를 초기화하고 삭제할까요?')) return;
      res = await fetch(`/api/admin/teams/${id}?force=1`, { method: 'DELETE' });
    }
    if (!res.ok) {
      setToast((await res.json().catch(() => ({}))).error ?? '삭제 실패');
      return;
    }
    await fetchTeams();
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            팀 관리
          </Typography>
          <Typography variant="body2" color="text.secondary">
            팀과 팀장 계정을 등록·수정·삭제합니다.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button component={Link} href="/" startIcon={<ArrowBack />} variant="outlined">
            경매 화면
          </Button>
          <Button onClick={openCreate} startIcon={<Add />} variant="contained">
            팀 추가
          </Button>
        </Box>
      </Box>

      <Paper variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>팀명</TableCell>
              <TableCell>팀장</TableCell>
              <TableCell>팀장 계정</TableCell>
              <TableCell align="right">시작 P</TableCell>
              <TableCell align="right">잔여 P</TableCell>
              <TableCell align="right">관리</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teams.map((t) => (
              <TableRow key={t.id} hover>
                <TableCell sx={{ fontWeight: 700 }}>{t.name}</TableCell>
                <TableCell>{t.leaderName}</TableCell>
                <TableCell>{t.leaderAccount?.username ?? '—'}</TableCell>
                <TableCell align="right">{t.startingPoints}</TableCell>
                <TableCell align="right">{t.points}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(t)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => remove(t.id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {teams.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: 'text.secondary', py: 4 }}>
                  등록된 팀이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={!!form} onClose={() => setForm(null)} fullWidth maxWidth="sm">
        <DialogTitle>{form?.id ? '팀 수정' : '팀 추가'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="팀명"
              value={form?.name ?? ''}
              onChange={(e) => setForm((f) => (f ? { ...f, name: e.target.value } : f))}
              fullWidth
            />
            <TextField
              label="팀장 이름"
              value={form?.leaderName ?? ''}
              onChange={(e) => setForm((f) => (f ? { ...f, leaderName: e.target.value } : f))}
              fullWidth
            />
            <TextField
              label="아바타 이미지 URL"
              value={form?.avatarUrl ?? ''}
              onChange={(e) => setForm((f) => (f ? { ...f, avatarUrl: e.target.value } : f))}
              fullWidth
            />
            <TextField
              label="시작 포인트"
              type="number"
              value={form?.startingPoints ?? 1000}
              onChange={(e) =>
                setForm((f) => (f ? { ...f, startingPoints: Number(e.target.value) } : f))
              }
              fullWidth
            />
            {form?.id === null && (
              <TextField
                label="팀장 로그인 아이디"
                value={form?.leaderUsername ?? ''}
                onChange={(e) =>
                  setForm((f) => (f ? { ...f, leaderUsername: e.target.value } : f))
                }
                fullWidth
              />
            )}
            <TextField
              label={form?.id ? '팀장 비밀번호 (변경 시에만 입력)' : '팀장 비밀번호'}
              type="password"
              value={form?.leaderPassword ?? ''}
              onChange={(e) =>
                setForm((f) => (f ? { ...f, leaderPassword: e.target.value } : f))
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForm(null)}>취소</Button>
          <Button onClick={save} variant="contained">
            저장
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!toast}
        autoHideDuration={3500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="warning" variant="filled" onClose={() => setToast(null)}>
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}
