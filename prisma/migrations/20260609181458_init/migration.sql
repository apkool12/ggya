-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'LEADER');

-- CreateEnum
CREATE TYPE "PlayerRole" AS ENUM ('TANK', 'DPS', 'SUPPORT');

-- CreateEnum
CREATE TYPE "PlayerStatus" AS ENUM ('WAITING', 'ACTIVE', 'SOLD', 'UNSOLD');

-- CreateEnum
CREATE TYPE "AuctionPhase" AS ENUM ('IDLE', 'BIDDING', 'AWAITING_CONFIRM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "teamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "leaderName" TEXT NOT NULL,
    "avatarUrl" TEXT NOT NULL,
    "startingPoints" INTEGER NOT NULL DEFAULT 1000,
    "points" INTEGER NOT NULL DEFAULT 1000,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "PlayerRole" NOT NULL,
    "avatarUrl" TEXT NOT NULL,
    "status" "PlayerStatus" NOT NULL DEFAULT 'WAITING',
    "cost" INTEGER,
    "teamId" TEXT,
    "slotIndex" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "mostPicks" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuctionState" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "phase" "AuctionPhase" NOT NULL DEFAULT 'IDLE',
    "activePlayerId" TEXT,
    "currentBid" INTEGER NOT NULL DEFAULT 0,
    "highestBidderTeamId" TEXT,
    "bidDeadline" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuctionState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogEntry" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_teamId_key" ON "User"("teamId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
