import type express from 'express';
import { error, sendMsg } from '../messages';
import { prisma } from '../app';
import { constraints } from '../constraints';

module.exports = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.userId === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }

    prisma.user.findUnique({ where: { id: res.locals.userId } })
        .then(user => {
            if (user === null) {
                sendMsg(req, res, error.user.notFound);
                return;
            }
            if (user.level < constraints.userLevel.admin) {
                sendMsg(req, res, error.auth.insufficientPrivileges);
                return;
            }
            next();
        }).catch(err => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
};
