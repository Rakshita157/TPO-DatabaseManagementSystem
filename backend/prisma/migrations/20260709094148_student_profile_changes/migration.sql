/*
  Warnings:

  - Made the column `whatsappNumber` on table `studentprofile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cgpa` on table `studentprofile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `studentprofile` MODIFY `whatsappNumber` VARCHAR(191) NOT NULL,
    MODIFY `cgpa` DECIMAL(65, 30) NOT NULL;
