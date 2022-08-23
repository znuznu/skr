-- CreateTable
CREATE TABLE "VoteCount" (
    "id" TEXT NOT NULL,
    "storeCount" INTEGER NOT NULL DEFAULT 0,
    "keepCount" INTEGER NOT NULL DEFAULT 0,
    "releaseCount" INTEGER NOT NULL DEFAULT 0,
    "pokemonId" TEXT NOT NULL,

    CONSTRAINT "VoteCount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VoteCount_pokemonId_key" ON "VoteCount"("pokemonId");

-- AddForeignKey
ALTER TABLE "VoteCount" ADD CONSTRAINT "VoteCount_pokemonId_fkey" FOREIGN KEY ("pokemonId") REFERENCES "Pokemon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
