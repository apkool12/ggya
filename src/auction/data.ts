import { ROSTER_SIZE, STARTING_POINTS } from './constants';
import type { ChatMessage, Player, Team } from './types';

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

const player = (
  id: string,
  name: string,
  role: Player['role'],
  avatar: string,
): Player => ({ id, name, role, avatar, status: '대기중' });

export const INITIAL_TEAMS: Team[] = [
  team(
    '1',
    'TEAM 따효니',
    '따효니',
    'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=60',
  ),
  team(
    '2',
    'TEAM 러너',
    '러너',
    'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=150&auto=format&fit=crop&q=60',
  ),
  team(
    '3',
    'TEAM 소풍왔니',
    '소풍왔니',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60',
  ),
  team(
    '4',
    'TEAM 플러리',
    '플러리',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60',
  ),
];

const OW = {
  // 탱커
  dva: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/df5a5532862d9292634fb3dc0e51a4705aa601de65e5e815513ccc663d84de56.png',
  reinhardt: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/551fbe070c16fdfcc17f7f1de63af22c53e7d2f1340fc2f3172441504527bc4e.png',
  winston: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/46a10db3aa908c590ddc4e7606376a88143d1f1306ecfbea043263040f9529a5.png',
  roadhog: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/89ddf07e4b619ed96169042e296a1b8856d102746f35add88284b44a9a5a6a03.png',
  zarya: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/9b6f63cc66ddf9d5e0862173c733cc0d2e574c5c89357798d91b93b2f95a7080.png',
  orisa: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/a73958a28551f5254f3ab3f97c5f5f8d698a95c0b6a515d1a2b1caac169205a6.png',
  sigma: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/a4c032fa466c9a6d9c6974747635d7ef910027f91cd58892af0c899db565f92d.png',
  wreckingBall: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/9ef1d58867136e0b26f928d896000b9dab216118f6e2f59e53f2e975e1e27afa.png',
  // 딜러
  genji: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/156b12c20b1aea872c1eeb5bb37a7de1047b2ab30ecefd0663a8925badde1ea8.png',
  tracer: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/4504f6f15cb3feaa92ecd38e01dcf751cb5abdac2e0bb52d0555727e53277502.png',
  reaper: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/dc6ff07ac790c00dc95a40882449617bb6e0e38906b353a630cffe0c815270a9.png',
  soldier76: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/c93b5f0a528c40473188f77cc2a267aee7d5b6cf5c9e104105d634b4388674e2.png',
  hanzo: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/78b61c3e806fb26b02b8980fba62189155074fc15bd865b0883268e546030be5.png',
  widowmaker: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/6e4702b45f196aaf51555cf57327322721f45458b17f5f0643ed008a88378259.png',
  sojourn: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/82b8c1b8765dcb9a0ba16e343c3516bf324c771ac81e9878473280216e70a889.png',
  ashe: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/4076bbaa2eb52a0bfe612434071e56e7702d5454473dbbea2f9e392a9d997a94.png',
  // 힐러
  ana: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/985b06beae46b7ba3ca87d1512d0fc62ca7f206ceca58ef16fc44d43a1cc84ed.png',
  mercy: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/3bfb8bd8ec827e53d870f1238ab73d8aa1f5dbfbcfaaf7f96ffcd35b5c6102ab.png',
  moira: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/f48f8485056d5d00dad195859188d23e50f7126b8b08b5646f46ef1b42f5e1de.png',
  brigitte: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/795fba91376d87d441a7f359ae12a3175dfa95825ccc4414cc6b95b129fc4cb0.png',
  lucio: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/040bb13f5123ab93faad2f95627ba184608aef4b2469a4d3003859c7087df044.png',
  kiriko: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/408603fe037e8576078eaac5eab2fb251489ced4003b11f5f522776d43d0b83d.png',
  baptiste: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/d4e6f1ca45d9f88fa89260787397f141a6f007b14e5b26698883b6a17bab9680.png',
  illari: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/ce42d1455e03e79f321345fea84b27a8918b5db8bd7ab9b2ca9e569606ede9e4.png',
  juno: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/c0167d251e57b0aa2b1e16c37d87f0e7c77263db9dd0503d77b5f2589bf3e4a0.png',
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

export const INITIAL_PLAYERS: Player[] = [
  player('p1', '순당무', '힐러', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60'),
  player('p2', '인간젤리', '탱커', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60'),
  player('p3', '인섹', '탱커', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=60'),
  player('p4', '박나나', '딜러', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=60'),
  player('p5', '꼴랑이', '힐러', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=60'),
  player('p6', '혜지', '힐러', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=60'),
  player('p7', '엠비션', '딜러', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=60'),
  player('p8', '실프', '딜러', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60'),
  player('p9', '플레임', '탱커', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=60'),
  player('p10', '던', '딜러', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=60'),
  player('p11', '라공', '힐러', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=60'),
  player('p12', '뽀융짱', '딜러', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=60'),
  player('p13', '푸린', '탱커', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=60'),
  player('p14', '소우릎', '탱커', 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=60'),
];

export const INITIAL_CHAT: ChatMessage[] = [
  { sender: '아무튼옥냥이', message: '앞에서 P 좀 빼놔야 할텐데', color: '#ff5252' },
  { sender: '빠밤빠', message: '아꼈다 실프부터 먹어도 좋을듯', color: '#ffb74d' },
  { sender: '부활한 고인물 741', message: '근데 소풍왔니가 1000P면 어케임...', color: '#4fc3f7' },
];

export const CHAT_TEMPLATES: ChatMessage[] = [
  { sender: '네클릿짱', message: '오 순당무 힐러진 든든하네요', color: '#b39ddb' },
  { sender: '자낳대원년멤버', message: '이번 매물 진짜 치열할듯', color: '#81c784' },
  { sender: '치직치직', message: '러너팀 엠비션 먹으면 딜러진 끝남', color: '#e0e0e0' },
  { sender: '포인트부자', message: '1000P 다 박아도 인정이죠', color: '#ff8a80' },
  { sender: 'LckFan', message: '따효니 벌써 입찰 대기중이네', color: '#ffd54f' },
  { sender: '롤선생', message: '딜러 박나나 가성비 좋은데?', color: '#4db6ac' },
  { sender: '방구석분석가', message: '플러리 벌써 입찰 고민중', color: '#ea80fc' },
  { sender: '고수림', message: '유찰순서 잘 봐라 머리 아플거다', color: '#ffb74d' },
];

export const shuffleInPlace = <T,>(input: readonly T[]): T[] => {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
