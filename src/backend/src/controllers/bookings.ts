import type express from 'express';
import { type Request } from 'express';
import { prisma } from '../app';
import { error, info, type MessageHTTP, notifs, notify, sendMsg } from '../tools/translator';
import properties from '../properties';
import sanitizer from '../tools/sanitizer';
import validator from '../tools/validator';
import { getMaxPassengers } from './_common';

exports.acceptBooking = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    acceptOrRejectBooking(req, res, properties.booking.status.accepted, info.booking.accepted);
}

exports.rejectBooking = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    acceptOrRejectBooking(req, res, properties.booking.status.rejected, info.booking.rejected);
}

function acceptOrRejectBooking (req: express.Request, res: express.Response, status: number, message: (req: Request, ...args: any) => MessageHTTP) {
    const bookingId = sanitizer.id(req.params.id, true, req, res);
    if (bookingId === null) return;

    prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            departure: {
                include: {
                    travel: {
                        include: {
                            steps: {
                                orderBy: { date: 'asc' }
                            }
                        }
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
            sendMsg(req, res, error.booking.notPending);
            return;
        }

        if (!validator.checkTravelHoursEditable(booking.departure.travel.steps[0].date, true, req, res)) return;

        if (status === properties.booking.status.accepted) {
            // check if there is a place left in the car
            try {
                const count: any = await getMaxPassengers(booking.departure.travelId, booking.departure, booking.arrival);
                const passengers = Number(count[0].nbPassengers);
                if (Number.isNaN(passengers)) {
                    console.error('Error while getting the number of passengers in the trip');
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
        prisma.booking.update({
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
                : notifs.booking.rejected)(booking.passenger, booking);

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
                        : notifs.request.rejected)(res.locals.user, notif, booking.passenger, new Date());

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
