import type express from 'express';
import { displayableGroup, error, info, sendMsg } from '../tools/translator';
import * as properties from '../properties';
import { prisma } from '../app';
import { getPagination } from './_common';

exports.createGroup = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }

    const { name } = req.body;
    if (!properties.checkGroupNameField(name, req, res)) return;
    prisma.group.create({
        data: {
            name,
            creator: {
                connect: {
                    id: res.locals.user.id
                }
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
}

exports.getMyGroups = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }

    const pagination = getPagination(req);

    prisma.group.findMany({
        where: {
            creatorId: res.locals.user.id
        },
        include: {
            users: true
        },
        skip: pagination.offset,
        take: pagination.limit
    }).then((groups) => {
        res.status(200).json(groups.map(displayableGroup));
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}
