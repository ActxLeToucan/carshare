import type express from 'express';
import { prisma } from '../app';
import { error, sendMsg } from '../tools/translator';

exports.myNotifications = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }

    prisma.user.findUnique({
        where: { id: res.locals.user.id },
        select: {
            notifications: true
        }

    }).then(notifications => {
        res.status(200).json(notifications);
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}
