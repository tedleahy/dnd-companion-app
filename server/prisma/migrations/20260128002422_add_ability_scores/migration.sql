-- CreateTable
CREATE TABLE "AbilityScore" (
    "id" TEXT NOT NULL,
    "source" "SpellSource" NOT NULL,
    "srdIndex" TEXT,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "skillIndexes" TEXT[],

    CONSTRAINT "AbilityScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AbilityScore_srdIndex_key" ON "AbilityScore"("srdIndex");
