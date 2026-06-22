-- Player 에 한 줄 소개(intro) 컬럼 추가
ALTER TABLE "Player" ADD COLUMN IF NOT EXISTS "intro" TEXT NOT NULL DEFAULT '';
