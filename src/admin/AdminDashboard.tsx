'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Alert,
  Avatar,
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
import { Add, ArrowBack, Delete, Edit, PlayArrow, Check, Block, Refresh, Casino } from '@mui/icons-material';
import { roleToKo, type PlayerRoleEn } from '@/shared/roles';
import { COLORS } from '@/auction/constants';

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
  order: number;
  tankTier: string;
  dpsTier: string;
  supportTier: string;
  intro: string;
}

interface PlayerForm {
  id: string | null;
  name: string;
  role: PlayerRoleEn;
  avatarUrl: string;
  pick1: string;
  pick2: string;
  pick3: string;
  order: number;
  tankTier: string;
  dpsTier: string;
  supportTier: string;
  intro: string;
}

const HERO_IMAGES: Record<string, string> = {
  디바: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/df5a5532862d9292634fb3dc0e51a4705aa601de65e5e815513ccc663d84de56.png',
  라인하르트: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/551fbe070c16fdfcc17f7f1de63af22c53e7d2f1340fc2f3172441504527bc4e.png',
  윈스턴: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/46a10db3aa908c590ddc4e7606376a88143d1f1306ecfbea043263040f9529a5.png',
  로드호그: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/89ddf07e4b619ed96169042e296a1b8856d102746f35add88284b44a9a5a6a03.png',
  자리야: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/9b6f63cc66ddf9d5e0862173c733cc0d2e574c5c89357798d91b93b2f95a7080.png',
  오리사: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/a73958a28551f5254f3ab3f97c5f5f8d698a95c0b6a515d1a2b1caac169205a6.png',
  시그마: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/a4c032fa466c9a6d9c6974747635d7ef910027f91cd58892af0c899db565f92d.png',
  레킹볼: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/9ef1d58867136e0b26f928d896000b9dab216118f6e2f59e53f2e975e1e27afa.png',
  라마트라: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/6/6f/Icon-Ramattra.png',
  정커퀸: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/2/2b/Icon-Junker_Queen.png',
  마우가: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/3/39/Icon-Mauga.png',
  둠피스트: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/a/a1/Icon-Doomfist.png',
  해저드: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/5/54/Icon-Hazard.png',
  도미나: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/7/76/Icon-Domina.png',
  겐지: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/156b12c20b1aea872c1eeb5bb37a7de1047b2ab30ecefd0663a8925badde1ea8.png',
  트레이서: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/4504f6f15cb3feaa92ecd38e01dcf751cb5abdac2e0bb52d0555727e53277502.png',
  리퍼: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/dc6ff07ac790c00dc95a40882449617bb6e0e38906b353a630cffe0c815270a9.png',
  솔저76: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/c93b5f0a528c40473188f77cc2a267aee7d5b6cf5c9e104105d634b4388674e2.png',
  한조: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/78b61c3e806fb26b02b8980fba62189155074fc15bd865b0883268e546030be5.png',
  위도우메이커: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/6e4702b45f196aaf51555cf57327322721f45458b17f5f0643ed008a88378259.png',
  소전: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/82b8c1b8765dcb9a0ba16e343c3516bf324c771ac81e9878473280216e70a889.png',
  애쉬: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/4076bbaa2eb52a0bfe612434071e56e7702d5454473dbbea2f9e392a9d997a94.png',
  벤처: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/a/a0/Icon-Venture.png',
  안란: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/0/07/Icon-Anran.png',
  바스티언: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/5/51/Icon-Bastion.png',
  캐서디: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/0/05/Icon-Cassidy.png',
  에코: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/d/d6/Icon-Echo.png',
  정크랫: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/9/99/Icon-Junkrat.png',
  메이: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/9/99/Icon-Mei.png',
  파라: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/2/29/Icon-Pharah.png',
  솜브라: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/7/70/Icon-Sombra.png',
  시메트라: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/0/06/Icon-Symmetra.png',
  토르비욘: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/c/ca/Icon-Torbj%C3%B6rn.png',
  엠레: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/3/34/Icon-Emre.png',
  프레이야: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/0/04/Icon-Freja.png',
  시에라: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/3/32/Icon-Sierra.png',
  벤데타: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/d/dd/Icon-Vendetta.png',
  시온: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/7/74/Icon-Shion.png',
  아나: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/985b06beae46b7ba3ca87d1512d0fc62ca7f206ceca58ef16fc44d43a1cc84ed.png',
  메르시: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/3bfb8bd8ec827e53d870f1238ab73d8aa1f5dbfbcfaaf7f96ffcd35b5c6102ab.png',
  모이라: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/f48f8485056d5d00dad195859188d23e50f7126b8b08b5646f46ef1b42f5e1de.png',
  브리기테: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/795fba91376d87d441a7f359ae12a3175dfa95825ccc4414cc6b95b129fc4cb0.png',
  루시우: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/040bb13f5123ab93faad2f95627ba184608aef4b2469a4d3003859c7087df044.png',
  키리코: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/408603fe037e8576078eaac5eab2fb251489ced4003b11f5f522776d43d0b83d.png',
  바티스트: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/d4e6f1ca45d9f88fa89260787397f141a6f007b14e5b26698883b6a17bab9680.png',
  일리아리: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/ce42d1455e03e79f321345fea84b27a8918b5db8bd7ab9b2ca9e569606ede9e4.png',
  주노: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/c0167d251e57b0aa2b1e16c37d87f0e7c77263db9dd0503d77b5f2589bf3e4a0.png',
  라이프위버: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/8/86/Icon-Lifeweaver.png',
  '제트팩 캣': 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/1/12/Icon-Jetpack_Cat.png',
  미즈키: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/3/36/Icon-Mizuki.png',
  우양: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/6/6c/Icon-Wuyang.png',
  젠야타: 'https://static.wikia.nocookie.net/overwatch_gamepedia/images/f/f7/Icon-Zenyatta.png',
};

