-- CreateTable
CREATE TABLE "TournamentTeam" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "tournamentName" TEXT NOT NULL,
    "tournamentDate" TIMESTAMP(3) NOT NULL,
    "format" TEXT NOT NULL,
    "playerName" TEXT NOT NULL,
    "playerHandle" TEXT NOT NULL,
    "country" TEXT,
    "placing" INTEGER,
    "species" TEXT[],
    "roster" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentTeam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TournamentTeam_sourceId_playerHandle_key" ON "TournamentTeam"("sourceId", "playerHandle");
