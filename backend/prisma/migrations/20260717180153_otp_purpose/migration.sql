/*
  Warnings:

  - The primary key for the `emailverification` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE `emailverification` DROP PRIMARY KEY,
    ADD COLUMN `purpose` ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET') NOT NULL DEFAULT 'EMAIL_VERIFICATION',
    ADD PRIMARY KEY (`collegeEmail`, `purpose`);
