import type express from 'express';
import { preparePagination } from '../_common';
import { prisma } from '../../app';
import { error, sendMsg } from '../../tools/translator';

exports.getMyTravelsAsDriver = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const pagination = preparePagination(req, false);

    prisma.travel.count({
        where: { driverId: res.locals.user.id }
    }).then((count) => {
        prisma.travel.findMany({
            where: { driverId: res.locals.user.id },
            ...pagination.pagination
        }).then(travels => {
            res.status(200).json(pagination.results(travels, count));
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}

exports.getMyTravelsAsPassenger = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const pagination = preparePagination(req, false);

    prisma.passenger.count({
        where: { passengerId: res.locals.user.id }
    }).then((count) => {
        prisma.passenger.findMany({
            where: { passengerId: res.locals.user.id },
            include: {
                departure: true,
                arrival: true
            },
            ...pagination.pagination
        }).then(passengers => {
            res.status(200).json(pagination.results(passengers, count));
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}
