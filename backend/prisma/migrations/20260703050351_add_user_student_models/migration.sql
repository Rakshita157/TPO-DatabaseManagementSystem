-- AlterTable
ALTER TABLE `collegesettings` MODIFY `tpoHeadPhoto` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `collegeEmail` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('STUDENT', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_collegeEmail_key`(`collegeEmail`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentProfile` (
    `userId` INTEGER NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `course` ENUM('BTECH', 'MTECH', 'MBA', 'MCA') NOT NULL,
    `department` VARCHAR(191) NULL,
    `mbaSpecialization1` VARCHAR(191) NULL,
    `mbaSpecialization2` VARCHAR(191) NULL,
    `admissionYear` INTEGER NOT NULL,
    `graduationYear` INTEGER NOT NULL,
    `currentYear` INTEGER NOT NULL,
    `currentSemester` INTEGER NOT NULL,
    `collegeId` VARCHAR(191) NOT NULL,
    `btuRollNumber` VARCHAR(191) NULL,
    `enrollmentNumber` VARCHAR(191) NULL,
    `dob` DATETIME(3) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `whatsappNumber` VARCHAR(191) NULL,
    `alternatePhone` VARCHAR(191) NULL,
    `alternateEmail` VARCHAR(191) NULL,
    `currentAddress` VARCHAR(191) NOT NULL,
    `permanentAddress` VARCHAR(191) NOT NULL,
    `nativeCity` VARCHAR(191) NOT NULL,
    `nativeDistrict` VARCHAR(191) NOT NULL,
    `nativeState` VARCHAR(191) NOT NULL,
    `aadharNumber` VARCHAR(191) NOT NULL,
    `panNumber` VARCHAR(191) NULL,
    `tenthPercentage` DECIMAL(65, 30) NOT NULL,
    `tenthYear` INTEGER NOT NULL,
    `tenthBoard` VARCHAR(191) NOT NULL,
    `twelfthPercentage` DECIMAL(65, 30) NOT NULL,
    `twelfthYear` INTEGER NOT NULL,
    `twelfthBoard` VARCHAR(191) NOT NULL,
    `diplomaPercentage` DECIMAL(65, 30) NULL,
    `diplomaYear` INTEGER NULL,
    `cgpa` DECIMAL(65, 30) NULL,
    `activeBacklogs` INTEGER NULL,
    `passiveBacklogs` INTEGER NULL,
    `linkedinUrl` VARCHAR(191) NULL,
    `placementStatus` ENUM('PLACED', 'NOT_PLACED') NOT NULL DEFAULT 'NOT_PLACED',
    `profileStatus` ENUM('INCOMPLETE', 'COMPLETE') NOT NULL DEFAULT 'INCOMPLETE',
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `StudentProfile_collegeId_key`(`collegeId`),
    UNIQUE INDEX `StudentProfile_btuRollNumber_key`(`btuRollNumber`),
    UNIQUE INDEX `StudentProfile_enrollmentNumber_key`(`enrollmentNumber`),
    UNIQUE INDEX `StudentProfile_phoneNumber_key`(`phoneNumber`),
    UNIQUE INDEX `StudentProfile_aadharNumber_key`(`aadharNumber`),
    UNIQUE INDEX `StudentProfile_panNumber_key`(`panNumber`),
    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SemesterResult` (
    `userId` INTEGER NOT NULL,
    `semester` INTEGER NOT NULL,
    `sgpa` DECIMAL(65, 30) NOT NULL,

    PRIMARY KEY (`userId`, `semester`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Document` (
    `userId` INTEGER NOT NULL,
    `resumeUrl` VARCHAR(191) NOT NULL,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `StudentProfile` ADD CONSTRAINT `StudentProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SemesterResult` ADD CONSTRAINT `SemesterResult_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `StudentProfile`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `StudentProfile`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
