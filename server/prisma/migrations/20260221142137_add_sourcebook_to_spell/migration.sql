-- AlterTable
ALTER TABLE "Spell" ADD COLUMN     "sourceBook" TEXT;

-- CreateIndex
CREATE INDEX "Spell_sourceBook_idx" ON "Spell"("sourceBook");
