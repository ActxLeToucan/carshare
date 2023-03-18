import type express from 'express';
import { displayableGroup, error, info, sendMsg } from '../tools/translator';
import * as validator from '../tools/validator';
import { prisma } from '../app';
import { type Pagination, preparePagination } from './_common';

exports.createGroup = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const { name } = req.body;
    if (!validator.checkGroupNameField(name, req, res)) return;
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
    getGroups(req, res, next, false, (_) => ({
        creatorId: res.locals.user.id
    }));
}

exports.searchGroups = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    getGroups(req, res, next, true, (pagination) => ({
        name: {
            contains: pagination.query
        }
    }));
}

function getGroups (req: express.Request, res: express.Response, next: express.NextFunction, searchMode: boolean, where: (pagination: Pagination) => any) {
    const pagination = preparePagination(req, searchMode);

    prisma.group.count().then((count) => {
        prisma.group.findMany({
            where: where(pagination),
            include: {
                users: true,
                creator: true
            },
            ...pagination.pagination
        }).then((groups) => {
            res.status(200).json(pagination.results(groups.map(displayableGroup), count));
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}
