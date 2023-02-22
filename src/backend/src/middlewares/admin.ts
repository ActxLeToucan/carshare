import type express from 'express';
import { error, sendMsg } from '../tools/translator';
import { p } from '../properties';

module.exports = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }

    if (res.locals.user.level < p.userLevel.admin) {
        sendMsg(req, res, error.auth.insufficientPrivileges);
        return;
    }

    next();
};
