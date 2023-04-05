import type express from 'express';
import { prisma } from '../app';
import validator from '../tools/validator';
import properties from '../properties';

import { error, sendMsg, info, displayableAverage } from '../tools/translator';
import sanitizer from '../tools/sanitizer';

exports.getUserEvaluation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userId = sanitizer.id(req.params.id, true, req, res);
    if (userId === null) return;

    prisma.user.count({ where: { id: userId } }).then((count) => {
        if (count === 0) {
            sendMsg(req, res, error.user.notFound);
            return;
        }

        prisma.evaluation.aggregate({
            where: {
                evaluatedId: userId,
                travel: {
                    driverId: userId
                }
            },
            _avg: { note: true },
            _count: { note: true }
        }).then((avgAsDriver) => {
            prisma.evaluation.aggregate({
                where: {
                    evaluatedId: userId,
                    travel: {
                        steps: {
                            some: {
                                departureOfBookings: {
                                    some: {
                                        passengerId: userId
                                    }
                                }
                            }
                        }
                    }
                },
                _avg: { note: true },
                _count: { note: true }
            }).then((avgAsPassenger) => {
                res.status(200).json({
                    driver: displayableAverage(avgAsDriver),
                    passenger: displayableAverage(avgAsPassenger)
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

exports.createEvaluation = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const { note, travelId, evaluatedId } = req.body;

    if (!validator.note(note, true, req, res)) return;
    if (!validator.typeInteger(travelId, true, req, res, 'travelId')) return;
    if (!validator.typeInteger(evaluatedId, true, req, res, 'evaluatedId')) return;

    prisma.travel.findUnique({ where: { id: travelId } })
        .then((travel) => {
            if (travel === null) {
                sendMsg(req, res, error.travel.notFound);
                return;
            }

            if (travel.status !== properties.travel.status.ended) {
                sendMsg(req, res, error.travel.notEnded);
                return;
            }

            prisma.user.count({ where: { id: evaluatedId } })
                .then((count) => {
                    if (count === 0) {
                        sendMsg(req, res, error.user.notFound);
                        return;
                    }
                    prisma.evaluation.count({
                        where: {
                            travelId,
                            evaluatedId,
                            evaluatorId: res.locals.user.id
                        }
                    }).then((count) => {
                        if (count !== 0) {
                            sendMsg(req, res, error.evaluation.alreadyNoted);
                            return;
                        }
                        prisma.travel.count({
                            where: {
                                id: travelId,
                                status: properties.travel.status.ended,
                                OR: [{
                                    driverId: evaluatedId,
                                    steps: {
                                        some: {
                                            departureOfBookings: {
                                                some: {
                                                    passengerId: res.locals.user.id
                                                }
                                            }
                                        }
                                    }
                                }, {
                                    driverId: res.locals.user.id,
                                    steps: {
                                        some: {
                                            departureOfBookings: {
                                                some: {
                                                    passengerId: evaluatedId
                                                }
                                            }
                                        }
                                    }
                                }, {
                                    AND: [{
                                        steps: {
                                            some: {
                                                departureOfBookings: {
                                                    some: {
                                                        passengerId: res.locals.user.id
                                                    }
                                                }
                                            }
                                        }
                                    }, {
                                        steps: {
                                            some: {
                                                departureOfBookings: {
                                                    some: {
                                                        passengerId: evaluatedId
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    ]
                                }]
                            }
                        }).then((count) => {
                            if (count === 0) {
                                sendMsg(req, res, error.evaluation.notPossible);
                                return;
                            }

                            prisma.evaluation.create({
                                data: {
                                    note,
                                    travelId,
                                    evaluatorId: res.locals.user.id,
                                    evaluatedId
                                },
                                include: {
                                    travel: true,
                                    evaluator: true,
                                    evaluated: true
                                }
                            }).then((evaluation) => {
                                sendMsg(req, res, info.evaluation.created, evaluation);
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
                    })
                }).catch((err) => {
                    console.error(err);
                    sendMsg(req, res, error.generic.internalError);
                });
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
}

exports.getEvaluation = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const { travelId, evaluatedId } = req.query;

    const travelIdNbr = sanitizer.id(travelId, true, req, res, 'travelId');
    if (travelIdNbr === null) return;

    const evaluatedIdNbr = sanitizer.id(evaluatedId, true, req, res, 'evaluatedId');
    if (evaluatedIdNbr === null) return;

    prisma.evaluation.findMany({
        where: {
            travelId: travelIdNbr,
            evaluatedId: evaluatedIdNbr,
            evaluatorId: res.locals.user.id
        }
    }).then((evaluations) => {
        res.status(200).json({
            evaluation: evaluations.length > 0 ? evaluations[0] : null
        });
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}

exports.editEvaluation = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const { note } = req.body;
    const evaluationId = sanitizer.id(req.params.id, true, req, res);
    if (evaluationId === null) return;

    if (!validator.note(note, true, req, res)) return;

    prisma.evaluation.findUnique({ where: { id: evaluationId } })
        .then((evaluation) => {
            if (evaluation === null || evaluation.evaluatorId !== res.locals.user.id) {
                sendMsg(req, res, error.evaluation.notFound)
                return;
            }

            prisma.evaluation.update({
                where: { id: evaluationId },
                data: { note }
            }).then(() => {
                sendMsg(req, res, info.evaluation.updated);
            }).catch((err) => {
                console.error(err);
                sendMsg(req, res, error.generic.internalError);
            })
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
}

exports.deleteEvaluation = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const notationId = sanitizer.id(req.params.id, true, req, res);
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

        prisma.evaluation.delete({ where: { id: notationId } })
            .then(() => {
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
