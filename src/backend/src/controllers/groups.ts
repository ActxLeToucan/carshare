import type express from 'express';
import { displayableGroup, error, info, notifs, notify, sendMsg } from '../tools/translator';
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
            users: true,
            creator: true
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

exports.modifyNameGroup = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const groupName = req.body.groupName;
    if (!validator.checkGroupNameField(groupName, req, res)) return;
    console.log(req.body.groupId);
    const groupId = validator.sanitizeId(req.body.groupId, req, res);
    if (groupId === null) return;
    prisma.group.findUnique({
        where: {
            id: groupId
        }
    }).then(group => {
        if (group === null) {
            sendMsg(req, res, error.group.notFound);
            return;
        }
        if (group.creatorId !== res.locals.user.id) {
            sendMsg(req, res, error.group.notCreator);
            return;
        }

        const oldName = group.name;

        prisma.group.update({
            where: {
                id: groupId
            },
            data: {
                name: groupName
            },
            include: {
                users: true
            }
        }).then((group) => {
            const notif = notifs.group.nameUpdated(res.locals.user, oldName, groupName); // TODO: get user language

            const data = group.users.map((user) => {
                return {
                    ...notif,
                    userId: user.id,
                    senderId: Number(res.locals.user.id)
                };
            });

            prisma.notification.createMany({ data }).then(() => {
                for (const notif of data) {
                    const user = group.users.find((u) => u.id === notif.userId);
                    // send email notification
                    if (user !== undefined) notify(user, notif);
                }

                sendMsg(req, res, info.group.nameUpdated, group);
            }).catch((err) => {
                console.error(err);
                sendMsg(req, res, error.generic.internalError);
            });
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
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

exports.deleteGroup = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const groupId = validator.sanitizeId(req.params.id, req, res);
    if (groupId === null) return;

    prisma.group.count({
        where: {
            id: groupId
        }

    }).then((count) => {
        if (count <= 0) {
            sendMsg(req, res, error.group.notFound);
            return;
        }

        prisma.group.delete({
            where: {
                id: groupId

            }
        }).then(() => {
            sendMsg(req, res, info.group.deleted);
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}
