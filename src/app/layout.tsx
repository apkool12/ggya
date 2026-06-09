import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: '자낳대 e스포츠 경매 시뮬레이터 (Esports Auction)',
  description: '프리미엄 하이퍼 리얼 e-스포츠 경매 대시보드',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="h-full antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
