import type express from 'express';
import { PrismaClient } from '@prisma/client';
import { error, displayableUser, sendMsg } from '../messages';

const prisma = new PrismaClient();

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
