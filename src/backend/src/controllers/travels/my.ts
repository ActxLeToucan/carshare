import type express from 'express';
import { preparePagination } from '../_common';
import { prisma } from '../../app';
import { displayableSteps, error, sendMsg } from '../../tools/translator';
import * as _travel from './_common';

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
    _travel.cancel(req, res, false).catch((err) => {
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
