import type express from 'express';
import { prisma } from '../app';
import { error, info, sendMsg } from '../tools/translator';

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
