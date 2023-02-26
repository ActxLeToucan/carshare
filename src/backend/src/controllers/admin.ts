import type express from 'express';
import { prisma } from '../app';
import { displayableUser, info, error, sendMsg } from '../tools/translator';
import * as properties from '../properties';

exports.users = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    prisma.user.findMany()
        .then(users => {
            res.status(200).json(users.map(displayableUser));
        })
        .catch(err => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
}

exports.deleteUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userId = properties.sanitizeId(req.params.id, req, res);

    if (userId != null) {
        prisma.user.delete({ where: { id: userId } })
            .then(() => { sendMsg(req, res, info.user.deleted); })
            .catch((err) => {
                console.error(err);
                sendMsg(req, res, error.generic.internalError);
            });
    } else {
        return null;
    }
}
