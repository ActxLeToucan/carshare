-- AlterTable
ALTER TABLE `user` ADD COLUMN `lastEmailVerificationEmailedOn` DATETIME(3) NULL,
    ADD COLUMN `lastPasswordResetEmailedOn` DATETIME(3) NULL;
