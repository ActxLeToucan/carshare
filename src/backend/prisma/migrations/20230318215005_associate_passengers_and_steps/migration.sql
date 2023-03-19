/*
  Warnings:

  - The primary key for the `passenger` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `travelId` on the `passenger` table. All the data in the column will be lost.
  - Added the required column `arrivalId` to the `Passenger` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departureId` to the `Passenger` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `passenger` DROP FOREIGN KEY `Passenger_travelId_fkey`;

-- AlterTable
ALTER TABLE `passenger` DROP PRIMARY KEY,
    DROP COLUMN `travelId`,
    ADD COLUMN `arrivalId` INTEGER NOT NULL,
    ADD COLUMN `departureId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`passengerId`, `departureId`, `arrivalId`);

-- AddForeignKey
ALTER TABLE `Passenger` ADD CONSTRAINT `Passenger_departureId_fkey` FOREIGN KEY (`departureId`) REFERENCES `Etape`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Passenger` ADD CONSTRAINT `Passenger_arrivalId_fkey` FOREIGN KEY (`arrivalId`) REFERENCES `Etape`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
