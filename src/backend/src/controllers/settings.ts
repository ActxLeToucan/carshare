import type express from 'express';
import { prisma } from '../app';
import { error, sendMsg, info } from '../tools/translator';
import * as validator from '../tools/validator';

exports.getSettings = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    res.status(200).json({
        mailNotif: res.locals.user.mailNotif,
        locale: res.locals.user.locale,
        timezone: res.locals.user.timezone
    });
}

exports.updateSettings = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const { mailNotif, locale, timezone } = req.body;

    if (mailNotif !== undefined && !validator.checkBooleanField(mailNotif, req, res, 'mailNotif')) return;
    if (locale !== undefined && !validator.checkLocale(locale, req, res)) return;
    if (timezone !== undefined && !validator.checkTimezone(timezone, req, res)) return;

    prisma.user.update({
        where: { id: res.locals.user.id },
        data: { mailNotif, locale, timezone }
    }).then(() => {
        sendMsg(req, res, info.settings.saved);
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}
