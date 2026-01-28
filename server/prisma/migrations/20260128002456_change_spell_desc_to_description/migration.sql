/*
  Warnings:

  - You are about to drop the column `desc` on the `Spell` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Spell" DROP COLUMN "desc",
ADD COLUMN     "description" TEXT[];
