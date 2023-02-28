import type express from 'express';
import { prisma } from '../app';
import { error, sendMsg, info } from '../tools/translator';

exports.getSettingsNotifications = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }

    res.status(200).json({value: res.locals.user.mailNotif});
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
