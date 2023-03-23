import type express from 'express';
import { type Request } from 'express';
import { prisma } from '../app';
import { error, info, type MessageHTTP, notifs, notify, sendMsg } from '../tools/translator';
import properties from '../properties';
import * as validator from '../tools/validator';
import { checkTravelHoursLimit } from '../tools/validator';
import { getMaxPassengers } from './_common';

exports.acceptBooking = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    acceptOrRejectBooking(req, res, properties.booking.status.accepted, info.booking.accepted);
}

exports.rejectBooking = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    acceptOrRejectBooking(req, res, properties.booking.status.rejected, info.booking.rejected);
}

function acceptOrRejectBooking (req: express.Request, res: express.Response, status: number, message: (req: Request, ...args: any) => MessageHTTP) {
    const bookingId = validator.sanitizeId(req.params.id, req, res);
    if (bookingId === null) return;

    prisma.passenger.findUnique({
        where: { id: bookingId },
        include: {
            departure: {
                include: {
                    travel: {
                        include: { etapes: true }
                    }
                }
            },
            arrival: true
        }
    }).then(async (booking) => {
        // verifications
        if (booking === null) {
            sendMsg(req, res, error.booking.notFound);
            return;
        }

        if (booking.departure.travel.driverId !== res.locals.user.id) {
            sendMsg(req, res, error.travel.notDriver);
            return;
        }

        if (booking.status !== properties.booking.status.pending) {
            sendMsg(req, res, error.booking.alreadyReplied);
            return;
        }

        if (!checkTravelHoursLimit(booking.departure.travel.etapes[0].date, req, res)) return;

        if (status === properties.booking.status.accepted) {
            // check if there is a place left in the car
            try {
                const count: any = await getMaxPassengers(booking.departure.travelId, booking.departure, booking.arrival);
                const passengers = Number(count[0].nbPassengers);
                if (Number.isNaN(passengers)) {
                    console.error("Error while getting the number of passengers in the trip");
                    sendMsg(req, res, error.generic.internalError);
                    return;
                }

                if (passengers >= booking.departure.travel.maxPassengers) {
                    sendMsg(req, res, error.travel.noSeats);
                    return;
                }
            } catch (e) {
                sendMsg(req, res, error.generic.internalError);
                return;
            }
        }

        // accept/reject booking
        prisma.passenger.update({
            where: { id: bookingId },
            data: { status },
            include: {
                departure: true,
                arrival: true,
                passenger: true
            }
        }).then((booking) => {
            const notifPassenger = (status === properties.booking.status.accepted
                ? notifs.booking.accepted
                : notifs.booking.rejected)('en', booking);

            // create passenger's notification
            prisma.notification.create({
                data: {
                    ...notifPassenger,
                    userId: booking.passengerId,
                    senderId: Number(res.locals.user.id),
                    bookingId: booking.id
                }
            }).then(() => {
                // send email notification to passenger
                notify(booking.passenger, notifPassenger);

                // edit driver's notification
                prisma.notification.findFirst({
                    where: {
                        bookingId: booking.id,
                        type: 'request'
                    }
                }).then((notif) => {
                    if (notif === null) {
                        // the driver can have deleted the notification, it's not a problem
                        sendMsg(req, res, message, booking.passenger);
                        return;
                    }

                    const updatedDriverNotif = (status === properties.booking.status.accepted
                        ? notifs.request.accepted
                        : notifs.request.rejected)('en', notif, booking.passenger, new Date());

                    // update notification
                    prisma.notification.update({
                        where: { id: notif.id },
                        data: { ...updatedDriverNotif }
                    }).then(() => {
                        sendMsg(req, res, message, booking.passenger);
                    }).catch((err: any) => {
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
        }).catch((err: any) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
    }).catch((err: any) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}

exports.createBooking = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const { travelId, departureId, arrivalId } = req.body;

    const travelIdSanitized = validator.sanitizeId(travelId, req, res);
    const departureIdSanitized = validator.sanitizeId(departureId, req, res);
    const arrivalIdSanitized = validator.sanitizeId(arrivalId, req, res);
    if (travelIdSanitized === null) return;

    prisma.travel.findUnique({
        where: { id: travelIdSanitized },
        include: {
            etapes: true,
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

        if (!checkTravelHoursLimit(travel.etapes[0].date, req, res)) return;

        const startEtape = travel.etapes.find((e) => e.id === departureIdSanitized);
        const endEtape = travel.etapes.find((e) => e.id === arrivalIdSanitized);
        if (startEtape === undefined || endEtape === undefined) {
            sendMsg(req, res, error.travel.invalidEtapes);
            return;
        }

        // check if there is a place left in the car
        try {
            const count: any = await getMaxPassengers(travelIdSanitized, startEtape, endEtape);
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

        // create booking
        prisma.passenger.create({
            data: {
                status: properties.booking.status.pending,
                passengerId: Number(res.locals.user.id),
                departureId: travel.etapes[0].id,
                arrivalId: travel.etapes[travel.etapes.length - 1].id
            },
            include: {
                departure: true,
                arrival: true,
                passenger: true
            }
        }).then((booking) => {
            const notifDriver = notifs.request.new('en', travel, res.locals.user, startEtape, endEtape, {
                id: booking.id,
                status: booking.status,
                departureId: startEtape.id,
                arrivalId: endEtape.id,
                comment: '',
                passengerId: booking.passengerId
            });

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
    }).catch((err: any) => {
        console.error(err);
        sendMsg(req, res, error.travel.notFound);
    });
};
