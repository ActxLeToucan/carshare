-- AlterTable
ALTER TABLE `user` ADD COLUMN `locale` VARCHAR(10) NULL,
    ADD COLUMN `timezone` VARCHAR(50) NULL;
