/*
  Warnings:

  - The primary key for the `passenger` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `Passenger` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `notification` ADD COLUMN `bookingId` INTEGER NULL;

-- AlterTable
ALTER TABLE `passenger` DROP FOREIGN KEY `Passenger_passengerId_fkey`,
    DROP FOREIGN KEY `Passenger_arrivalId_fkey`,
    DROP FOREIGN KEY `Passenger_departureId_fkey`;
ALTER TABLE `passenger` DROP PRIMARY KEY,
    ADD `id` INT NOT NULL AUTO_INCREMENT FIRST,
    ADD PRIMARY KEY (`id`);
ALTER TABLE `passenger` ADD CONSTRAINT `Passenger_passengerId_fkey` FOREIGN KEY (`passengerId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `Passenger_arrivalId_fkey` FOREIGN KEY (`arrivalId`) REFERENCES `etape` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT `Passenger_departureId_fkey` FOREIGN KEY (`departureId`) REFERENCES `etape` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Passenger`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
