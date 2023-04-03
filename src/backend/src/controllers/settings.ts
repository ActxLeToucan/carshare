import type express from 'express';
import { prisma } from '../app';
import { error, sendMsg, info } from '../tools/translator';
import validator from '../tools/validator';
import sanitizer from '../tools/sanitizer';

exports.getSettings = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    res.status(200).json({
        mailNotif: res.locals.user.mailNotif,
        lang: res.locals.user.lang,
        timezone: res.locals.user.timezone
    });
}

exports.updateSettings = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const { mailNotif, lang, timezone } = req.body;

    if (mailNotif !== undefined && !validator.typeBoolean(mailNotif, true, req, res, 'mailNotif')) return;
    if (lang !== undefined && !validator.lang(lang, true, req, res)) return;
    let timezoneSanitized;
    if (timezone !== undefined) {
        timezoneSanitized = sanitizer.timezone(timezone, true, req, res);
        if (timezoneSanitized === undefined) return;
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
