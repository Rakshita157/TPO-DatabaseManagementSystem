/*
  Warnings:

  - You are about to drop the column `fullName` on the `studentprofile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `studentprofile` DROP COLUMN `fullName`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `fullName` VARCHAR(191) NULL;
