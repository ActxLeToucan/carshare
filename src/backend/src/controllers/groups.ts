import type express from 'express';
import { error, info, sendMsg } from '../tools/translator';
import * as properties from '../properties';
import { prisma } from '../app';

exports.createGroup = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }

    let { name, users } = req.body;
    if (!properties.checkGroupNameField(name, req, res)) return;
    users ??= [];
    if (!properties.checkUsersField(users, req, res)) return;

    prisma.user.findMany({
        where: {
            email: {
                in: users
            }
        },
        select: {
            id: true
        }
    }).then((userIds) => {
        prisma.group.create({
            data: {
                name,
                creator: {
                    connect: {
                        id: res.locals.user.id
                    }
                },
                users: {
                    connect: userIds
                }
            },
            include: {
                users: true
            }
        }).then((group) => {
            sendMsg(req, res, info.group.created, group);
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}

exports.getMyGroups = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }

    prisma.group.findMany({
        where: {
            creatorId: res.locals.user.id
        }
    }).then((groups) => {
        res.status(200).json(groups);
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}
