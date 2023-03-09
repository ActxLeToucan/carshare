import type express from 'express';
import { prisma } from '../app';
import { error, info, sendMsg } from '../tools/translator';
import * as properties from '../properties';
import { getPagination } from './_common';

exports.myNotifications = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const pagination = getPagination(req);

    prisma.notification.findMany({
        where: { userId: res.locals.user.id },
        skip: pagination.offset,
        take: pagination.limit
    }).then(notifications => {
        res.status(200).json(notifications);
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}

exports.deleteAllNotification = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    prisma.notification.deleteMany({
        where: { userId: res.locals.user.id }

    }).then(() => {
        sendMsg(req, res, info.notification.deletedAll);
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}

exports.deleteOneNotification = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const notifId = properties.sanitizeNotificationId(req.params.id, req, res);
    if (notifId === null) return;

    prisma.notification.count({
        where: {
            id: notifId,
            userId: res.locals.user.id
        }

    }).then((count) => {
        if (count <= 0) {
            sendMsg(req, res, error.notification.notFound);
            return;
        }

        prisma.notification.delete({
            where: {
                id: notifId

            }
        }).then(() => {
            sendMsg(req, res, info.notification.deletedOne);
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}
