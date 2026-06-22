import { ROSTER_SIZE, STARTING_POINTS } from "./constants";
import type { ChatMessage, Player, Team } from "./types";

const makeEmptyRoster = (): (Player | null)[] =>
  Array.from({ length: ROSTER_SIZE }, () => null);

const team = (
  id: string,
  name: string,
  leader: string,
  avatar: string,
): Team => ({
  id,
  name,
  leader,
  avatar,
  points: STARTING_POINTS,
  roster: makeEmptyRoster(),
});

// 주 포지션(role)은 더 이상 쓰지 않음 — 방송 화면에 표시되지 않고,
// 능력은 탱/딜/힐 티어로만 표현한다. 스키마 호환을 위해 내부 기본값만 채운다.
const player = (
  id: string,
  name: string,
  avatar: string,
  tankTier = "",
  dpsTier = "",
  supportTier = "",
  intro = "",
): Player => ({
  id,
  name,
  role: "딜러",
  avatar,
  status: "대기중",
  order: 0,
  tankTier,
  dpsTier,
  supportTier,
  intro,
});

// 팀장 5명 = 입찰 주체(경매 대상 선수 목록에는 포함하지 않음). 아바타는 어드민에서 추가.
export const INITIAL_TEAMS: Team[] = [
  team("1", "TEAM 이풍은", "이풍은", ""),
  team("2", "TEAM 오하진", "오하진", ""),
  team("3", "TEAM 이혁준", "이혁준", ""),
  team("4", "TEAM 노도원", "노도원", ""),
  team("5", "TEAM 이대한", "이대한", ""),
];

