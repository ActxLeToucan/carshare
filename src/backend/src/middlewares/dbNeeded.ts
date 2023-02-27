import type express from 'express';
import { error, sendMsg } from '../tools/translator';
import { prisma } from '../app';

module.exports = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    prisma.$queryRaw`SELECT 1`
        .then(() => { next(); })
        .catch(() => {
            prisma.$connect()
                .then(() => { next(); })
                .catch((err) => {
                    console.error(err);
                    sendMsg(req, res, error.db.notReachable)
                });
        });
};
