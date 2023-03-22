import type express from 'express';
import { prisma } from '../app';
import * as validator from '../tools/validator';
import { error, sendMsg, info, displayableAverage } from '../tools/translator';

exports.getUserEvaluation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userId = validator.sanitizeId(req.params.id, req, res);

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
                    etapes: {
                        some: {
                            departuresOfPassengers: {
                                some: {
                                    passengerId: userId
                                }
                            }
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
            passenger = displayableAverage(passenger);
            driver = displayableAverage(driver);

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
        travelsAvg.map(displayableAverage);
        res.status(200).json(travelsAvg);
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}

exports.deleteEvaluation = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const notationId = validator.sanitizeId(req.params.id, req, res);
    if (notationId === null) return;

    prisma.evaluation.count({

        where: {
            id: notationId,
            evaluatorId: res.locals.user.id
        }

    }).then((count) => {
        if (count <= 0) {
            sendMsg(req, res, error.evaluation.notFound);
            return;
        }

        prisma.evaluation.delete({
            where: {
                id: notationId

            }
        }).then(() => {
            sendMsg(req, res, info.evaluation.deleted);
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}
