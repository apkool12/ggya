import type { Metadata } from 'next';
import Link from 'next/link';
import { INITIAL_PLAYERS, INITIAL_TEAMS } from '@/auction/data';
import s from './intro.module.css';

export const metadata: Metadata = {
  title: 'GGya — 컴퓨터공학과 오버워치 경매',
  description: '스무 명의 선수, 다섯 개의 팀, 천 포인트. 컴퓨터공학과 오버워치 드래프트 경매.',
};

const pad = (n: number) => String(n).padStart(2, '0');

function Tier({ label, value }: { label: string; value: string }) {
  const unranked = value === '언랭크';
  return (
    <div className={s.tier}>
      <p className={`${s.microCaps} ${s.tierK}`}>{label}</p>
      <p className={`${s.tierV} ${unranked ? s.tierUnranked : ''}`}>{value}</p>
    </div>
  );
}

export default function LandingPage() {
  const teams = INITIAL_TEAMS;
  const players = INITIAL_PLAYERS;

  return (
    <div className={s.page}>
      {/* nav */}
      <header className={s.nav}>
        <div className={`${s.container} ${s.navInner}`}>
          <Link href="/" className={s.wordmark}>GGya</Link>
          <nav className={s.navMenu}>
            <a className={s.navLink} href="#programme">진행</a>
            <a className={s.navLink} href="#houses">팀</a>
            <a className={s.navLink} href="#catalogue">출품 선수</a>
          </nav>
          <div className={s.navRight}>
            <Link href="/auction" className={`${s.pill} ${s.pillLight} ${s.navPill}`}>경매 입장</Link>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className={s.hero}>
        <div className={`${s.container} ${s.heroInner}`}>
          <p className={`${s.eyebrow} ${s.heroEyebrow}`}>GGya · 컴퓨터공학과 오버워치 경매</p>
          <h1 className={`${s.display} ${s.heroTitle}`}>
            선수 스무 명, 팀은 다섯.
          </h1>
          <p className={`${s.subtitle} ${s.heroSub}`}>
            한 명씩 호명하면 팀들이 포인트로 값을 부릅니다. 제일 세게 지른 팀이 데려가요.
            다들 천 포인트로 출발합니다.
          </p>
          <div className={s.heroActions}>
            <Link href="/auction" className={`${s.pill} ${s.pillDark}`}>경매 입장</Link>
            <a className={s.navLink} href="#programme" style={{ color: 'rgba(255,255,255,0.78)' }}>
              진행 방식 보기 ↓
            </a>
          </div>
          <div className={s.heroMeta}>
            <div className={s.heroMetaItem}>
              <span className={`${s.microCaps} ${s.heroMetaK}`}>출품 선수</span>
              <span className={s.heroMetaV}>{players.length}</span>
            </div>
            <div className={s.heroMetaItem}>
              <span className={`${s.microCaps} ${s.heroMetaK}`}>참가 팀</span>
              <span className={s.heroMetaV}>{teams.length}</span>
            </div>
            <div className={s.heroMetaItem}>
              <span className={`${s.microCaps} ${s.heroMetaK}`}>시작 포인트</span>
              <span className={s.heroMetaV}>1,000P</span>
            </div>
          </div>
        </div>
      </section>

      {/* programme / process */}
      <section id="programme" className={`${s.container} ${s.section}`}>
        <div className={s.opener}>
          <p className={`${s.eyebrow} ${s.openerEyebrow}`}>Programme · 진행</p>
          <h2 className={`${s.headingMd} ${s.openerTitle}`}>딱 세 단계면 돼요</h2>
          <p className={`${s.body} ${s.openerLead}`}>
            선수 한 명마다 이 순서가 반복돼요.
            팀장은 천 포인트로 다섯 명만 채우면 끝.
          </p>
        </div>
        <div className={s.steps}>
          <div className={s.step}>
            <p className={`${s.meta} ${s.stepNo}`}>01</p>
            <h3 className={`${s.headingSm} ${s.stepTitle}`}>호명</h3>
            <p className={`${s.body} ${s.stepBody}`}>
              선수가 한 명씩 올라와요. 순서는 추첨으로 정합니다.
            </p>
          </div>
          <div className={s.step}>
            <p className={`${s.meta} ${s.stepNo}`}>02</p>
            <h3 className={`${s.headingSm} ${s.stepTitle}`}>입찰</h3>
            <p className={`${s.body} ${s.stepBody}`}>
              다섯 팀이 포인트로 값을 질러요. 더 높이 부를 때마다 시간이 다시 흐릅니다.
            </p>
          </div>
          <div className={s.step}>
            <p className={`${s.meta} ${s.stepNo}`}>03</p>
            <h3 className={`${s.headingSm} ${s.stepTitle}`}>낙찰</h3>
            <p className={`${s.body} ${s.stepBody}`}>
              시간이 멈추면 제일 높이 부른 팀이 선수를 데려가요. 부른 만큼 포인트가 빠지고요.
            </p>
          </div>
        </div>
      </section>

      {/* houses / teams */}
      <section id="houses" className={`${s.container} ${s.section}`}>
        <div className={s.opener}>
          <p className={`${s.eyebrow} ${s.openerEyebrow}`}>Teams · 다섯 팀</p>
          <h2 className={`${s.headingMd} ${s.openerTitle}`}>팀장은 다섯 명</h2>
          <p className={`${s.body} ${s.openerLead}`}>
            다섯 팀 모두 천 포인트로 똑같이 시작해요. 누구를, 얼마에 데려가느냐 — 승부는 거기서 갈립니다.
          </p>
        </div>
        <div>
          {teams.map((t, i) => (
            <div key={t.id} className={s.teamRow}>
              <span className={s.lotNo}>{pad(i + 1)}</span>
              <div>
                <p className={`${s.headingSm} ${s.teamName}`}>{t.name}</p>
                <p className={`${s.body} ${s.teamLeader}`}>팀장 · {t.leader}</p>
              </div>
              <span className={`${s.body} ${s.teamPts}`}>1,000P</span>
            </div>
          ))}
        </div>
      </section>

      {/* catalogue / lots */}
      <section id="catalogue" className={`${s.container} ${s.section}`}>
        <div className={s.opener}>
          <p className={`${s.eyebrow} ${s.openerEyebrow}`}>Catalogue · 출품 선수</p>
          <h2 className={`${s.headingMd} ${s.openerTitle}`}>오늘 나오는 선수들</h2>
          <p className={`${s.body} ${s.openerLead}`}>
            {players.length}명이 차례를 기다려요. 실력은 포지션 티어로만 적었어요 — 탱·딜·힐.
          </p>
        </div>

        <div className={s.catHead}>
          <span className={s.microCaps}>Lot</span>
          <span className={s.microCaps}>선수</span>
          <span className={s.microCaps} style={{ textAlign: 'right' }}>탱 · 딜 · 힐 티어</span>
        </div>
        {players.map((p, i) => (
          <div key={p.id} className={s.lot}>
            <span className={s.lotNo}>{pad(i + 1)}</span>
            <p className={`${s.headingSm} ${s.lotName}`}>{p.name}</p>
            <div className={s.lotTiers}>
              <Tier label="탱" value={p.tankTier} />
              <Tier label="딜" value={p.dpsTier} />
              <Tier label="힐" value={p.supportTier} />
            </div>
          </div>
        ))}
      </section>

      {/* closing cta */}
      <section className={s.cta}>
        <div className={`${s.container} ${s.ctaInner}`}>
          <div>
            <p className={`${s.eyebrow} ${s.heroEyebrow}`}>경매장</p>
            <h2 className={`${s.display} ${s.ctaTitle}`} style={{ marginTop: 18 }}>
              그럼, 들어가 볼까요.
            </h2>
            <p className={`${s.subtitle} ${s.ctaSub}`}>
              팀장석에서 질러도 좋고, 관중석에서 구경만 해도 좋고.
            </p>
          </div>
          <Link href="/auction" className={`${s.pill} ${s.pillDark}`}>경매 입장</Link>
        </div>
      </section>

      {/* footer */}
      <footer className={s.footer}>
        <div className={`${s.container} ${s.footerInner}`}>
          <div className={s.footerCols}>
            <div>
              <p className={s.footerWord}>GGya</p>
              <p className={`${s.bodyTight} ${s.footerBlurb}`}>
                컴퓨터공학과 오버워치 드래프트 경매. 스무 명의 선수, 다섯 개의 팀, 천 포인트.
              </p>
            </div>
            <div>
              <p className={`${s.microCaps} ${s.footerHead}`}>진행</p>
              <ul className={s.footerList}>
                <li><a className={s.footerLink} href="#programme">진행 방식</a></li>
                <li><a className={s.footerLink} href="#houses">팀</a></li>
                <li><a className={s.footerLink} href="#catalogue">출품 선수</a></li>
              </ul>
            </div>
            <div>
              <p className={`${s.microCaps} ${s.footerHead}`}>경매</p>
              <ul className={s.footerList}>
                <li><Link className={s.footerLink} href="/auction">경매 입장</Link></li>
                <li><Link className={s.footerLink} href="/login">로그인</Link></li>
              </ul>
            </div>
            <div>
              <p className={`${s.microCaps} ${s.footerHead}`}>정보</p>
              <ul className={s.footerList}>
                <li><span className={s.footerLink}>1,000P 시작</span></li>
                <li><span className={s.footerLink}>5팀 · {players.length}선수</span></li>
              </ul>
            </div>
          </div>
          <div className={s.footerBar}>
            <span className={s.footerWord} style={{ fontSize: 16 }}>GGya</span>
            <span className={`${s.meta} ${s.footerLegal}`}>© 2026 GGya · 컴퓨터공학과 오버워치 경매</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
