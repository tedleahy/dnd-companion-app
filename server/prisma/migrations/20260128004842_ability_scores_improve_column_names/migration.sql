/*
  Warnings:

  - You are about to drop the column `languageDesc` on the `Race` table. All the data in the column will be lost.
  - You are about to drop the column `size_description` on the `Race` table. All the data in the column will be lost.
  - Added the required column `languageDescription` to the `Race` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sizeDescription` to the `Race` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Race" DROP COLUMN "languageDesc",
DROP COLUMN "size_description",
ADD COLUMN     "languageDescription" TEXT NOT NULL,
ADD COLUMN     "sizeDescription" TEXT NOT NULL;
