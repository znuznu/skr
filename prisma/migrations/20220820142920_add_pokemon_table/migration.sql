-- CreateTable
CREATE TABLE "Pokemon" (
    "id" TEXT NOT NULL,
    "dex_id" INTEGER NOT NULL,
    "types" TEXT[],
    "en_name" TEXT NOT NULL,
    "jp_name" TEXT,
    "artwork_url" TEXT,
    "sprite_url" TEXT,

    CONSTRAINT "Pokemon_pkey" PRIMARY KEY ("id")
);
