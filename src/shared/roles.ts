export type PlayerRoleEn = 'TANK' | 'DPS' | 'SUPPORT';
export type PlayerRoleKo = '탱커' | '딜러' | '힐러';

const EN_TO_KO: Record<PlayerRoleEn, PlayerRoleKo> = {
  TANK: '탱커',
  DPS: '딜러',
  SUPPORT: '힐러',
};
const KO_TO_EN: Record<PlayerRoleKo, PlayerRoleEn> = {
  탱커: 'TANK',
  딜러: 'DPS',
  힐러: 'SUPPORT',
};

export const SLOT_INDEXES: Record<PlayerRoleEn, number[]> = {
  TANK: [0],
  DPS: [1, 2],
  SUPPORT: [3, 4],
};

export const roleToKo = (r: PlayerRoleEn): PlayerRoleKo => EN_TO_KO[r];
export const koToRole = (r: PlayerRoleKo): PlayerRoleEn => KO_TO_EN[r];
