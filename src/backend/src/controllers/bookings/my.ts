import type express from 'express';
import { prisma } from '../../app';
import { error, info, notifs, notify, sendMsg } from '../../tools/translator';
import validator from '../../tools/validator';
import { getMaxPassengers, preparePagination } from '../_common';
import properties from '../../properties';
import sanitizer from '../../tools/sanitizer';

exports.createBooking = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const { travelId, departureId, arrivalId } = req.body;

    if (!validator.typeInteger(travelId, true, req, res, 'travelId')) return;
    if (!validator.typeInteger(departureId, true, req, res, 'departureId')) return;
    if (!validator.typeInteger(arrivalId, true, req, res, 'arrivalId')) return;

    prisma.travel.findUnique({
        where: { id: travelId },
        include: {
            steps: {
                orderBy: { date: 'asc' }
            },
            driver: true
        }
    }).then((travel) => {
        if (travel === null) {
            sendMsg(req, res, error.travel.notFound);
            return;
        }

        if (travel.driverId === res.locals.user.id) {
            sendMsg(req, res, error.travel.isDriver);
            return;
        }

        if (!validator.checkTravelHours(travel.steps[0].date)) {
            sendMsg(req, res, error.date.tooSoon, travel.steps[0].date, res.locals.user.timezone);
            return;
        }

        const startStepIndex = travel.steps.findIndex((s) => s.id === departureId);
        const endStepIndex = travel.steps.findIndex((s) => s.id === arrivalId);
        const startStep = travel.steps[startStepIndex];
        const endStep = travel.steps[endStepIndex];
        if (startStep === undefined || endStep === undefined) {
            sendMsg(req, res, error.travel.invalidSteps);
            return;
        }

        const addBooking = () => {
            prisma.booking.create({
                data: {
                    status: properties.booking.status.pending,
                    passengerId: Number(res.locals.user.id),
                    departureId: startStep.id,
                    arrivalId: endStep.id
                },
                include: {
                    departure: true,
                    arrival: true,
                    passenger: true
                }
            }).then((booking) => {
                const notifDriver = notifs.request.new(travel.driver, travel, booking, res.locals.user);

                // create driver's notification
                prisma.notification.create({
                    data: {
                        ...notifDriver,
                        userId: travel.driverId,
                        senderId: Number(res.locals.user.id),
                        bookingId: booking.id
                    }
                }).then(() => {
                    // send email notification to passenger
                    notify(travel.driver, notifDriver);

                    sendMsg(req, res, info.booking.created, travel.driver);
                }).catch((err: any) => {
                    console.error(err);
                    sendMsg(req, res, error.generic.internalError);
                });
            }).catch((err: any) => {
                console.error(err);
                sendMsg(req, res, error.generic.internalError);
            });
        };

        // check if there is no other booking in the same time for the same user
        prisma.booking.count({
            where: {
                AND: [
                    { passengerId: res.locals.user.id },
                    {
                        OR: [
                            { status: properties.booking.status.pending },
                            { status: properties.booking.status.accepted }
                        ]
                    },
                    {
                        OR: [
                            {
                                departure: {
                                    date: {
                                        gte: startStep.date,
                                        lte: endStep.date
                                    }
                                }
                            },
                            {
                                arrival: {
                                    date: {
                                        gte: startStep.date,
                                        lte: endStep.date
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        }).then(async (nb) => {
            if (nb > 0) {
                sendMsg(req, res, error.booking.sameTime);
                return;
            }

            // check if there is a place left in the car
            try {
                const count: any = await getMaxPassengers(travelId, startStep, endStep);
                const passengers = Number(count[0].nbPassengers);
                if (Number.isNaN(passengers)) {
                    throw new Error('Error while getting the number of passengers in the trip');
                }

                if (passengers >= travel.maxPassengers) {
                    sendMsg(req, res, error.travel.noSeats);
                    return;
                }
            } catch (e) {
                console.error(e);
                sendMsg(req, res, error.generic.internalError);
                return;
            }

            addBooking();
        }).catch(err => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
    }).catch((err: any) => {
        console.error(err);
        sendMsg(req, res, error.travel.notFound);
    });
};

exports.cancelMyBooking = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const bookingId = sanitizer.id(req.params.id, true, req, res);
    if (bookingId === null) return;

    prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            departure: {
                include: {
                    travel: {
                        include: {
                            driver: true,
                            steps: {
                                orderBy: { date: 'asc' }
                            }
                        }
                    }
                }
            }
        }
    }).then((booking) => {
        if (booking === null) {
            sendMsg(req, res, error.booking.notFound);
            return;
        }
        if (booking.passengerId !== res.locals.user.id) {
            sendMsg(req, res, error.booking.notYours);
            return;
        }
        if (!validator.checkTravelHoursEditable(booking.departure.date, true, req, res)) return;

        if (booking.status === properties.booking.status.cancelled || booking.status === properties.booking.status.rejected) {
            sendMsg(req, res, error.booking.alreadyCancelled);
            return;
        }

        const travel = booking.departure.travel;

        prisma.booking.update({
            where: { id: bookingId },
            data: { status: properties.booking.status.cancelled },
            include: {
                departure: true,
                arrival: true,
                passenger: true
            }
        }).then((removedBooking) => {
            const notif = notifs.booking.cancelled(travel.driver, removedBooking, travel, booking.status);
            const data = {
                ...notif,
                userId: travel.driver.id,
                senderId: Number(res.locals.user.id),
                travelId: travel.id
            };

            prisma.notification.create({ data }).then(() => {
                sendMsg(req, res, info.booking.cancelled);
                notify(travel.driver, data);
            }).catch((err) => {
                console.error(err);
                sendMsg(req, res, error.generic.internalError);
            });
        }).catch((err: any) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
    }).catch((err: any) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
};

exports.getMyBookings = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const pagination = preparePagination(req, false);

    prisma.booking.count({
        where: { passengerId: res.locals.user.id }
    }).then((count) => {
        prisma.booking.findMany({
            where: { passengerId: res.locals.user.id },
            include: {
                departure: true,
                arrival: true
            },
            ...pagination.pagination
        }).then(bookings => {
            res.status(200).json(pagination.results(bookings, count));
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}
