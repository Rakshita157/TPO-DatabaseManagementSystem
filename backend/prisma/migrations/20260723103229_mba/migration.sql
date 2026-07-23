/*
  Warnings:

  - You are about to drop the column `mbaSpecialization1` on the `studentprofile` table. All the data in the column will be lost.
  - You are about to drop the column `mbaSpecialization2` on the `studentprofile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `studentprofile` DROP COLUMN `mbaSpecialization1`,
    DROP COLUMN `mbaSpecialization2`;
