/*
  Warnings:

  - You are about to drop the column `order` on the `etape` table. All the data in the column will be lost.
  - You are about to drop the column `arrivalDate` on the `travel` table. All the data in the column will be lost.
  - You are about to drop the column `departureDate` on the `travel` table. All the data in the column will be lost.
  - Added the required column `date` to the `Etape` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `etape` DROP COLUMN `order`,
    ADD COLUMN `date` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `travel` DROP COLUMN `arrivalDate`,
    DROP COLUMN `departureDate`;
