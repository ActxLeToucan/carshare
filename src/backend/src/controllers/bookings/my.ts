import type express from 'express';
import * as validator from '../../tools/validator';
import { prisma } from '../../app';
import { error, info, notifs, notify, sendMsg } from '../../tools/translator';
import { type Booking } from '@prisma/client';
import { checkTravelHoursLimit } from '../../tools/validator';
import { getMaxPassengers, preparePagination } from '../_common';
import properties from '../../properties';

exports.createBooking = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const { travelId, departureId, arrivalId } = req.body;

    const travelIdSanitized = validator.sanitizeId(travelId, req, res);
    if (travelIdSanitized === null) return;

    const departureIdSanitized = validator.sanitizeId(departureId, req, res);
    if (departureIdSanitized === null) return;

    const arrivalIdSanitized = validator.sanitizeId(arrivalId, req, res);
    if (arrivalIdSanitized === null) return;

    prisma.travel.findUnique({
        where: { id: travelIdSanitized },
        include: {
            steps: true,
            driver: true
        }
    }).then(async (travel) => {
        if (travel === null) {
            sendMsg(req, res, error.travel.notFound);
            return;
        }

        if (travel.driverId === res.locals.user.id) {
            sendMsg(req, res, error.travel.isDriver);
            return;
        }

        if (!checkTravelHoursLimit(travel.steps[0].date, req, res)) return;

        const startStepIndex = travel.steps.findIndex((s) => s.id === departureIdSanitized);
        const endStepIndex = travel.steps.findIndex((s) => s.id === arrivalIdSanitized);
        const startStep = travel.steps[startStepIndex];
        const endStep = travel.steps[endStepIndex];
        if (startStep === undefined || endStep === undefined) {
            sendMsg(req, res, error.travel.invalidSteps);
            return;
        }

        // check if there is a place left in the car
        try {
            const count: any = await getMaxPassengers(travelIdSanitized, startStep, endStep);
            const passengers = Number(count[0].nbPassengers);
            if (Number.isNaN(passengers)) {
                console.error('Error while getting the number of passengers in the trip');
                sendMsg(req, res, error.generic.internalError);
                return;
            }

            if (passengers >= travel.maxPassengers) {
                sendMsg(req, res, error.travel.noSeats);
                return;
            }
        } catch (e) {
            sendMsg(req, res, error.generic.internalError);
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

        const userStepsIds = Array.from(travel.steps).splice(startStepIndex, endStepIndex - startStepIndex + 1).map((e) => e.id);
        const arrivalAndDepartures: object[] = [];
        userStepsIds.forEach((id) => {
            arrivalAndDepartures.push({ arrivalId: id });
            arrivalAndDepartures.push({ departureId: id });
        });

        prisma.booking.findFirst({
            where: {
                AND: [
                    { passengerId: res.locals.user.id },
                    {
                        OR: arrivalAndDepartures
                    }
                ]
            }
        }).then((booking) => {
            if (booking !== null) {
                sendMsg(req, res, error.booking.alreadyBooked);
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

// TODO: rewrite this function
exports.cancelMyBooking = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const travelId = validator.sanitizeId(req.params.id, req, res);
    if (travelId === null) return;

    prisma.booking.findMany({
        where: { passengerId: res.locals.user.id },
        include: {
            departure: true,
            arrival: true,
            passenger: true
        }
    }).then((bookings) => {
        if (bookings === null) {
            sendMsg(req, res, error.travel.notAPassenger);
            return;
        }

        prisma.travel.findUnique({
            where: { id: travelId },
            include: {
                steps: true,
                driver: true
            }
        }).then((travel) => {
            if (travel === null) {
                sendMsg(req, res, error.travel.notFound);
                return;
            }

            const stepsIds = travel.steps.map(elem => elem.id);
            const passengerTravel = bookings.find((elem: Booking) => stepsIds.includes(elem.departureId));

            if (passengerTravel === undefined) {
                sendMsg(req, res, error.travel.notAPassenger);
                return;
            }

            if (!checkTravelHoursLimit(travel.createdAt, req, res)) return;

            prisma.booking.delete({
                where: {
                    id: passengerTravel.id
                }
            }).then(() => {
                const notif = notifs.booking.unbooked(travel.driver, passengerTravel);
                const data = {
                    ...notif,
                    userId: travel.driverId,
                    senderId: Number(res.locals.user.id),
                    travelId: travel.id
                };

                prisma.notification.create({ data }).then(() => {
                    sendMsg(req, res, info.travel.unbooked);
                    notify(travel.driver, data);
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