const OW = {
  // 탱커
  dva: "https://d15f34w2p8l1cc.cloudfront.net/overwatch/df5a5532862d9292634fb3dc0e51a4705aa601de65e5e815513ccc663d84de56.png",
  reinhardt:
    "https://d15f34w2p8l1cc.cloudfront.net/overwatch/551fbe070c16fdfcc17f7f1de63af22c53e7d2f1340fc2f3172441504527bc4e.png",
  winston:
    "https://d15f34w2p8l1cc.cloudfront.net/overwatch/46a10db3aa908c590ddc4e7606376a88143d1f1306ecfbea043263040f9529a5.png",
  roadhog:
    "https://d15f34w2p8l1cc.cloudfront.net/overwatch/89ddf07e4b619ed96169042e296a1b8856d102746f35add88284b44a9a5a6a03.png",
  zarya:
    "https://d15f34w2p8l1cc.cloudfront.net/overwatch/9b6f63cc66ddf9d5e0862173c733cc0d2e574c5c89357798d91b93b2f95a7080.png",
  orisa:
    "https://d15f34w2p8l1cc.cloudfront.net/overwatch/a73958a28551f5254f3ab3f97c5f5f8d698a95c0b6a515d1a2b1caac169205a6.png",
  sigma:
    "https://d15f34w2p8l1cc.cloudfront.net/overwatch/a4c032fa466c9a6d9c6974747635d7ef910027f91cd58892af0c899db565f92d.png",
  wreckingBall:
    "https://d15f34w2p8l1cc.cloudfront.net/overwatch/9ef1d58867136e0b26f928d896000b9dab216118f6e2f59e53f2e975e1e27afa.png",
  ramattra:
    "https://static.wikia.nocookie.net/overwatch_gamepedia/images/6/6f/Icon-Ramattra.png",
  junkerQueen:
    "https://static.wikia.nocookie.net/overwatch_gamepedia/images/2/2b/Icon-Junker_Queen.png",
  mauga:
    "https://static.wikia.nocookie.net/overwatch_gamepedia/images/3/39/Icon-Mauga.png",
  doomfist:
    "https://static.wikia.nocookie.net/overwatch_gamepedia/images/a/a1/Icon-Doomfist.png",
  hazard:
    "https://static.wikia.nocookie.net/overwatch_gamepedia/images/5/54/Icon-Hazard.png",
  domina:
    "https://static.wikia.nocookie.net/overwatch_gamepedia/images/7/76/Icon-Domina.png",
  // 딜러
  genji:
    "https://d15f34w2p8l1cc.cloudfront.net/overwatch/156b12c20b1aea872c1eeb5bb37a7de1047b2ab30ecefd0663a8925badde1ea8.png",
  tracer:
    "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4504f6f15cb3feaa92ecd38e01dcf751cb5abdac2e0bb52d0555727e53277502.png",
  reaper:
    "https://d15f34w2p8l1cc.cloudfront.net/overwatch/dc6ff07ac790c00dc95a40882449617bb6e0e38906b353a630cffe0c815270a9.png",
  soldier76:
    "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c93b5f0a528c40473188f77cc2a267aee7d5b6cf5c9e104105d634b4388674e2.png",
  hanzo:
    "https://d15f34w2p8l1cc.cloudfront.net/overwatch/78b61c3e806fb26b02b8980fba62189155074fc15bd865b0883268e546030be5.png",
  widowmaker:
    "https://d15f34w2p8l1cc.cloudfront.net/overwatch/6e4702b45f196aaf51555cf57327322721f45458b17f5f0643ed008a88378259.png",
  sojourn:
    "https://d15f34w2p8l1cc.cloudfront.net/overwatch/82b8c1b8765dcb9a0ba16e343c3516bf324c771ac81e9878473280216e70a889.png",
  ashe: "https://d15f34w2p8l1cc.cloudfront.net/overwatch/4076bbaa2eb52a0bfe612434071e56e7702d5454473dbbea2f9e392a9d997a94.png",
  venture:
    "https://static.wikia.nocookie.net/overwatch_gamepedia/images/a/a0/Icon-Venture.png",
  anran:
    "https://static.wikia.nocookie.net/overwatch_gamepedia/images/0/07/Icon-Anran.png",
  bastion:
    "https://static.wikia.nocookie.net/overwatch_gamepedia/images/5/51/Icon-Bastion.png",
  cassidy:
    "https://static.wikia.nocookie.net/overwatch_gamepedia/images/0/05/Icon-Cassidy.png",
  echo: "https://static.wikia.nocookie.net/overwatch_gamepedia/images/d/d6/Icon-Echo.png",
  junkrat:
    "https://static.wikia.nocookie.net/overwatch_gamepedia/images/9/99/Icon-Junkrat.png",
  mei: "https://static.wikia.nocookie.net/overwatch_gamepedia/images/9/99/Icon-Mei.png",
  pharah:
    "https://static.wikia.nocookie.net/overwatch_gamepedia/images/2/29/Icon-Pharah.png",
  sombra:
    "https://static.wikia.nocookie.net/overwatch_gamepedia/images/7/70/Icon-Sombra.png",
  symmetra:
    "https://static.wikia.nocookie.net/overwatch_gamepedia/images/0/06/Icon-Symmetra.png",
  torbjorn:
    "https://static.wikia.nocookie.net/overwatch_gamepedia/images/c/ca/Icon-Torbj%C3%B6rn.png",
  emre: "https://static.wikia.nocookie.net/overwatch_gamepedia/images/3/34/Icon-Emre.png",
  freja:
    "https://static.wikia.nocookie.net/overwatch_gamepedia/images/0/04/Icon-Freja.png",
  sierra:
    "https://static.wikia.nocookie.net/overwatch_gamepedia/images/3/32/Icon-Sierra.png",
  vendetta:
    "https://static.wikia.nocookie.net/overwatch_gamepedia/images/d/dd/Icon-Vendetta.png",
  shion:
    "https://static.wikia.nocookie.net/overwatch_gamepedia/images/7/74/Icon-Shion.png",
  // 힐러
  ana: "https://d15f34w2p8l1cc.cloudfront.net/overwatch/985b06beae46b7ba3ca87d1512d0fc62ca7f206ceca58ef16fc44d43a1cc84ed.png",
  mercy:
    "https://d15f34w2p8l1cc.cloudfront.net/overwatch/3bfb8bd8ec827e53d870f1238ab73d8aa1f5dbfbcfaaf7f96ffcd35b5c6102ab.png",
  moira:
    "https://d15f34w2p8l1cc.cloudfront.net/overwatch/f48f8485056d5d00dad195859188d23e50f7126b8b08b5646f46ef1b42f5e1de.png",
  brigitte:
    "https://d15f34w2p8l1cc.cloudfront.net/overwatch/795fba91376d87d441a7f359ae12a3175dfa95825ccc4414cc6b95b129fc4cb0.png",
  lucio:
    "https://d15f34w2p8l1cc.cloudfront.net/overwatch/040bb13f5123ab93faad2f95627ba184608aef4b2469a4d3003859c7087df044.png",
  kiriko:
    "https://d15f34w2p8l1cc.cloudfront.net/overwatch/408603fe037e8576078eaac5eab2fb251489ced4003b11f5f522776d43d0b83d.png",
  baptiste:
    "https://d15f34w2p8l1cc.cloudfront.net/overwatch/d4e6f1ca45d9f88fa89260787397f141a6f007b14e5b26698883b6a17bab9680.png",
  illari:
    "https://d15f34w2p8l1cc.cloudfront.net/overwatch/ce42d1455e03e79f321345fea84b27a8918b5db8bd7ab9b2ca9e569606ede9e4.png",
  juno: "https://d15f34w2p8l1cc.cloudfront.net/overwatch/c0167d251e57b0aa2b1e16c37d87f0e7c77263db9dd0503d77b5f2589bf3e4a0.png",
  lifeweaver:
    "https://static.wikia.nocookie.net/overwatch_gamepedia/images/8/86/Icon-Lifeweaver.png",
  jetpackCat:
    "https://static.wikia.nocookie.net/overwatch_gamepedia/images/1/12/Icon-Jetpack_Cat.png",
  mizuki:
    "https://static.wikia.nocookie.net/overwatch_gamepedia/images/3/36/Icon-Mizuki.png",
  wuyang:
    "https://static.wikia.nocookie.net/overwatch_gamepedia/images/6/6c/Icon-Wuyang.png",
  zenyatta:
    "https://static.wikia.nocookie.net/overwatch_gamepedia/images/f/f7/Icon-Zenyatta.png",
} as const;

