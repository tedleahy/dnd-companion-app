/*
  Warnings:

  - The `description` column on the `AbilityScore` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "AbilityScore" DROP COLUMN "description",
ADD COLUMN     "description" TEXT[];
