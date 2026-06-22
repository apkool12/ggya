-- AuctionPhase enum 에 DRAFTING 값 추가 (init 마이그레이션 이후 스키마에 추가됨)
ALTER TYPE "AuctionPhase" ADD VALUE IF NOT EXISTS 'DRAFTING';

-- Player 에 포지션별 티어 컬럼 추가 (init 이후 db push 로만 반영되어 운영 DB에 누락)
ALTER TABLE "Player" ADD COLUMN IF NOT EXISTS "tankTier" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Player" ADD COLUMN IF NOT EXISTS "dpsTier" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Player" ADD COLUMN IF NOT EXISTS "supportTier" TEXT NOT NULL DEFAULT '';
