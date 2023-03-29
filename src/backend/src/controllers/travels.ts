import type express from 'express';
import { prisma } from '../app';
import * as validator from '../tools/validator';
import { checkTravelHoursLimit } from '../tools/validator';
import { displayableTravelPublic, displayableUserPublic, displayableSteps, error, info, notifs, notify, sendMsg } from '../tools/translator';
import properties from '../properties';
import { getMaxPassengers, preparePagination } from './_common';

exports.searchTravels = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const { date, startCity, startContext, endCity, endContext } = req.query;
    if (!validator.checkCityField(startCity, req, res, 'startCity')) return;
    if (!validator.checkCityField(endCity, req, res, 'endCity')) return;
    if (!validator.checkDateField(date, true, req, res)) return;
    if (startContext !== undefined && !validator.checkStringField(startContext, req, res, 'startContext')) return;
    if (endContext !== undefined && !validator.checkStringField(endContext, req, res, 'endContext')) return;

    const startCtx = startContext === undefined ? '' : startContext;
    const endCtx = endContext === undefined ? '' : endContext;

    const date1 = new Date(new Date(date as string).getTime() - 1000 * 60 * 60);
    const date2 = new Date(new Date(date as string).getTime() + 1000 * 60 * 60);

    prisma.$queryRaw`select t.*,
                            u.id              as 'driver.id',
                            u.email           as 'driver.email',
                            u.emailVerifiedOn as 'driver.emailVerifiedOn',
                            u.firstName       as 'driver.firstName',
                            u.lastName        as 'driver.lastName',
                            u.phone           as 'driver.phone',
                            u.avatar          as 'driver.avatar',
                            u.gender          as 'driver.gender',
                            u.hasCar          as 'driver.hasCar',
                            u.level           as 'driver.level',
                            dep.id            as 'departure.id',
                            dep.label         as 'departure.label',
                            dep.city          as 'departure.city',
                            dep.context       as 'departure.context',
                            dep.lat           as 'departure.lat',
                            dep.lng           as 'departure.lng',
                            dep.travelId      as 'departure.travelId',
                            dep.date          as 'departure.date',
                            arr.id            as 'arrival.id',
                            arr.label         as 'arrival.label',
                            arr.city          as 'arrival.city',
                            arr.context       as 'arrival.context',
                            arr.lat           as 'arrival.lat',
                            arr.lng           as 'arrival.lng',
                            arr.travelId      as 'arrival.travelId',
                            arr.date          as 'arrival.date'
                     from travel t
                              inner join user u on u.id = t.driverId
                              inner join step dep on dep.travelId = t.id and dep.city = ${startCity}
                              inner join step arr on arr.travelId = t.id and arr.city = ${endCity}
                     where t.status = ${properties.travel.status.open}
                       and dep.date < arr.date
                       and IF(${startCtx} = '', true, dep.context = ${startCtx})
                       and IF(${endCtx} = '', true, arr.context = ${endCtx})
                       and dep.date BETWEEN ${date1} and ${date2}
                       and t.groupId is null`
        .then(async (data: any) => {
            for (const travel of data) {
                for (const key of Object.keys(travel)) {
                    if (key.includes('.')) {
                        const [parent, child] = key.split('.');
                        travel[parent] = travel[parent] ?? {};
                        travel[parent][child] = travel[key];
                        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                        delete travel[key];
                    }
                }
                travel.driver = displayableUserPublic(travel.driver);
                try {
                    const count: any = await getMaxPassengers(travel.id, travel.departure, travel.arrival);
                    travel.passengers = Number(count[0].nbPassengers);
                    if (Number.isNaN(travel.passengers)) throw new Error('Could not get max passengers');
                } catch (err) {
                    console.error(err);
                    travel.passengers = -1;
                }
            }
            res.status(200).json(data.filter((travel: any) => travel.passengers < travel.maxPassengers));
        }).catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
}

