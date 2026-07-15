/*
  Warnings:

  - You are about to drop the column `cplHeadline` on the `collegesettings` table. All the data in the column will be lost.
  - You are about to drop the column `mainContactNumber` on the `collegesettings` table. All the data in the column will be lost.
  - You are about to drop the column `notificationText` on the `collegesettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `collegesettings` DROP COLUMN `cplHeadline`,
    DROP COLUMN `mainContactNumber`,
    DROP COLUMN `notificationText`;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('STUDENT', 'ADMIN', 'CO_ADMIN') NOT NULL DEFAULT 'STUDENT';
