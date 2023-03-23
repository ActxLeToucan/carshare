create view bookingsteps as
select `p`.`id` AS `bookingId`, `etape`.`id` AS `stepId`
from (((`passenger` `p` join `etape` `dep`
        on (`p`.`departureId` = `dep`.`id`)) join `etape` `arr`
       on (`p`.`arrivalId` = `arr`.`id`)) join `etape`)
where `etape`.`id` in (select `e`.`id`
                                  from (`travel` `t` join `etape` `e`
                                        on (`t`.`id` = `e`.`travelId`))
                                  where `e`.`date` >= `dep`.`date`
                                    and `e`.`date` < `arr`.`date`)
and `p`.`status` = 1;
