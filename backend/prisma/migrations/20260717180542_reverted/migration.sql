/*
  Warnings:

  - The primary key for the `emailverification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `purpose` on the `emailverification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `emailverification` DROP PRIMARY KEY,
    DROP COLUMN `purpose`,
    ADD PRIMARY KEY (`collegeEmail`);
