-- CreateTable
CREATE TABLE "SpellList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpellList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpellListSpell" (
    "spellListId" TEXT NOT NULL,
    "spellId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpellListSpell_pkey" PRIMARY KEY ("spellListId","spellId")
);

-- CreateIndex
CREATE INDEX "SpellList_ownerUserId_idx" ON "SpellList"("ownerUserId");

-- AddForeignKey
ALTER TABLE "SpellListSpell" ADD CONSTRAINT "SpellListSpell_spellListId_fkey" FOREIGN KEY ("spellListId") REFERENCES "SpellList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpellListSpell" ADD CONSTRAINT "SpellListSpell_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "Spell"("id") ON DELETE CASCADE ON UPDATE CASCADE;