exports.createTravel = async (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const { maxPassengers, price, description, groupId, steps } = req.body;

    if (!validator.checkMaxPassengersField(maxPassengers, req, res)) return;
    if (!validator.checkPriceField(price, req, res)) return;
    if (!validator.checkDescriptionField(description, req, res, 'description')) return;

    if (groupId !== undefined && groupId !== null) {
        if (typeof groupId !== 'number') {
            sendMsg(req, res, error.group.typeId);
            return;
        }

        try {
            const count = await prisma.group.count({
                where: {
                    id: groupId,
                    creatorId: res.locals.user.id
                }
            });

            if (count === 0) {
                sendMsg(req, res, error.group.notFound);
                return;
            }
        } catch (err) {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        }
    }
    if (!validator.checkStepList(steps, req, res)) return;

    prisma.travel.findMany({
        where: {
            driverId: res.locals.user.id,
            status: 0
        },
        select: {
            steps: {
                select: {
                    date: true
                }
            }
        }
    }).then((travels) => {
        for (const elements of travels) {
            if (!validator.checkTravelAlready(steps[0].date, steps[steps.length - 1].date, elements.steps, req, res)) return;
        }

        prisma.travel.create({
            data: {
                maxPassengers,
                price,
                description,
                driverId: res.locals.user.id,
                groupId,
                steps: {
                    create: steps.map((step: { label: string, city: string, context: string, lat: number, lng: number, date: string }) => ({
                        label: step.label,
                        city: step.city,
                        context: step.context,
                        lat: step.lat,
                        lng: step.lng,
                        date: new Date(step.date)
                    }))
                }
            },
            include: {
                steps: true
            }
        }).then((travel) => {
            // TODO: notify users in the group
            sendMsg(req, res, info.travel.created, travel);
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}

exports.cancelMyTravel = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const travelId = validator.sanitizeId(req.params.id, req, res);
    if (travelId === null) return;

    prisma.travel.findUnique({
        where: { id: travelId },
        include: {
            steps: true
        }
    }).then((travel) => {
        // verifications
        if (travel === null) {
            sendMsg(req, res, error.travel.notFound);
            return;
        }

        if (res.locals.user.id !== travel.driverId) {
            sendMsg(req, res, error.travel.notDriver);
            return;
        }

        if (travel.status !== properties.travel.status.open) {
            sendMsg(req, res, error.travel.notOpen);
            return;
        }

        if (!checkTravelHoursLimit(travel.steps[0].date, req, res)) return;

        // cancel travel
        prisma.travel.update({
            where: { id: travelId },
            data: { status: properties.travel.status.cancelled }
        }).then(() => {
            // get passengers and send notifications
            prisma.booking.findMany({
                where: {
                    departure: {
                        travelId
                    }
                },
                include: {
                    departure: true,
                    arrival: true,
                    passenger: true
                }
            }).then((bookings) => {
                const data = bookings.map((booking) => {
                    const notif = notifs.travel.cancelled(booking.passenger, booking);
                    return {
                        ...notif,
                        userId: booking.passengerId,
                        senderId: Number(res.locals.user.id),
                        travelId: booking.departure.travelId
                    };
                });

                // create notifications
                prisma.notification.createMany({ data }).then(() => {
                    for (const notif of data) {
                        const booking = bookings.find((b) => b.passengerId === notif.userId);
                        // send email notification
                        if (booking !== undefined) notify(booking.passenger, notif);
                    }

                    sendMsg(req, res, info.travel.cancelled);
                }).catch((err) => {
                    console.error(err);
                    sendMsg(req, res, error.generic.internalError);
                });
            }).catch((err) => {
                console.error(err);
                sendMsg(req, res, error.generic.internalError);
            });
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}

exports.getTravels = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const pagination = preparePagination(req, false);

    prisma.travel.count().then((count) => {
        prisma.travel.findMany({
            ...pagination.pagination
        }
        ).then(travels => {
            res.status(200).json(pagination.results(travels, count));
        }).catch(err => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
    }).catch(err => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}

exports.getTravel = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const travelId = validator.sanitizeId(req.params.id, req, res);
    if (travelId === null) return;

    prisma.travel.findUnique({
        where: { id: travelId },
        include: {
            steps: true,
            driver: true // TODO : include passenger
        }
    }).then((travel) => {
        if (travel === null) {
            sendMsg(req, res, error.travel.notFound);
            return;
        }
        res.status(200).json(displayableTravelPublic(travel));
    }).catch(err => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}

exports.getMyTravels = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const pagination = preparePagination(req, false);

    const type = validator.sanitizeType(req.query.type, req, res);
    if (type === null) return;

    let where: any
    if (type === 'past') {
        where = {
            OR: [{
                driverId: res.locals.user.id,
                steps: {
                    every: {
                        date: {
                            lt: new Date()
                        }
                    }
                }
            },
            {
                steps: {
                    every: {
                        departureOfBookings: {
                            every: {
                                passengerId: res.locals.user.id
                            }
                        },
                        date: {
                            lt: new Date()
                        }
                    }
                }
            }]
        };
    } else if (type === 'future') {
        where = {
            OR: [{
                driverId: res.locals.user.id,
                steps: {
                    some: {
                        date: {
                            gte: new Date()
                        }
                    }
                }
            },
            {
                steps: {
                    some: {
                        date: {
                            gte: new Date()
                        },
                        departureOfBookings: {
                            some: {
                                passengerId: res.locals.user.id
                            }
                        }
                    }
                }
            }]
        };
    } else {
        where = {
            OR: [{
                driverId: res.locals.user.id
            },
            {
                steps: {
                    some: {
                        departureOfBookings: {
                            some: {
                                passengerId: res.locals.user.id
                            }
                        }
                    }
                }
            }]
        };
    }

    prisma.travel.count({ where })
        .then((count) => {
            prisma.travel.findMany({
                where,
                include: { driver: true, steps: true },
                ...pagination.pagination
            }).then(travels => {
                const data = travels.map(displayableSteps)
                res.status(200).json(pagination.results(data, count));
            }).catch((err) => {
                console.error(err);
                sendMsg(req, res, error.generic.internalError);
            });
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
}
