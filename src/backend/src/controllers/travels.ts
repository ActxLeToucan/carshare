import type express from 'express';
import { prisma } from '../app';
import * as validator from '../tools/validator';
import { checkTravelHours } from '../tools/validator';
import { displayableTravel, displayableUserPublic, error, info, sendMsg } from '../tools/translator';
import properties from '../properties';
import { getMaxPassengers, preparePagination } from './_common';
import moment from 'moment-timezone';
import * as _travel from './travels/_common';

exports.searchTravels = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const { date, startCity, startContext, endCity, endContext } = req.query;
    if (!validator.checkCityField(startCity, req, res, 'startCity')) return;
    if (!validator.checkCityField(endCity, req, res, 'endCity')) return;
    if (!validator.checkDateField(date, true, req, res)) return;
    if (startContext !== undefined && !validator.checkStringField(startContext, req, res, 'startContext')) return;
    if (endContext !== undefined && !validator.checkStringField(endContext, req, res, 'endContext')) return;

    const startCtx = startContext === undefined ? '' : startContext;
    const endCtx = endContext === undefined ? '' : endContext;

    const d = new Date(date as string);
    const date1 = moment(d).subtract(4, 'hour').toDate();
    const date2 = moment(d).add(18, 'hour').toDate();

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

            data = data.filter((travel: any) => {
                return travel.passengers < travel.maxPassengers && // Check if there is still seats available
                    checkTravelHours(travel.departure.date); // Check if the beginning of the travel is not too early
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

    if (!validator.checkMaxPassengersField(maxPassengers, req, res)) return;
    if (!validator.checkPriceField(price, req, res)) return;
    if (!validator.checkDescriptionField(description, req, res)) return;

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
            status: properties.travel.status.open
        },
        select: {
            steps: {
                select: {
                    date: true
                }
            }
        }
    }).then((travels) => {
        for (const travel of travels) {
            travel.steps.sort((a: any, b: any) => a.date.getTime() - b.date.getTime());
            if (!validator.checkTravelAlready(steps[0].date, steps[steps.length - 1].date, travel.steps, req, res)) return;
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
                steps: true,
                driver: true
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
            driver: true
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
