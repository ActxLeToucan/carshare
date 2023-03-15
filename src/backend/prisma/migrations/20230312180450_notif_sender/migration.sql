/*
  Warnings:

  - You are about to drop the column `action` on the `notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `notification` DROP COLUMN `action`,
    ADD COLUMN `senderId` INTEGER NULL,
    ADD COLUMN `type` VARCHAR(25) NULL;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
