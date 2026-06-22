import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // discord.js는 Node 전용 라이브러리라 번들하지 않고 런타임 require로 불러온다.
  // (optional native 의존성 zlib-sync 등이 빌드 타임에 해석 실패하는 문제 방지)
  serverExternalPackages: ["discord.js"],
};

export default nextConfig;
