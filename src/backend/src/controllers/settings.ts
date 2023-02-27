import type express from 'express';
import { prisma } from '../app';
import { error, sendMsg, info } from '../tools/translator';

exports.getSettingsNotifications = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }

    prisma.user.findUnique({
        where: { id: res.locals.user.id },
        select: {
            mailNotif: true
        }

    }).then((mailNotif) => {
        res.status(200).json(mailNotif);
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}

exports.updateSettingsNotifications = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }

    prisma.user.update({
        where: { id: res.locals.user.id },
        data: { mailNotif: req.body.value }
    }).then(() => {
        sendMsg(req, res, info.settings.saved);
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}
