-- CreateTable
CREATE TABLE `CollegeSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tpoHeadName` VARCHAR(191) NOT NULL,
    `tpoHeadPhoto` VARCHAR(191) NOT NULL,
    `tpoHeadEmail` VARCHAR(191) NOT NULL,
    `tpoHeadPhone` VARCHAR(191) NOT NULL,
    `officeAddress` VARCHAR(191) NULL,
    `officeHours` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
