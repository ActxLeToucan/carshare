/*
  Warnings:

  - You are about to drop the column `birthDate` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `birthDate`;
ALTER TABLE `user` CHANGE `tel` `phone` varchar(16) NULL;
