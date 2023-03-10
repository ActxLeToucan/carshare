import type express from 'express';
import { error, sendMsg } from '../tools/translator';

module.exports = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        console.error('User is undefined in emailVerified middleware');
        sendMsg(req, res, error.generic.internalError);
        return;
    }

    if (res.locals.user.emailVerifiedOn === null) {
        sendMsg(req, res, error.auth.emailNotVerified);
        return;
    }

    next();
};
