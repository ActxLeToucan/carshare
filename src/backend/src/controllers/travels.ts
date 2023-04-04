import type express from 'express';
import { prisma } from '../app';
import validator from '../tools/validator';

import { displayableTravel, displayableUserPublic, error, info, notifs, notify, sendMsg } from '../tools/translator';
import properties from '../properties';
import { getMaxPassengers, preparePagination } from './_common';
import moment from 'moment-timezone';
import * as _travel from './travels/_common';
import { type Group, type User } from '@prisma/client';
import sanitizer from '../tools/sanitizer';

exports.searchTravels = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const {
        date,
        time,
        startCity,
        startContext,
        startLat,
        startLng,
        endCity,
        endContext,
        endLat,
        endLng
    } = req.query;

    if (!validator.date(date, true, req, res, false)) return;
    if (!validator.city(startCity, true, req, res, 'startCity')) return;
    if (!validator.city(endCity, true, req, res, 'endCity')) return;
    if (startContext !== undefined && !validator.typeString(startContext, true, req, res, 'startContext')) return;
    if (endContext !== undefined && !validator.typeString(endContext, true, req, res, 'endContext')) return;

    let startLatSanitized;
    if (startLat !== undefined) {
        startLatSanitized = sanitizer.typeNumber(startLat, true, req, res, 'startLat');
        if (startLatSanitized === undefined) return;
        if (!validator.latitude(startLatSanitized, true, req, res, 'startLat')) return;
    }
    let startLngSanitized;
    if (startLng !== undefined) {
        startLngSanitized = sanitizer.typeNumber(startLng, true, req, res, 'startLng');
        if (startLngSanitized === undefined) return;
        if (!validator.longitude(startLngSanitized, true, req, res, 'startLng')) return;
    }
    let endLatSanitized;
    if (endLat !== undefined) {
        endLatSanitized = sanitizer.typeNumber(endLat, true, req, res, 'endLat');
        if (endLatSanitized === undefined) return;
        if (!validator.latitude(endLatSanitized, true, req, res, 'endLat')) return;
    }
    let endLngSanitized;
    if (endLng !== undefined) {
        endLngSanitized = sanitizer.typeNumber(endLng, true, req, res, 'endLng');
        if (endLngSanitized === undefined) return;
        if (!validator.longitude(endLngSanitized, true, req, res, 'endLng')) return;
    }

    let timeSanitized;
    if (time !== undefined) {
        timeSanitized = sanitizer.time(time, true, req, res);
        if (timeSanitized === null) return;
    }

    const startCtx = startContext === undefined ? '' : startContext;
    const endCtx = endContext === undefined ? '' : endContext;

    const d = new Date(date as string);
    let date1, date2;
    if (timeSanitized === undefined) {
        // check if the date is not before today + 24h
        if (!validator.checkTravelHours(d)) {
            sendMsg(req, res, error.date.tooSoon, moment().add(properties.travel.hoursLimit, 'hours').toDate(), res.locals.user.timezone);
            return;
        }
        date1 = d;
        date2 = moment(d).add(1, 'day').toDate();
    } else {
        // add time to date
        const dt = moment(d).add(timeSanitized.hours(), 'hours').add(timeSanitized.minutes(), 'minutes');
        // check if the date is not before today + 24h
        if (!validator.checkTravelHours(dt.toDate())) {
            sendMsg(req, res, error.date.tooSoon, moment().add(properties.travel.hoursLimit, 'hours').toDate(), res.locals.user.timezone);
            return;
        }
        // search for 4h before and 18h after
        date1 = moment(dt).subtract(4, 'hour').toDate();
        date2 = moment(dt).add(18, 'hour').toDate();
    }

    const useHaversineStart = startLatSanitized !== undefined && startLngSanitized !== undefined;
    const useHaversineEnd = endLatSanitized !== undefined && endLngSanitized !== undefined;

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
                              inner join step dep on dep.travelId = t.id
                              inner join step arr on arr.travelId = t.id
                     where t.status = ${properties.travel.status.open}
                       and dep.date < arr.date
                       and (dep.city = ${startCity} or
                            IF(${useHaversineStart},
                               haversine(dep.lat, dep.lng, ${startLatSanitized}, ${startLngSanitized}) <
                               ${properties.travel.search.maxDistance}, false))
                       and (arr.city = ${endCity} or
                            IF(${useHaversineEnd},
                               haversine(arr.lat, arr.lng, ${endLatSanitized}, ${endLngSanitized}) <
                               ${properties.travel.search.maxDistance}, false))
                       and IF(${startCtx} = '', true, dep.context = ${startCtx})
                       and IF(${endCtx} = '', true, arr.context = ${endCtx})
                       and dep.date BETWEEN ${date1} and ${date2}
                       and (t.groupId in (select groupId from _users where B = ${res.locals.user.id})
                         or t.groupId is null)`
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

            data = data.filter((travel: any) => {
                return travel.passengers < travel.maxPassengers && // Check if there is still seats available
                    validator.checkTravelHours(travel.departure.date); // Check if the beginning of the travel is not too early
            });
            data = data.sort((a: any, b: any) => {
                const diffA = Math.abs(a.departure.date.getTime() - d.getTime());
                const diffB = Math.abs(b.departure.date.getTime() - d.getTime());
                return diffA - diffB;
            });

            res.status(200).json(data);
        }).catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
}

exports.createTravel = async (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const { maxPassengers, price, description, groupId, steps } = req.body;

    if (!validator.maxPassengers(maxPassengers, true, req, res)) return;
    if (!validator.price(price, true, req, res)) return;
    if (!validator.description(description, true, req, res)) return;

    let group: (Group & { users: User[] }) | null = null;
    if (groupId !== undefined && groupId !== null) {
        if (!validator.typeInteger(groupId, true, req, res, 'groupId')) return;

        try {
            group = await prisma.group.findUnique({
                where: { id: groupId },
                include: { users: true }
            });

            if (group === null) {
                sendMsg(req, res, error.group.notFound);
                return;
            }

            if (group.creatorId !== res.locals.user.id) {
                sendMsg(req, res, error.group.notCreator);
                return;
            }
        } catch (err) {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        }
    }
    if (!validator.checkStepList(steps, true, req, res)) return;

    prisma.travel.findMany({
        where: {
            driverId: res.locals.user.id,
            status: properties.travel.status.open
        },
        select: {
            steps: {
                select: { date: true },
                orderBy: { date: 'asc' }
            }
        }
    }).then((travels) => {
        for (const travel of travels) {
            if (!validator.checkTravelAlready(steps[0].date, steps[steps.length - 1].date, travel.steps, true, req, res)) return;
        }

        prisma.travel.create({
            data: {
                maxPassengers,
                price,
                description,
                driverId: res.locals.user.id,
                groupId,
                steps: {
                    create: steps.map((step: {
                        label: string
                        city: string
                        context: string
                        lat: number
                        lng: number
                        date: string
                    }) => ({
                        ...step,
                        date: new Date(step.date)
                    }))
                }
            },
            include: {
                steps: {
                    orderBy: { date: 'asc' }
                },
                driver: true
            }
        }).then((travel) => {
            const users = group === null ? [] : group.users;
            const data = users.map((user) => {
                const notif = notifs.travel.invitation(user, travel, group?.name ?? 'noname');
                return {
                    ...notif,
                    userId: user.id,
                    senderId: travel.driver.id,
                    travelId: travel.id
                }
            });
            prisma.notification.createMany({ data }).then(() => {
                for (const notif of data) {
                    const user = users.find((u) => u.id === notif.userId);
                    // Send email notification
                    if (user !== undefined) notify(user, notif);
                }

                sendMsg(req, res, info.travel.created, travel);
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
    const travelId = sanitizer.id(req.params.id, true, req, res);
    if (travelId === null) return;

    prisma.travel.findUnique({
        where: { id: travelId },
        include: {
            steps: {
                orderBy: { date: 'asc' }
            },
            driver: true,
            group: true
        }
    }).then((travel: any) => {
        if (travel === null) {
            sendMsg(req, res, error.travel.notFound);
            return;
        }

        prisma.user.findMany({
            where: {
                bookings: {
                    some: {
                        departure: {
                            travelId: travel.id
                        },
                        status: properties.booking.status.accepted
                    }
                }
            }
        }).then((users) => {
            travel.passengers = users.map(displayableUserPublic);
            res.status(200).json(displayableTravel(travel));
        }).catch(err => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
    }).catch(err => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}

exports.updateTravel = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    _travel.update(req, res, true).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}

exports.cancelTravel = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    _travel.cancel(req, res, true).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}

exports.endTravel = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    _travel.end(req, res, true).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}
