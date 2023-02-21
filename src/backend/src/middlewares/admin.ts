import type express from 'express';
import { error, sendMsg } from '../messages';
import { constraints } from '../constraints';

module.exports = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }

    if (res.locals.user.level < constraints.userLevel.admin) {
        sendMsg(req, res, error.auth.insufficientPrivileges);
        return;
    }

    next();
};
