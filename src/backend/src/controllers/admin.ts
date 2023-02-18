import type express from 'express';
import { PrismaClient } from '@prisma/client';
import { error, sendMsg } from '../messages';

const prisma = new PrismaClient();

exports.users = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    queryUsers()
        .then(async (users) => {
            res.status(200).json(users);
            await prisma.$disconnect()
        })
        .catch(async (e) => {
            console.error(e);
            sendMsg(req, res, error.generic.cannotConnectToDB);
            await prisma.$disconnect();
        });
}

async function queryUsers () {
    return prisma.user.findMany();
}
