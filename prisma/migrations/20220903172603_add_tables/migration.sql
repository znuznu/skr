-- CreateTable
CREATE TABLE "Pokemon" (
    "id" TEXT NOT NULL,
    "dexId" INTEGER NOT NULL,
    "types" TEXT[],
    "enName" TEXT NOT NULL,
    "jpName" TEXT,
    "artworkUrl" TEXT,
    "spriteUrl" TEXT,

    CONSTRAINT "Pokemon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoteCount" (
    "id" TEXT NOT NULL,
    "storeCount" INTEGER NOT NULL DEFAULT 0,
    "keepCount" INTEGER NOT NULL DEFAULT 0,
    "releaseCount" INTEGER NOT NULL DEFAULT 0,
    "pokemonId" TEXT NOT NULL,

    CONSTRAINT "VoteCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "storeId" TEXT NOT NULL,
    "keepId" TEXT NOT NULL,
    "releaseId" TEXT NOT NULL,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VoteCount_pokemonId_key" ON "VoteCount"("pokemonId");

-- AddForeignKey
ALTER TABLE "VoteCount" ADD CONSTRAINT "VoteCount_pokemonId_fkey" FOREIGN KEY ("pokemonId") REFERENCES "Pokemon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Pokemon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_keepId_fkey" FOREIGN KEY ("keepId") REFERENCES "Pokemon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Pokemon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
