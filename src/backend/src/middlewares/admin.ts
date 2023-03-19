import type express from 'express';
import { error, sendMsg } from '../tools/translator';
import properties from '../properties';

module.exports = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        console.error('User is undefined in admin middleware');
        sendMsg(req, res, error.generic.internalError);
        return;
    }

    if (res.locals.user.level < properties.userLevel.admin) {
        sendMsg(req, res, error.auth.insufficientPrivileges);
        return;
    }

    next();
};
