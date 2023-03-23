import type express from 'express';
import { displayableGroup, error, info, sendMsg, type Notif, notifs, notify } from '../tools/translator';
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

exports.addUserGroup = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const { userMail } = req.body;
    if (!validator.checkEmailField(userMail, req, res)) return;

    const groupId = validator.sanitizeId(req.params.id, req, res);
    if (groupId === null) return;

    prisma.group.count({
        where: {
            id: groupId,
            creatorId: res.locals.user.id
        }
    }).then((countG) => {
        if (countG !== 1) {
            sendMsg(req, res, error.group.notFound);
            return;
        }

        prisma.user.findUnique({
            where: {
                email: userMail
            }
        }).then((user) => {
            if (user === null) {
                sendMsg(req, res, error.user.notFound);
                return;
            }

            const userId: number = user.id;
            if (userId === res.locals.user.id) {
                sendMsg(req, res, error.group.creatorMember);
                return;
            }
            prisma.group.count({
                where: {
                    id: groupId,
                    users: {
                        some: {
                            id: userId
                        }
                    }

                }

            }).then((count) => {
                if (count === 1) {
                    sendMsg(req, res, error.group.alreadyMember);
                    return;
                }

                prisma.group.update({
                    where: {
                        id: groupId
                    },
                    data: {
                        users: {
                            connect: {
                                id: userId
                            }
                        }
                    },
                    include: {
                        users: true,
                        creator: true
                    }
                }).then((group) => {
                    const notif: Notif = notifs.standard.userAdd('en', group);
                    const data =
                        {
                            userId,
                            title: notif.title,
                            message: notif.message,
                            type: 'standard',
                            senderId: Number(res.locals.user.id),
                            createdAt: new Date()
                        };

                    prisma.notification.createMany({ data }).then(() => {
                        notify(user, data);

                        sendMsg(req, res, info.group.userAdd, group);
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
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}
