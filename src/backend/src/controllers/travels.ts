import type express from 'express';
import { prisma } from '../app';
import * as validator from '../tools/validator';
import { Passenger, User } from '@prisma/client';
import { error, info, type Notif, notifs, notify, sendMsg } from '../tools/translator';
import properties from '../properties';
import { checkTravelHoursLimit } from '../tools/validator';
import { preparePagination } from './_common';

exports.searchTravels = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const { date, startCity, startContext, endCity, endContext } = req.query;
    if (!validator.checkCityField(startCity, req, res, 'startCity')) return;
    if (!validator.checkCityField(endCity, req, res, 'endCity')) return;
    if (!validator.checkDateField(date, false, req, res)) return;
    if (startContext !== undefined && !validator.checkStringField(startContext, req, res, 'startContext')) return;
    if (endContext !== undefined && !validator.checkStringField(endContext, req, res, 'endContext')) return;

    const startCtx = startContext === undefined ? '' : startContext;
    const endCtx = endContext === undefined ? '' : endContext;

    const date1 = new Date(new Date(date as string).getTime() - 1000 * 60 * 60);
    const date2 = new Date(new Date(date as string).getTime() + 1000 * 60 * 60);

    prisma.$queryRaw`select t.*
                     from travel t
                              inner join etape e1 on e1.travelId = t.id and e1.city = ${startCity}
                              inner join etape e2 on e2.travelId = t.id and e2.city = ${endCity}
                     where t.status = ${properties.travel.status.open}
                       and e1.date < e2.date
                       and IF(${startCtx} = '', true, e1.context = ${startCtx})
                       and IF(${endCtx} = '', true, e2.context = ${endCtx})
                       and e1.date BETWEEN ${date1} and ${date2}`
        .then((data) => {
            res.status(200).json(data);
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
    if (!validator.checkListOfEtapeField(steps, req, res)) return;

    prisma.travel.findMany({
        where: {
            driverId: res.locals.user.id,
            status: 0
        },
        select: {
            etapes: {
                select: {
                    date: true
                }
            }
        }
    }).then((travels) => {
        for (const elements of travels) {
            if (!validator.checkTravelAlready(steps[0].date, steps[steps.length - 1].date, elements.etapes, req, res)) return;
        }

        prisma.travel.create({
            data: {
                maxPassengers,
                price,
                description,
                driverId: res.locals.user.id,
                groupId,
                etapes: {
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
                etapes: true
            }
        }).then((travel) => {
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

exports.cancelBooking = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const travel = req.body.travel;

    const dateCheck = new Date(new Date(travel.date).getTime() - 1000 * 60 * 60 * 24);
    console.log(res.locals.user.travelsAsPassenger.id)

    if (!(travel.id in res.locals.user.travelsAsPassenger.id)) {
        sendMsg(req, res, error.travel.notAPassenger);
        return;
    }

    if (dateCheck <= new Date() ) {
        sendMsg(req, res, error.travel.tooLate);
        return;
    }

    prisma.passenger.delete({
        where: { 
            passengerId: res.locals.user,
            departure.travelId: travel.id,
        }
    }).then(() => {
        sendMsg(req, res, info.travel.unbooked);
        properties.sendNotification(travel.id, null, null, [res.locals.user], "todo annulation", "todo message annulation", req, res);
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
            etapes: true
        }
    }).then((travel) => {
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

        if (!checkTravelHoursLimit(travel.etapes[0].date, req, res)) return;

        prisma.travel.update({
            where: { id: travelId },
            data: { status: properties.travel.status.cancelled }
        }).then(() => {
            prisma.passenger.findMany({
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
            }).then((passengers) => {
                const data = passengers.map((passenger) => {
                    const notif: Notif = notifs.standard.travelCancelled('en', passenger); // TODO: get user language
                    return {
                        userId: passenger.passengerId,
                        title: notif.title,
                        message: notif.message,
                        type: 'standard',
                        senderId: Number(res.locals.user.id),
                        travelId: passenger.departure.travelId,
                        createdAt: new Date()
                    };
                });

                prisma.notification.createMany({ data }).then(() => {
                    for (const notif of data) {
                        const passenger = passengers.find((p) => p.passengerId === notif.userId);
                        if (passenger !== undefined) notify(passenger.passenger, notif);
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
