/*
  Warnings:

  - Made the column `btuRollNumber` on table `studentprofile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `enrollmentNumber` on table `studentprofile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `activeBacklogs` on table `studentprofile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `passiveBacklogs` on table `studentprofile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `studentprofile` MODIFY `btuRollNumber` VARCHAR(191) NOT NULL,
    MODIFY `enrollmentNumber` VARCHAR(191) NOT NULL,
    MODIFY `activeBacklogs` INTEGER NOT NULL,
    MODIFY `passiveBacklogs` INTEGER NOT NULL;
