-- DropForeignKey
ALTER TABLE `etape` DROP FOREIGN KEY `Etape_travelId_fkey`;

-- DropForeignKey
ALTER TABLE `evaluation` DROP FOREIGN KEY `Evaluation_evaluatedId_fkey`;

-- DropForeignKey
ALTER TABLE `evaluation` DROP FOREIGN KEY `Evaluation_evaluatorId_fkey`;

-- DropForeignKey
ALTER TABLE `evaluation` DROP FOREIGN KEY `Evaluation_travelId_fkey`;

-- DropForeignKey
ALTER TABLE `group` DROP FOREIGN KEY `Group_creatorId_fkey`;

-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `Notification_userId_fkey`;

-- DropForeignKey
ALTER TABLE `passenger` DROP FOREIGN KEY `Passenger_passengerId_fkey`;

-- DropForeignKey
ALTER TABLE `passenger` DROP FOREIGN KEY `Passenger_travelId_fkey`;

-- DropForeignKey
ALTER TABLE `travel` DROP FOREIGN KEY `Travel_driverId_fkey`;

-- AddForeignKey
ALTER TABLE `Travel` ADD CONSTRAINT `Travel_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Passenger` ADD CONSTRAINT `Passenger_travelId_fkey` FOREIGN KEY (`travelId`) REFERENCES `Travel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Passenger` ADD CONSTRAINT `Passenger_passengerId_fkey` FOREIGN KEY (`passengerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Etape` ADD CONSTRAINT `Etape_travelId_fkey` FOREIGN KEY (`travelId`) REFERENCES `Travel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evaluation` ADD CONSTRAINT `Evaluation_travelId_fkey` FOREIGN KEY (`travelId`) REFERENCES `Travel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evaluation` ADD CONSTRAINT `Evaluation_evaluatorId_fkey` FOREIGN KEY (`evaluatorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Evaluation` ADD CONSTRAINT `Evaluation_evaluatedId_fkey` FOREIGN KEY (`evaluatedId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Group` ADD CONSTRAINT `Group_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