/**
 * 각 선수가 자주 픽하는 영웅 3명. (player.id -> 오버워치 영웅 portrait URL[])
 * Player 타입을 건드리지 않기 위해 별도 맵으로 관리. localStorage 마이그레이션 불필요.
 */
export const PLAYER_MOST_PICKS: Record<string, readonly string[]> = {
  // 힐러
  p1: [OW.ana, OW.kiriko, OW.mercy], // 순당무
  p5: [OW.moira, OW.brigitte, OW.lucio], // 꼴랑이
  p6: [OW.mercy, OW.ana, OW.baptiste], // 혜지
  p11: [OW.illari, OW.juno, OW.kiriko], // 라공
  // 탱커
  p2: [OW.dva, OW.reinhardt, OW.winston], // 인간젤리
  p3: [OW.orisa, OW.roadhog, OW.sigma], // 인섹
  p9: [OW.zarya, OW.reinhardt, OW.wreckingBall], // 플레임
  p13: [OW.dva, OW.winston, OW.sigma], // 푸린
  p14: [OW.roadhog, OW.orisa, OW.reinhardt], // 소우릎
  // 딜러
  p4: [OW.tracer, OW.sojourn, OW.soldier76], // 박나나
  p7: [OW.genji, OW.hanzo, OW.ashe], // 엠비션
  p8: [OW.widowmaker, OW.hanzo, OW.ashe], // 실프
  p10: [OW.tracer, OW.genji, OW.reaper], // 던
  p12: [OW.soldier76, OW.sojourn, OW.reaper], // 뽀융짱
};

// 실제 참가자 명단. 주 포지션은 사용하지 않음 — 능력은 탱/딜/힐 티어로만 표현.
// 아바타는 비워둠(어드민에서 추가). 티어 표기: 다이아몬드 > 플래티넘 > 골드 > 실버 > 언랭크.
export const INITIAL_PLAYERS: Player[] = [
  player("r1", "조문성", "", "언랭크", "언랭크", "언랭크"),
  player("r3", "염수민", "", "다이아몬드", "다이아몬드", "다이아몬드"),
  player("r4", "윤상열", "", "언랭크", "언랭크", "언랭크"),
  player("r7", "김도형", "", "골드", "플래티넘", "골드"),
  player("r8", "이은혁", "", "플래티넘", "플래티넘", "다이아몬드"),
  player("r9", "조원희", "", "언랭크", "언랭크", "언랭크"),
  player("r10", "김태원", "", "플래티넘", "플래티넘", "플래티넘"),
  player("r11", "조성웅", "", "플래티넘", "플래티넘", "플래티넘"),
  player("r12", "전희준", "", "언랭크", "언랭크", "다이아몬드"),
  player("r13", "김영훈", "", "플래티넘", "플래티넘", "다이아몬드"),
  player("r14", "이충호", "", "언랭크", "언랭크", "언랭크"),
  player("r15", "우은식", "", "플래티넘", "플래티넘", "다이아몬드"),
  player("r16", "이수민", "", "골드", "골드", "골드"),
  player("r17", "이시우", "", "실버", "언랭크", "언랭크"),
  player("r19", "정민성", "", "언랭크", "언랭크", "실버"),
  player("r21", "정택준", "", "언랭크", "언랭크", "언랭크"),
  player("r22", "박초희", "", "언랭크", "언랭크", "언랭크"),
  player("r23", "최한민", "", "언랭크", "언랭크", "언랭크"),
  player("r24", "정구영", "", "플래티넘", "플래티넘", "플래티넘"),
  player("r25", "김해준", "", "골드", "골드", "골드"),
];

export const shuffleInPlace = <T>(input: readonly T[]): T[] => {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
