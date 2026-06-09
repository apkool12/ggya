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
  MenuItem,
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
import { roleToKo, type PlayerRoleEn } from '@/shared/roles';

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

interface AdminPlayer {
  id: string;
  name: string;
  role: PlayerRoleEn;
  avatarUrl: string;
  status: string;
  mostPicks: string[];
}

interface PlayerForm {
  id: string;
  name: string;
  role: PlayerRoleEn;
  avatarUrl: string;
  pick1: string;
  pick2: string;
  pick3: string;
}

const ROLE_OPTIONS: PlayerRoleEn[] = ['TANK', 'DPS', 'SUPPORT'];

export default function AdminDashboard() {
  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [players, setPlayers] = useState<AdminPlayer[]>([]);
  const [playerForm, setPlayerForm] = useState<PlayerForm | null>(null);

  const fetchTeams = useCallback(async () => {
    const res = await fetch('/api/admin/teams');
    if (res.ok) setTeams((await res.json()).teams);
  }, []);

  const fetchPlayers = useCallback(async () => {
    const res = await fetch('/api/auction/state');
    if (res.ok) setPlayers((await res.json()).players);
  }, []);

  useEffect(() => {
    void fetchTeams();
    void fetchPlayers();
  }, [fetchTeams, fetchPlayers]);

  const openPlayerEdit = (p: AdminPlayer) =>
    setPlayerForm({
      id: p.id,
      name: p.name,
      role: p.role,
      avatarUrl: p.avatarUrl,
      pick1: p.mostPicks[0] ?? '',
      pick2: p.mostPicks[1] ?? '',
      pick3: p.mostPicks[2] ?? '',
    });

  const savePlayer = async () => {
    if (!playerForm) return;
    const res = await fetch(`/api/admin/players/${playerForm.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: playerForm.name,
        role: playerForm.role,
        avatarUrl: playerForm.avatarUrl,
        mostPicks: [playerForm.pick1, playerForm.pick2, playerForm.pick3],
      }),
    });
    if (!res.ok) {
      setToast((await res.json().catch(() => ({}))).error ?? '저장 실패');
      return;
    }
    setPlayerForm(null);
    await fetchPlayers();
  };

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

      <Typography variant="h5" sx={{ fontWeight: 900, mt: 5, mb: 1 }}>
        선수 관리
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        선수 이름·프로필 이미지·역할·선호 픽을 편집합니다.
      </Typography>
      <Paper variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>프로필</TableCell>
              <TableCell>이름</TableCell>
              <TableCell>역할</TableCell>
              <TableCell>선호 픽</TableCell>
              <TableCell align="right">편집</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {players.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>
                  <Box
                    component="img"
                    src={p.avatarUrl}
                    alt={p.name}
                    sx={{ width: 36, height: 36, borderRadius: 1, objectFit: 'cover' }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{p.name}</TableCell>
                <TableCell>{roleToKo(p.role)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    {p.mostPicks.slice(0, 3).map((u, i) => (
                      <Box
                        key={i}
                        component="img"
                        src={u}
                        alt=""
                        sx={{ width: 26, height: 26, borderRadius: 0.5, objectFit: 'cover' }}
                      />
                    ))}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openPlayerEdit(p)}>
                    <Edit fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={!!playerForm} onClose={() => setPlayerForm(null)} fullWidth maxWidth="sm">
        <DialogTitle>선수 편집</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="이름"
              value={playerForm?.name ?? ''}
              onChange={(e) => setPlayerForm((f) => (f ? { ...f, name: e.target.value } : f))}
              fullWidth
            />
            <TextField
              select
              label="역할"
              value={playerForm?.role ?? 'TANK'}
              onChange={(e) =>
                setPlayerForm((f) => (f ? { ...f, role: e.target.value as PlayerRoleEn } : f))
              }
              fullWidth
            >
              {ROLE_OPTIONS.map((r) => (
                <MenuItem key={r} value={r}>
                  {roleToKo(r)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="프로필 이미지 URL"
              value={playerForm?.avatarUrl ?? ''}
              onChange={(e) => setPlayerForm((f) => (f ? { ...f, avatarUrl: e.target.value } : f))}
              fullWidth
            />
            <TextField
              label="선호 픽 1 이미지 URL"
              value={playerForm?.pick1 ?? ''}
              onChange={(e) => setPlayerForm((f) => (f ? { ...f, pick1: e.target.value } : f))}
              fullWidth
            />
            <TextField
              label="선호 픽 2 이미지 URL"
              value={playerForm?.pick2 ?? ''}
              onChange={(e) => setPlayerForm((f) => (f ? { ...f, pick2: e.target.value } : f))}
              fullWidth
            />
            <TextField
              label="선호 픽 3 이미지 URL"
              value={playerForm?.pick3 ?? ''}
              onChange={(e) => setPlayerForm((f) => (f ? { ...f, pick3: e.target.value } : f))}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPlayerForm(null)}>취소</Button>
          <Button onClick={savePlayer} variant="contained">
            저장
          </Button>
        </DialogActions>
      </Dialog>

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
