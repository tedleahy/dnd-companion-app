-- CreateTable
CREATE TABLE "Race" (
    "id" TEXT NOT NULL,
    "source" "SpellSource" NOT NULL,
    "srdIndex" TEXT,
    "name" TEXT NOT NULL,
    "speed" INTEGER NOT NULL,
    "alignment" TEXT NOT NULL,
    "age" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "size_description" TEXT NOT NULL,
    "languageDesc" TEXT NOT NULL,
    "languageIndexes" TEXT[],
    "traitIndexes" TEXT[],
    "subraceIndexes" TEXT[],

    CONSTRAINT "Race_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbilityBonus" (
    "raceId" TEXT NOT NULL,
    "abilityScoreId" TEXT NOT NULL,
    "bonus" INTEGER NOT NULL,

    CONSTRAINT "AbilityBonus_pkey" PRIMARY KEY ("raceId","abilityScoreId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Race_srdIndex_key" ON "Race"("srdIndex");

-- AddForeignKey
ALTER TABLE "AbilityBonus" ADD CONSTRAINT "AbilityBonus_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Race"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbilityBonus" ADD CONSTRAINT "AbilityBonus_abilityScoreId_fkey" FOREIGN KEY ("abilityScoreId") REFERENCES "AbilityScore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
