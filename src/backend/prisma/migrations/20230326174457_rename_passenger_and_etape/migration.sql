-- RenameTable
rename table etape to step;

-- RenameTable
rename table passenger to booking;

-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Passenger_arrivalId_fkey`;

-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Passenger_departureId_fkey`;

-- DropForeignKey
ALTER TABLE `booking` DROP FOREIGN KEY `Passenger_passengerId_fkey`;

-- DropForeignKey
ALTER TABLE `step` DROP FOREIGN KEY `Etape_travelId_fkey`;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_passengerId_fkey` FOREIGN KEY (`passengerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_departureId_fkey` FOREIGN KEY (`departureId`) REFERENCES `Step`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_arrivalId_fkey` FOREIGN KEY (`arrivalId`) REFERENCES `Step`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Step` ADD CONSTRAINT `Step_travelId_fkey` FOREIGN KEY (`travelId`) REFERENCES `Travel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RewriteView
create or replace view bookingsteps as
select `b`.`id` AS `bookingId`, `step`.`id` AS `stepId`
from (((`booking` `b` join `step` `dep`
        on (`b`.`departureId` = `dep`.`id`)) join `step` `arr`
       on (`b`.`arrivalId` = `arr`.`id`)) join `step`)
where `step`.`id` in (select `s`.`id`
                      from (`travel` `t` join `step` `s`
                            on (`t`.`id` = `s`.`travelId`))
                      where `s`.`date` >= `dep`.`date`
                        and `s`.`date` < `arr`.`date`)
  and `b`.`status` = 1;
