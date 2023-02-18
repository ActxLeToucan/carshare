import type express from 'express';
import { PrismaClient } from '@prisma/client';
import { error, sendMsg } from '../messages';

const prisma = new PrismaClient();

exports.users = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    prisma.user.findMany()
        .then(users => {
            res.status(200).json(users);
        })
        .catch(e => {
            console.error(e);
            sendMsg(req, res, error.generic.cannotConnectToDB);
        });
}
