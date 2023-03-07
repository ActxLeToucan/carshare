import type express from 'express';
import { prisma } from '../app';
import { error, info, sendMsg } from '../tools/translator';
import * as properties from '../properties';

exports.myNotifications = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }

    prisma.notification.findMany({
        where: { userId: res.locals.user.id }

    }).then(notifications => {
        res.status(200).json(notifications);
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}

exports.deleteAllNotification = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }

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
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }
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
