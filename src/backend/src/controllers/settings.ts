import type express from 'express';
import { prisma } from '../app';
import { error, sendMsg, info } from '../tools/translator';
import * as validator from '../tools/validator';

exports.getNotificationSetting = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    res.status(200).json({ value: res.locals.user.mailNotif });
}

exports.updateNotificationSetting = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const value = req.body.value;

    if (!validator.checkBooleanField(value, req, res, 'value')) return;

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
