import type express from 'express';
import { prisma } from '../app';
import { displayableUser, error, sendMsg } from '../tools/translator';

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
