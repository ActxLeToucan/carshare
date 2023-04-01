import type express from 'express';
import { preparePagination } from '../_common';
import { prisma } from '../../app';
import { displayableSteps, error, info, notifs, notify, sendMsg } from '../../tools/translator';
import properties from '../../properties';
import validator from '../../tools/validator';
import * as _travel from './_common';
import sanitizer from '../../tools/sanitizer';

exports.getMyTravels = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const pagination = preparePagination(req, false);

    const type = req.query.type;
    if (type !== undefined && !['past', 'future'].includes(type as string)) {
        sendMsg(req, res, error.travel.invalidType);
        return;
    }

    let where: any;
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
                include: {
                    driver: true,
                    steps: {
                        orderBy: { date: 'asc' }
                    }
                },
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

exports.cancelMyTravel = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const travelId = sanitizer.id(req.params.id, req, res);
    if (travelId === null) return;

    prisma.travel.findUnique({
        where: { id: travelId },
        include: {
            steps: {
                orderBy: { date: 'asc' }
            }
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

        if (!validator.checkTravelHoursEditable(travel.steps[0].date, req, res)) return;

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
                        travelId: booking.departure.travelId,
                        bookingId: booking.id
                    };
                });

                // create notifications
                prisma.notification.createMany({ data }).then(() => {
                    for (const notif of data) {
                        const booking = bookings.find((b) => b.id === notif.bookingId);
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

exports.updateMyTravel = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    _travel.update(req, res, false).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}
