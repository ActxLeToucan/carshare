import type express from 'express';
import { prisma } from '../app';
import { error, sendMsg, info } from '../tools/translator';
import * as properties from '../properties';

exports.getSettingsNotifications = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }

    res.status(200).json({ value: res.locals.user.mailNotif });
}

exports.updateSettingsNotifications = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }

    const value = req.body.value;

    if (value !== undefined && !properties.checkBooleanField(value, req, res, 'mailNotif')) {
        sendMsg(req, res, error.boolean.type);
        return;
    }

    prisma.user.update({
        where: { id: res.locals.user.id },
        data: { mailNotif: value }
    }).then(() => {
        sendMsg(req, res, info.settings.saved);
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}
