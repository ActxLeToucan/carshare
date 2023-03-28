import type express from 'express';
import { prisma } from '../app';
import { error, sendMsg, info } from '../tools/translator';
import * as validator from '../tools/validator';

exports.getSettings = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    res.status(200).json({
        mailNotif: res.locals.user.mailNotif,
        lang: res.locals.user.lang,
        timezone: res.locals.user.timezone
    });
}

exports.updateSettings = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const { mailNotif, lang, timezone } = req.body;

    if (mailNotif !== undefined && !validator.checkBooleanField(mailNotif, req, res, 'mailNotif')) return;
    if (lang !== undefined && !validator.checkLang(lang, req, res)) return;
    const timezoneSanitized = validator.sanitizeTimezone(timezone);
    if (timezone !== undefined && timezoneSanitized === undefined) {
        sendMsg(req, res, error.timezone.invalid);
        return;
    }

    prisma.user.update({
        where: { id: res.locals.user.id },
        data: {
            mailNotif,
            lang,
            timezone: timezoneSanitized
        }
    }).then(() => {
        sendMsg(req, res, info.settings.saved);
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}
