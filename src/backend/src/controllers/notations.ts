import type express from 'express';
import { prisma } from '../app';
import { error, sendMsg } from '../tools/translator';
import * as properties from '../properties';

exports.getUserEvaluation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }
    const userId = properties.sanitizeUserId(req.params.id, req, res);
    if (userId === null) return;

    prisma.evaluation.aggregate({
        where: {
            evaluatedId: userId,
            travel: {
                driverId: userId
            }

        },
        _avg: {
            note: true
        },
        _count: {
            note: true
        }

    }).then((driver) => {
        prisma.evaluation.aggregate({
            where: {
                evaluatedId: userId,
                travel: {
                    passengers: {
                        some: {
                            passengerId: userId
                        }
                    }
                }
            },
            _avg: {
                note: true
            },
            _count: {
                note: true
            }

        }).then((passenger) => {
            res.status(200).json({ driver, passenger });
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}

exports.getAverageTravel = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    prisma.evaluation.groupBy({
        by: ['travelId'],
        where: {
            evaluatedId: res.locals.user.id

        },
        _avg: {
            note: true
        }

    }).then((travelsAvg) => {
        res.status(200).json(travelsAvg);
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}
