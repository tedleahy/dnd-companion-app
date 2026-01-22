-- CreateEnum
CREATE TYPE "SpellSource" AS ENUM ('SRD', 'CUSTOM');

-- CreateTable
CREATE TABLE "Spell" (
    "id" TEXT NOT NULL,
    "source" "SpellSource" NOT NULL,
    "srdIndex" TEXT,
    "name" TEXT NOT NULL,
    "desc" TEXT[],
    "higherLevel" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "range" TEXT,
    "components" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "material" TEXT,
    "ritual" BOOLEAN NOT NULL DEFAULT false,
    "duration" TEXT,
    "concentration" BOOLEAN NOT NULL DEFAULT false,
    "castingTime" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "damageAtSlotLevel" JSONB,
    "damageTypeIndex" TEXT,
    "attackType" TEXT,
    "schoolIndex" TEXT NOT NULL,
    "classIndexes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "subclassIndexes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "raw" JSONB,

    CONSTRAINT "Spell_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Spell_srdIndex_key" ON "Spell"("srdIndex");

-- CreateIndex
CREATE INDEX "Spell_name_idx" ON "Spell"("name");

-- CreateIndex
CREATE INDEX "Spell_level_idx" ON "Spell"("level");

-- CreateIndex
CREATE INDEX "Spell_schoolIndex_idx" ON "Spell"("schoolIndex");

-- CreateIndex
CREATE INDEX "Spell_ritual_idx" ON "Spell"("ritual");

-- CreateIndex
CREATE INDEX "Spell_concentration_idx" ON "Spell"("concentration");

-- CreateIndex
CREATE INDEX "Spell_classIndexes_idx" ON "Spell" USING GIN ("classIndexes");

-- CreateIndex
CREATE INDEX "Spell_subclassIndexes_idx" ON "Spell" USING GIN ("subclassIndexes");
