import type express from 'express';
import { PrismaClient } from '@prisma/client';
import { displayableUser } from '../messages';

const prisma = new PrismaClient();

exports.users = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    prisma.user.findMany()
        .then(users => {
            res.status(200).json(users.map(displayableUser));
        })
        .catch(error => {
            console.error(error);
            res.status(500).json(error);
        });
}