const urlToHeroName = (url: string): string => {
  const match = Object.entries(HERO_IMAGES).find(([_, u]) => u === url);
  return match ? match[0] : url;
};

const ROLE_OPTIONS: PlayerRoleEn[] = ['TANK', 'DPS', 'SUPPORT'];

const inputSx = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(184, 144, 47, 0.20)',
      borderRadius: '8px',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(184, 144, 47, 0.40)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#B8902F',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#B8902F',
  },
};

export default function AdminDashboard() {
  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [players, setPlayers] = useState<AdminPlayer[]>([]);
  const [playerForm, setPlayerForm] = useState<PlayerForm | null>(null);
  const [snap, setSnap] = useState<any>(null);

  const fetchTeams = useCallback(async () => {
    const res = await fetch('/api/admin/teams');
    if (res.ok) setTeams((await res.json()).teams);
  }, []);

  const fetchPlayers = useCallback(async () => {
    const res = await fetch('/api/auction/state');
    if (res.ok) {
      const data = await res.json();
      setSnap(data);
      setPlayers(data.players);
    }
  }, []);

  useEffect(() => {
    void fetchTeams();
    void fetchPlayers();

    const interval = setInterval(() => {
      void fetchPlayers();
    }, 2000);
    return () => clearInterval(interval);
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
      order: p.order ?? 0,
      tankTier: p.tankTier ?? '',
      dpsTier: p.dpsTier ?? '',
      supportTier: p.supportTier ?? '',
      intro: p.intro ?? '',
    });

  const openPlayerCreate = () =>
    setPlayerForm({
      id: null,
      name: '',
      role: 'TANK',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60',
      pick1: '',
      pick2: '',
      pick3: '',
      order: players.length,
      tankTier: '',
      dpsTier: '',
      supportTier: '',
      intro: '',
    });

  const savePlayer = async () => {
    if (!playerForm) return;
    const isEdit = playerForm.id !== null;
    const url = isEdit ? `/api/admin/players/${playerForm.id}` : '/api/admin/players';
    const method = isEdit ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: playerForm.name,
        role: playerForm.role,
        avatarUrl: playerForm.avatarUrl,
        mostPicks: [playerForm.pick1, playerForm.pick2, playerForm.pick3],
        order: Number(playerForm.order),
        tankTier: playerForm.tankTier,
        dpsTier: playerForm.dpsTier,
        supportTier: playerForm.supportTier,
        intro: playerForm.intro,
      }),
    });
    if (!res.ok) {
      setToast((await res.json().catch(() => ({}))).error ?? '저장 실패');
      return;
    }
    setPlayerForm(null);
    await fetchPlayers();
  };

  const removePlayer = async (playerId: string) => {
    if (!window.confirm('이 선수를 삭제할까요?')) return;
    const res = await fetch(`/api/admin/players/${playerId}`, { method: 'DELETE' });
    if (!res.ok) {
      await handleApiError(res, '선수 삭제 실패');
      return;
    }
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

  const handleApiError = async (res: Response, defaultMsg: string) => {
    try {
      const data = await res.json().catch(() => ({}));
      setToast(data.error ?? `${defaultMsg} (상태코드: ${res.status})`);
    } catch {
      setToast(`${defaultMsg} (상태코드: ${res.status})`);
    }
  };

  const startNext = async () => {
    const res = await fetch('/api/auction/next', { method: 'POST' });
    if (!res.ok) {
      await handleApiError(res, '경매 시작 실패');
    } else {
      await fetchPlayers();
    }
  };

  const confirmWin = async () => {
    const res = await fetch('/api/auction/confirm', { method: 'POST' });
    if (!res.ok) {
      await handleApiError(res, '낙찰 확정 실패');
    } else {
      await fetchPlayers();
    }
  };

  const markUnsold = async () => {
    const res = await fetch('/api/auction/unsold', { method: 'POST' });
    if (!res.ok) {
      await handleApiError(res, '유찰 처리 실패');
    } else {
      await fetchPlayers();
    }
  };

  const startDrafting = async () => {
    if (!window.confirm('기존 순서와 낙찰 내역을 초기화하고 순서 추첨(DRAFT)을 시작하시겠습니까?')) return;
    const res = await fetch('/api/auction/draft/start', { method: 'POST' });
    if (!res.ok) {
      await handleApiError(res, '추첨 시작 실패');
    } else {
      await fetchPlayers();
    }
  };

  const drawDraftPlayer = async () => {
    const res = await fetch('/api/auction/draft/draw', { method: 'POST' });
    if (!res.ok) {
      await handleApiError(res, '선수 추첨 실패');
    } else {
      await fetchPlayers();
    }
  };

  const finishDrafting = async () => {
    const res = await fetch('/api/auction/draft/finish', { method: 'POST' });
    if (!res.ok) {
      await handleApiError(res, '추첨 완료 실패');
    } else {
      await fetchPlayers();
    }
  };

  const movePlayerOrder = async (playerId: string, direction: 'up' | 'down') => {
    const list = [...players].sort((a, b) => a.order - b.order);
    const idx = list.findIndex((p) => p.id === playerId);
    if (idx === -1) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= list.length) return;

    const p1 = list[idx];
    const p2 = list[swapIdx];

    const o1 = p1.order;
    const o2 = p2.order;

    await Promise.all([
      fetch(`/api/admin/players/${p1.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ order: o2 }),
      }),
      fetch(`/api/admin/players/${p2.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ order: o1 }),
      }),
    ]);
    await fetchPlayers();
  };

  const resetAll = async () => {
    if (!window.confirm('모든 경매 상태와 팀 포인트, 로그를 초기화할까요?')) return;
    const res = await fetch('/api/auction/reset', { method: 'POST' });
    if (!res.ok) {
      await handleApiError(res, '초기화 실패');
    } else {
      await fetchPlayers();
    }
  };

  const selectPlayer = async (playerId: string) => {
    const res = await fetch('/api/auction/select', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ playerId }),
    });
    if (!res.ok) {
      await handleApiError(res, '선수 선택 실패');
    } else {
      await fetchPlayers();
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('이 팀과 팀장 계정을 삭제할까요?')) return;
    let res = await fetch(`/api/admin/teams/${id}`, { method: 'DELETE' });
    if (res.status === 409) {
      if (!window.confirm('경매가 진행 중입니다. 경매를 초기화하고 삭제할까요?')) return;
      res = await fetch(`/api/admin/teams/${id}?force=1`, { method: 'DELETE' });
    }
    if (!res.ok) {
      await handleApiError(res, '삭제 실패');
      return;
    }
    await fetchTeams();
  };

  const isDraftingMode = snap?.phase === 'DRAFTING';

  return (
    <Box
      sx={{
        height: '100vh',
        overflowY: 'auto',
        p: { xs: 2, md: 4 },
        background: 'linear-gradient(135deg, #DDD0B6 0%, #C6B79C 100%)',
      }}
    >
      <Box sx={{ maxWidth: 1080, mx: 'auto', pb: 4 }}>
        {/* 경매 진행 컨트롤 패널 */}
        <Paper
          variant="outlined"
          sx={{
            p: 3,
            mb: 4,
            background: COLORS.panelBg,
            borderColor: 'rgba(184, 144, 47, 0.18)',
            borderRadius: 3,
            boxShadow: COLORS.shadow,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 950,
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: COLORS.textPrimary,
              fontFamily: 'Pretendard, sans-serif',
            }}
          >
            <PlayArrow sx={{ color: COLORS.accent }} /> {isDraftingMode ? '실시간 경매 순서 추첨 (DRAFT) 제어' : '실시간 경매 진행 제어'}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mb: 3,
              color: COLORS.textMuted,
              fontFamily: 'Pretendard, sans-serif',
              fontWeight: 700,
            }}
          >
            {isDraftingMode
              ? '순서 추첨 단계입니다. 선수를 순서대로 무작위 추첨하여 경매 순서를 배정하고 경매 화면을 활성화합니다.'
              : '경매 대상 선수를 순서대로 시작시키고 낙찰 확정 및 유찰 처리를 수행합니다.'}
          </Typography>

          {isDraftingMode ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 0.8fr' }, gap: 3 }}>
              {/* 상태 요약 */}
              <Box
                sx={{
                  p: 2.5,
                  backgroundColor: COLORS.panelBgStrong,
                  border: '1px solid rgba(184, 144, 47, 0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minHeight: 120,
                  borderRadius: 2.5,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 950, color: COLORS.accent, fontFamily: 'Pretendard, sans-serif' }}>
                  추첨 진행률: {players.filter((p) => p.order >= 0).length} / {players.length}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, color: COLORS.textMuted, fontFamily: 'Pretendard, sans-serif', fontWeight: 700 }}>
                  모든 참가자들은 현재 대기 순서 추첨 연출 보드를 실시간으로 관전하고 있습니다.
                </Typography>
              </Box>

              {/* 제어 버튼 그룹 */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Casino />}
                  onClick={drawDraftPlayer}
                  disabled={players.filter((p) => p.order >= 0).length === players.length}
                  sx={{
                    fontWeight: 900,
                    height: 44,
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    color: COLORS.textPrimary,
                    border: `1px solid rgba(184, 144, 47, 0.20)`,
                    boxShadow: '0 2px 8px rgba(43, 38, 32, 0.05)',
                    '&:hover': {
                      background: COLORS.panelBgStrong,
                      borderColor: 'rgba(184, 144, 47, 0.35)',
                    },
                    '&.Mui-disabled': {
                      background: COLORS.panelBgMuted,
                      color: COLORS.textMuted,
                      borderColor: 'transparent',
                    },
                  }}
                >
                  선수 추첨하기
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Check />}
                  onClick={finishDrafting}
                  sx={{
                    fontWeight: 900,
                    height: 40,
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    color: COLORS.success,
                    border: `1px solid rgba(94, 140, 54, 0.30)`,
                    boxShadow: '0 2px 8px rgba(43, 38, 32, 0.05)',
                    '&:hover': {
                      background: 'rgba(94, 140, 54, 0.08)',
                      borderColor: 'rgba(94, 140, 54, 0.55)',
                    },
                  }}
                >
                  추첨 완료 및 경매 시작
                </Button>
              </Box>

              {/* 실시간 추첨 목록 및 순서 조정 */}
              <Box sx={{ gridColumn: '1 / -1', mt: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 1, color: COLORS.textPrimary, fontFamily: 'Pretendard, sans-serif' }}>
                  🎯 추첨된 선수 순서 조정 (실시간 반영)
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    maxHeight: 300,
                    overflowY: 'auto',
                    borderRadius: 2.5,
                    background: COLORS.panelBgStrong,
                    borderColor: COLORS.border,
                  }}
                >
                  {players.filter((p) => p.order >= 0).length === 0 ? (
                    <Typography variant="body2" sx={{ py: 2, textAlign: 'center', color: COLORS.textMuted, fontFamily: 'Pretendard, sans-serif' }}>
                      아직 추첨된 선수가 없습니다. 아래 '선수 추첨하기' 버튼을 누르세요.
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {[...players]
                        .filter((p) => p.order >= 0)
                        .sort((a, b) => a.order - b.order)
                        .map((p, idx, arr) => (
                          <Box
                            key={p.id}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              p: 1,
                              background: '#FFFFFF',
                              border: `1px solid ${COLORS.border}`,
                              borderRadius: 2,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Typography variant="body2" sx={{ fontWeight: 900, color: COLORS.textMuted, width: 24 }}>
                                #{idx + 1}
                              </Typography>
                              <Avatar src={p.avatarUrl} sx={{ width: 32, height: 32, border: `1px solid ${COLORS.border}` }} variant="square" />
                              <Typography variant="body2" sx={{ fontWeight: 800, color: COLORS.textPrimary, fontFamily: 'Pretendard, sans-serif' }}>
                                {p.name}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => movePlayerOrder(p.id, 'up')}
                                disabled={idx === 0}
                                sx={{
                                  minWidth: 32,
                                  p: 0.25,
                                  borderRadius: '6px',
                                  borderColor: 'rgba(184, 144, 47, 0.20)',
                                  color: COLORS.textPrimary,
                                  '&:hover': { background: COLORS.panelBgStrong, borderColor: 'rgba(184, 144, 47, 0.40)' },
                                }}
                              >
                                ▲
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => movePlayerOrder(p.id, 'down')}
                                disabled={idx === arr.length - 1}
                                sx={{
                                  minWidth: 32,
                                  p: 0.25,
                                  borderRadius: '6px',
                                  borderColor: 'rgba(184, 144, 47, 0.20)',
                                  color: COLORS.textPrimary,
                                  '&:hover': { background: COLORS.panelBgStrong, borderColor: 'rgba(184, 144, 47, 0.40)' },
                                }}
                              >
                                ▼
                              </Button>
                            </Box>
                          </Box>
                        ))}
                    </Box>
                  )}
                </Paper>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 0.8fr' }, gap: 3 }}>
              {/* 상태 요약 */}
              <Box
                sx={{
                  p: 2,
                  backgroundColor: COLORS.panelBgStrong,
                  border: `1px solid ${COLORS.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2.5,
                  minHeight: 120,
                  borderRadius: 2.5,
                }}
              >
                {snap?.activePlayerId ? (
                  <>
                    <Box
                      component="img"
                      src={players.find((p) => p.id === snap.activePlayerId)?.avatarUrl}
                      sx={{ width: 80, height: 100, objectFit: 'cover', border: `1.5px solid ${COLORS.accent}`, borderRadius: 1.5 }}
                    />
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: COLORS.textMuted, fontFamily: 'Pretendard, sans-serif' }}>
                        현재 진행 중인 선수
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 950, color: COLORS.textPrimary, fontFamily: 'Pretendard, sans-serif' }}>
                        {players.find((p) => p.id === snap.activePlayerId)?.name}
                      </Typography>
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="body2" sx={{ fontWeight: 900, color: COLORS.accent, fontFamily: 'Pretendard, sans-serif' }}>
                          현재 입찰가: {snap.currentBid}P
                        </Typography>
                        {snap.highestBidderTeamId && (
                          <Typography variant="body2" sx={{ fontWeight: 900, color: COLORS.success, fontFamily: 'Pretendard, sans-serif' }}>
                            최고 입찰팀: {teams.find((t) => t.id === snap.highestBidderTeamId)?.name}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ py: 2, px: 1, textAlign: 'center', width: '100%' }}>
                    <Typography sx={{ fontWeight: 900, color: COLORS.textPrimary, fontFamily: 'Pretendard, sans-serif' }}>
                      현재 진행 중인 경매 선수가 없습니다.
                    </Typography>
                    <Typography variant="caption" sx={{ color: COLORS.textMuted, fontFamily: 'Pretendard, sans-serif', mt: 0.5, display: 'block' }}>
                      우측 '경매 시작' 버튼을 누르면 대기 중인 첫 번째 선수의 경매가 시작됩니다.
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* 제어 버튼 그룹 */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<PlayArrow />}
                  onClick={startNext}
                  disabled={!!snap?.activePlayerId}
                  sx={{
                    fontWeight: 900,
                    height: 44,
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    color: COLORS.textPrimary,
                    border: `1px solid rgba(184, 144, 47, 0.20)`,
                    boxShadow: '0 2px 8px rgba(43, 38, 32, 0.05)',
                    '&:hover': {
                      background: COLORS.panelBgStrong,
                      borderColor: 'rgba(184, 144, 47, 0.35)',
                    },
                    '&.Mui-disabled': {
                      background: COLORS.panelBgMuted,
                      color: COLORS.textMuted,
                      borderColor: 'transparent',
                    },
                  }}
                >
                  경매 시작 (다음 순서 선수)
                </Button>
                <Box sx={{ display: 'flex', gap: 1.25 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Block />}
                    onClick={markUnsold}
                    disabled={!snap?.activePlayerId}
                    sx={{
                      fontWeight: 900,
                      height: 40,
                      borderRadius: '8px',
                      background: '#FFFFFF',
                      color: COLORS.danger,
                      border: `1px solid rgba(190, 58, 43, 0.30)`,
                      boxShadow: '0 2px 8px rgba(43, 38, 32, 0.05)',
                      '&:hover': {
                        background: 'rgba(190, 58, 43, 0.08)',
                        borderColor: 'rgba(190, 58, 43, 0.55)',
                      },
                      '&.Mui-disabled': {
                        background: COLORS.panelBgMuted,
                        color: COLORS.textMuted,
                        borderColor: 'transparent',
                      },
                    }}
                  >
                    유찰 처리
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<Check />}
                    onClick={confirmWin}
                    disabled={!snap?.activePlayerId || !snap?.highestBidderTeamId}
                    sx={{
                      fontWeight: 900,
                      height: 40,
                      borderRadius: '8px',
                      background: '#FFFFFF',
                      color: COLORS.success,
                      border: `1px solid rgba(94, 140, 54, 0.30)`,
                      boxShadow: '0 2px 8px rgba(43, 38, 32, 0.05)',
                      '&:hover': {
                        background: 'rgba(94, 140, 54, 0.08)',
                        borderColor: 'rgba(94, 140, 54, 0.55)',
                      },
                      '&.Mui-disabled': {
                        background: COLORS.panelBgMuted,
                        color: COLORS.textMuted,
                        borderColor: 'transparent',
                      },
                    }}
                  >
                    낙찰 확정
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.25 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Casino />}
                    onClick={startDrafting}
                    sx={{
                      fontWeight: 900,
                      height: 36,
                      borderRadius: '8px',
                      borderColor: 'rgba(184, 144, 47, 0.20)',
                      color: COLORS.textPrimary,
                      background: '#FFFFFF',
                      '&:hover': {
                        background: COLORS.panelBgStrong,
                        borderColor: 'rgba(184, 144, 47, 0.40)',
                      },
                    }}
                  >
                    순서 추첨 단계 시작 (DRAFT)
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Refresh />}
                    onClick={resetAll}
                    sx={{
                      fontWeight: 900,
                      height: 36,
                      borderRadius: '8px',
                      borderColor: 'rgba(190, 58, 43, 0.30)',
                      color: COLORS.danger,
                      background: '#FFFFFF',
                      '&:hover': {
                        background: 'rgba(190, 58, 43, 0.08)',
                        borderColor: 'rgba(190, 58, 43, 0.55)',
                      },
                    }}
                  >
                    전체 경매 초기화
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Paper>

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
            <Typography variant="h4" sx={{ fontWeight: 950, color: COLORS.textPrimary, fontFamily: 'Pretendard, sans-serif' }}>
              팀 관리
            </Typography>
            <Typography variant="body2" sx={{ color: COLORS.textMuted, fontFamily: 'Pretendard, sans-serif', fontWeight: 700 }}>
              팀과 팀장 계정을 등록·수정·삭제합니다.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              component={Link}
              href="/auction"
              startIcon={<ArrowBack />}
              variant="outlined"
              sx={{
                fontWeight: 800,
                borderRadius: '8px',
                borderColor: 'rgba(184, 144, 47, 0.20)',
                color: COLORS.textPrimary,
                background: '#FFFFFF',
                '&:hover': { background: COLORS.panelBgStrong, borderColor: 'rgba(184, 144, 47, 0.40)' },
              }}
            >
              경매 화면
            </Button>
            <Button
              onClick={openCreate}
              startIcon={<Add />}
              variant="contained"
              sx={{
                fontWeight: 900,
                borderRadius: '8px',
                background: COLORS.accent,
                color: COLORS.textOnAccent,
                '&:hover': { background: COLORS.accentSoft },
              }}
            >
              팀 추가
            </Button>
          </Box>
        </Box>

        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', background: COLORS.panelBg, borderColor: COLORS.border, boxShadow: COLORS.shadowSoft, mb: 5 }}>
          <Table>
            <TableHead sx={{ backgroundColor: COLORS.panelBgStrong }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, color: COLORS.textMuted, fontFamily: 'Pretendard, sans-serif' }}>팀명</TableCell>
                <TableCell sx={{ fontWeight: 900, color: COLORS.textMuted, fontFamily: 'Pretendard, sans-serif' }}>팀장</TableCell>
                <TableCell sx={{ fontWeight: 900, color: COLORS.textMuted, fontFamily: 'Pretendard, sans-serif' }}>팀장 계정</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, color: COLORS.textMuted, fontFamily: 'Pretendard, sans-serif' }}>시작 P</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, color: COLORS.textMuted, fontFamily: 'Pretendard, sans-serif' }}>잔여 P</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, color: COLORS.textMuted, fontFamily: 'Pretendard, sans-serif' }}>관리</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {teams.map((t) => (
                <TableRow key={t.id} hover sx={{ '&:hover': { backgroundColor: 'rgba(184, 144, 47, 0.03) !important' } }}>
                  <TableCell sx={{ fontWeight: 800, color: COLORS.textPrimary, fontFamily: 'Pretendard, sans-serif' }}>{t.name}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: COLORS.textPrimary, fontFamily: 'Pretendard, sans-serif' }}>{t.leaderName}</TableCell>
                  <TableCell sx={{ color: COLORS.textPrimary, fontFamily: 'Pretendard, sans-serif' }}>{t.leaderAccount?.username ?? '—'}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: COLORS.textPrimary, fontFamily: 'Pretendard, sans-serif' }}>{t.startingPoints}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: COLORS.accent, fontFamily: 'Pretendard, sans-serif' }}>{t.points}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(t)} sx={{ color: COLORS.accent }}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => remove(t.id)} sx={{ color: COLORS.danger }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {teams.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ color: COLORS.textMuted, py: 4, fontFamily: 'Pretendard, sans-serif', fontWeight: 700 }}>
                    등록된 팀이 없습니다.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            mt: 5,
            mb: 3,
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 950, color: COLORS.textPrimary, fontFamily: 'Pretendard, sans-serif' }}>
              선수 관리
            </Typography>
            <Typography variant="body2" sx={{ color: COLORS.textMuted, fontFamily: 'Pretendard, sans-serif', fontWeight: 700 }}>
              선수 이름·프로필 이미지·역할·선호 픽을 편집합니다.
            </Typography>
          </Box>
          <Box>
            <Button
              onClick={openPlayerCreate}
              startIcon={<Add />}
              variant="contained"
              sx={{
                fontWeight: 900,
                borderRadius: '8px',
                background: COLORS.accent,
                color: COLORS.textOnAccent,
                '&:hover': { background: COLORS.accentSoft },
              }}
            >
              선수 추가
            </Button>
          </Box>
        </Box>
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', background: COLORS.panelBg, borderColor: COLORS.border, boxShadow: COLORS.shadowSoft }}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: COLORS.panelBgStrong }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 900, color: COLORS.textMuted, fontFamily: 'Pretendard, sans-serif' }}>순서</TableCell>
                <TableCell sx={{ fontWeight: 900, color: COLORS.textMuted, fontFamily: 'Pretendard, sans-serif' }}>프로필</TableCell>
                <TableCell sx={{ fontWeight: 900, color: COLORS.textMuted, fontFamily: 'Pretendard, sans-serif' }}>이름</TableCell>
                <TableCell sx={{ fontWeight: 900, color: COLORS.textMuted, fontFamily: 'Pretendard, sans-serif' }}>상태</TableCell>
                <TableCell sx={{ fontWeight: 900, color: COLORS.textMuted, fontFamily: 'Pretendard, sans-serif' }}>선호 픽</TableCell>
                <TableCell align="center" sx={{ fontWeight: 900, color: COLORS.textMuted, fontFamily: 'Pretendard, sans-serif' }}>경매</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, color: COLORS.textMuted, fontFamily: 'Pretendard, sans-serif' }}>편집</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {players.map((p) => (
                <TableRow key={p.id} hover sx={{ '&:hover': { backgroundColor: 'rgba(184, 144, 47, 0.03) !important' } }}>
                  <TableCell sx={{ fontWeight: 800, color: COLORS.textMuted, fontFamily: 'Pretendard, sans-serif' }}>
                    {p.order + 1}
                  </TableCell>
                  <TableCell>
                    <Box
                      component="img"
                      src={p.avatarUrl}
                      alt={p.name}
                      sx={{ width: 38, height: 38, borderRadius: 1, objectFit: 'cover', border: `1px solid ${COLORS.borderStrong}` }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: COLORS.textPrimary, fontFamily: 'Pretendard, sans-serif' }}>{p.name}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 1.25,
                        py: 0.4,
                        borderRadius: 1.5,
                        fontSize: '0.68rem',
                        fontWeight: 900,
                        fontFamily: 'Pretendard, sans-serif',
                        backgroundColor:
                          p.status === 'ACTIVE'
                            ? COLORS.highlight
                            : p.status === 'SOLD'
                              ? COLORS.successSoft
                              : p.status === 'UNSOLD'
                                ? COLORS.dangerSoft
                                : COLORS.panelBgStrong,
                        color:
                          p.status === 'ACTIVE'
                            ? COLORS.accent
                            : p.status === 'SOLD'
                              ? COLORS.success
                              : p.status === 'UNSOLD'
                                ? COLORS.danger
                                : COLORS.textMuted,
                      }}
                    >
                      {p.status === 'ACTIVE'
                        ? '경매중'
                        : p.status === 'SOLD'
                          ? '낙찰완료'
                          : p.status === 'UNSOLD'
                            ? '유찰'
                            : '대기중'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.75 }}>
                      {p.mostPicks.slice(0, 3).map((u, i) => (
                        <Box
                          key={i}
                          component="img"
                          src={u}
                          alt=""
                          sx={{ width: 30, height: 30, borderRadius: 0.5, objectFit: 'cover', border: `1px solid ${COLORS.border}` }}
                        />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<PlayArrow />}
                      onClick={() => selectPlayer(p.id)}
                      disabled={p.status === 'SOLD' || snap?.activePlayerId === p.id}
                      sx={{
                        py: 0.35,
                        px: 1.25,
                        fontSize: '0.68rem',
                        fontWeight: 900,
                        borderRadius: '6px',
                        borderColor: 'rgba(184, 144, 47, 0.20)',
                        color: COLORS.textPrimary,
                        background: '#FFFFFF',
                        '&:hover': { background: COLORS.panelBgStrong, borderColor: 'rgba(184, 144, 47, 0.40)' },
                        '&.Mui-disabled': { background: COLORS.panelBgMuted, color: COLORS.textMuted, borderColor: 'transparent' }
                      }}
                    >
                      경매 시작
                    </Button>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openPlayerEdit(p)} sx={{ color: COLORS.accent }}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => removePlayer(p.id)} sx={{ color: COLORS.danger }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Dialog
          open={!!playerForm}
          onClose={() => setPlayerForm(null)}
          fullWidth
          maxWidth="sm"
          sx={{
            '& .MuiDialog-paper': {
              backgroundColor: COLORS.panelBg,
              border: `1px solid rgba(184, 144, 47, 0.18)`,
              borderRadius: '12px',
              boxShadow: COLORS.shadow,
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 900, color: COLORS.textPrimary, borderBottom: `1px solid rgba(184, 144, 47, 0.10)`, pb: 2, fontFamily: 'Pretendard, sans-serif' }}>
            {playerForm?.id ? '선수 편집' : '선수 추가'}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="경매 순서"
                type="number"
                value={playerForm?.order ?? 0}
                onChange={(e) => setPlayerForm((f) => (f ? { ...f, order: Number(e.target.value) } : f))}
                fullWidth
                sx={inputSx}
              />
              <TextField
                label="이름"
                value={playerForm?.name ?? ''}
                onChange={(e) => setPlayerForm((f) => (f ? { ...f, name: e.target.value } : f))}
                fullWidth
                sx={inputSx}
              />
              <TextField
                label="한 줄 소개 (추첨 화면에 표시)"
                value={playerForm?.intro ?? ''}
                onChange={(e) => setPlayerForm((f) => (f ? { ...f, intro: e.target.value } : f))}
                fullWidth
                multiline
                minRows={1}
                maxRows={3}
                placeholder="예: 한타 캐리형 트레이서 장인"
                sx={inputSx}
              />
              <TextField
                select
                label="역할"
                value={playerForm?.role ?? 'TANK'}
                onChange={(e) =>
                  setPlayerForm((f) => (f ? { ...f, role: e.target.value as PlayerRoleEn } : f))
                }
                fullWidth
                sx={inputSx}
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
                sx={inputSx}
              />
              <TextField
                select
                label="선호 픽 1 영웅"
                value={urlToHeroName(playerForm?.pick1 ?? '')}
                onChange={(e) => setPlayerForm((f) => (f ? { ...f, pick1: HERO_IMAGES[e.target.value] ?? e.target.value } : f))}
                fullWidth
                sx={inputSx}
                slotProps={{
                  select: {
                    renderValue: (selected) => {
                      const heroName = selected as string;
                      if (!heroName) {
                        return (
                          <Typography sx={{ fontFamily: 'Pretendard, sans-serif', fontSize: '0.9rem', color: COLORS.textMuted }}>
                            선택 안 됨
                          </Typography>
                        );
                      }
                      const imageUrl = HERO_IMAGES[heroName];
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {imageUrl && (
                            <img
                              src={imageUrl}
                              alt={heroName}
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: 4,
                                objectFit: 'cover',
                                border: '1px solid rgba(184, 144, 47, 0.15)',
                              }}
                            />
                          )}
                          <Typography sx={{ fontFamily: 'Pretendard, sans-serif', fontSize: '0.9rem', color: COLORS.textPrimary, fontWeight: 700 }}>
                            {heroName}
                          </Typography>
                        </Box>
                      );
                    }
                  }
                }}
              >
                <MenuItem value="">
                  <Typography sx={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, color: COLORS.textPrimary }}>
                    없음
                  </Typography>
                </MenuItem>
                {Object.keys(HERO_IMAGES).map((name) => (
                  <MenuItem key={name} value={name}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                      <img
                        src={HERO_IMAGES[name]}
                        alt={name}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 4,
                          objectFit: 'cover',
                          border: '1px solid rgba(184, 144, 47, 0.15)',
                        }}
                      />
                      <Typography sx={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, color: COLORS.textPrimary }}>
                        {name}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="선호 픽 2 영웅"
                value={urlToHeroName(playerForm?.pick2 ?? '')}
                onChange={(e) => setPlayerForm((f) => (f ? { ...f, pick2: HERO_IMAGES[e.target.value] ?? e.target.value } : f))}
                fullWidth
                sx={inputSx}
                slotProps={{
                  select: {
                    renderValue: (selected) => {
                      const heroName = selected as string;
                      if (!heroName) {
                        return (
                          <Typography sx={{ fontFamily: 'Pretendard, sans-serif', fontSize: '0.9rem', color: COLORS.textMuted }}>
                            선택 안 됨
                          </Typography>
                        );
                      }
                      const imageUrl = HERO_IMAGES[heroName];
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {imageUrl && (
                            <img
                              src={imageUrl}
                              alt={heroName}
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: 4,
                                objectFit: 'cover',
                                border: '1px solid rgba(184, 144, 47, 0.15)',
                              }}
                            />
                          )}
                          <Typography sx={{ fontFamily: 'Pretendard, sans-serif', fontSize: '0.9rem', color: COLORS.textPrimary, fontWeight: 700 }}>
                            {heroName}
                          </Typography>
                        </Box>
                      );
                    }
                  }
                }}
              >
                <MenuItem value="">
                  <Typography sx={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, color: COLORS.textPrimary }}>
                    없음
                  </Typography>
                </MenuItem>
                {Object.keys(HERO_IMAGES).map((name) => (
                  <MenuItem key={name} value={name}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                      <img
                        src={HERO_IMAGES[name]}
                        alt={name}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 4,
                          objectFit: 'cover',
                          border: '1px solid rgba(184, 144, 47, 0.15)',
                        }}
                      />
                      <Typography sx={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, color: COLORS.textPrimary }}>
                        {name}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="선호 픽 3 영웅"
                value={urlToHeroName(playerForm?.pick3 ?? '')}
                onChange={(e) => setPlayerForm((f) => (f ? { ...f, pick3: HERO_IMAGES[e.target.value] ?? e.target.value } : f))}
                fullWidth
                sx={inputSx}
                slotProps={{
                  select: {
                    renderValue: (selected) => {
                      const heroName = selected as string;
                      if (!heroName) {
                        return (
                          <Typography sx={{ fontFamily: 'Pretendard, sans-serif', fontSize: '0.9rem', color: COLORS.textMuted }}>
                            선택 안 됨
                          </Typography>
                        );
                      }
                      const imageUrl = HERO_IMAGES[heroName];
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {imageUrl && (
                            <img
                              src={imageUrl}
                              alt={heroName}
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: 4,
                                objectFit: 'cover',
                                border: '1px solid rgba(184, 144, 47, 0.15)',
                              }}
                            />
                          )}
                          <Typography sx={{ fontFamily: 'Pretendard, sans-serif', fontSize: '0.9rem', color: COLORS.textPrimary, fontWeight: 700 }}>
                            {heroName}
                          </Typography>
                        </Box>
                      );
                    }
                  }
                }}
              >
                <MenuItem value="">
                  <Typography sx={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, color: COLORS.textPrimary }}>
                    없음
                  </Typography>
                </MenuItem>
                {Object.keys(HERO_IMAGES).map((name) => (
                  <MenuItem key={name} value={name}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                      <img
                        src={HERO_IMAGES[name]}
                        alt={name}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 4,
                          objectFit: 'cover',
                          border: '1px solid rgba(184, 144, 47, 0.15)',
                        }}
                      />
                      <Typography sx={{ fontFamily: 'Pretendard, sans-serif', fontWeight: 700, color: COLORS.textPrimary }}>
                        {name}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="탱커 최대 티어"
                  value={playerForm?.tankTier ?? ''}
                  onChange={(e) => setPlayerForm((f) => (f ? { ...f, tankTier: e.target.value } : f))}
                  fullWidth
                  sx={inputSx}
                />
                <TextField
                  label="딜러 최대 티어"
                  value={playerForm?.dpsTier ?? ''}
                  onChange={(e) => setPlayerForm((f) => (f ? { ...f, dpsTier: e.target.value } : f))}
                  fullWidth
                  sx={inputSx}
                />
                <TextField
                  label="힐러 최대 티어"
                  value={playerForm?.supportTier ?? ''}
                  onChange={(e) => setPlayerForm((f) => (f ? { ...f, supportTier: e.target.value } : f))}
                  fullWidth
                  sx={inputSx}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setPlayerForm(null)} sx={{ color: COLORS.textMuted, fontWeight: 800 }}>
              취소
            </Button>
            <Button
              onClick={savePlayer}
              variant="contained"
              sx={{
                fontWeight: 900,
                borderRadius: '8px',
                background: COLORS.accent,
                color: COLORS.textOnAccent,
                '&:hover': { background: COLORS.accentSoft },
              }}
            >
              저장
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={!!form}
          onClose={() => setForm(null)}
          fullWidth
          maxWidth="sm"
          sx={{
            '& .MuiDialog-paper': {
              backgroundColor: COLORS.panelBg,
              border: `1px solid rgba(184, 144, 47, 0.18)`,
              borderRadius: '12px',
              boxShadow: COLORS.shadow,
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 900, color: COLORS.textPrimary, borderBottom: `1px solid rgba(184, 144, 47, 0.10)`, pb: 2, fontFamily: 'Pretendard, sans-serif' }}>
            {form?.id ? '팀 수정' : '팀 추가'}
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="팀명"
                value={form?.name ?? ''}
                onChange={(e) => setForm((f) => (f ? { ...f, name: e.target.value } : f))}
                fullWidth
                sx={inputSx}
              />
              <TextField
                label="팀장 이름"
                value={form?.leaderName ?? ''}
                onChange={(e) => setForm((f) => (f ? { ...f, leaderName: e.target.value } : f))}
                fullWidth
                sx={inputSx}
              />
              <TextField
                label="아바타 이미지 URL"
                value={form?.avatarUrl ?? ''}
                onChange={(e) => setForm((f) => (f ? { ...f, avatarUrl: e.target.value } : f))}
                fullWidth
                sx={inputSx}
              />
              <TextField
                label="시작 포인트"
                type="number"
                value={form?.startingPoints ?? 1000}
                onChange={(e) => setForm((f) => (f ? { ...f, startingPoints: Number(e.target.value) } : f))}
                fullWidth
                sx={inputSx}
              />
              {form?.id === null && (
                <TextField
                  label="팀장 로그인 아이디"
                  value={form?.leaderUsername ?? ''}
                  onChange={(e) => setForm((f) => (f ? { ...f, leaderUsername: e.target.value } : f))}
                  fullWidth
                  sx={inputSx}
                />
              )}
              <TextField
                label={form?.id ? '팀장 비밀번호 (변경 시에만 입력)' : '팀장 비밀번호'}
                type="password"
                value={form?.leaderPassword ?? ''}
                onChange={(e) => setForm((f) => (f ? { ...f, leaderPassword: e.target.value } : f))}
                fullWidth
                sx={inputSx}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setForm(null)} sx={{ color: COLORS.textMuted, fontWeight: 800 }}>
              취소
            </Button>
            <Button
              onClick={save}
              variant="contained"
              sx={{
                fontWeight: 900,
                borderRadius: '8px',
                background: COLORS.accent,
                color: COLORS.textOnAccent,
                '&:hover': { background: COLORS.accentSoft },
              }}
            >
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
          <Alert severity="warning" variant="filled" onClose={() => setToast(null)} sx={{ borderRadius: 2 }}>
            {toast}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
