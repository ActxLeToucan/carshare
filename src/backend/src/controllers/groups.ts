import type express from 'express';
import { displayableGroup, error, info, sendMsg, type Notif, notifs, notify } from '../tools/translator';
import validator from '../tools/validator';
import { prisma } from '../app';
import { type Pagination, preparePagination } from './_common';
import sanitizer from '../tools/sanitizer';
import properties from '../properties';

exports.createGroup = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const { name } = req.body;
    if (!validator.groupName(name, true, req, res)) return;
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

exports.updateGroup = (req: express.Request, res: express.Response, _: express.NextFunction, asAdmin: boolean = true) => {
    const groupName = req.body.groupName;
    if (!validator.groupName(groupName, true, req, res)) return;
    const groupId = sanitizer.id(req.params.id, true, req, res);
    if (groupId === null) return;
    prisma.group.findUnique({ where: { id: groupId } })
        .then(group => {
            if (group === null) {
                sendMsg(req, res, error.group.notFound);
                return;
            }

            if (!asAdmin && group.creatorId !== res.locals.user.id) {
                sendMsg(req, res, error.group.notCreator);
                return;
            }

            const oldName = group.name;

            prisma.group.update({
                where: { id: groupId },
                data: {
                    name: groupName
                },
                include: {
                    users: true,
                    creator: true
                }
            }).then((group) => {
                const data = group.users.map((user) => {
                    const notif = notifs.group.nameUpdated(user, oldName, groupName, asAdmin, false);
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

                    if (!asAdmin) {
                        sendMsg(req, res, info.group.updated, group);
                        return;
                    }

                    // send notification to group creator
                    const notifOwner = notifs.group.nameUpdated(group.creator, oldName, groupName, true, true);
                    prisma.notification.create({
                        data: {
                            ...notifOwner,
                            userId: group.creator.id,
                            senderId: Number(res.locals.user.id)
                        }
                    }).then(() => {
                        // send email notification
                        notify(group.creator, notifOwner);

                        sendMsg(req, res, info.group.updated, group);
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

exports.updateMyGroup = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    exports.updateGroup(req, res, next, false);
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

    prisma.group.count({ where: where(pagination) }).then((count) => {
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
    const groupId = sanitizer.id(req.params.id, true, req, res);
    if (groupId === null) return;

    const email = req.body.email;
    if (!validator.email(email, true, req, res, false)) return;

    prisma.group.findUnique({ where: { id: groupId } })
        .then((group) => {
            if (group === null) {
                sendMsg(req, res, error.group.notFound);
                return;
            }

            if (group.creatorId !== res.locals.user.id) {
                sendMsg(req, res, error.group.notCreator);
                return;
            }

            prisma.user.findUnique({ where: { email } })
                .then((user) => {
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
                                some: { id: userId }
                            }
                        }
                    }).then((count) => {
                        if (count === 1) {
                            sendMsg(req, res, error.group.alreadyMember);
                            return;
                        }

                        prisma.group.update({
                            where: { id: groupId },
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
                            const notif: Notif = notifs.group.userAdded(user, group, res.locals.user);
                            const data = {
                                ...notif,
                                userId,
                                senderId: Number(res.locals.user.id)
                            };

                            prisma.notification.create({ data }).then(() => {
                                notify(user, data);

                                sendMsg(req, res, info.group.userAdded, group);
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

exports.removeUserGroup = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const groupId = sanitizer.id(req.params.id, true, req, res);
    if (groupId === null) return;

    const email = req.body.email;
    if (!validator.email(email, true, req, res, false)) return;

    prisma.group.findUnique({ where: { id: groupId } })
        .then((group) => {
            if (group === null) {
                sendMsg(req, res, error.group.notFound);
                return;
            }

            if (group.creatorId !== res.locals.user.id) {
                sendMsg(req, res, error.group.notCreator);
                return;
            }

            prisma.user.findUnique({ where: { email } })
                .then((user) => {
                    if (user === null) {
                        sendMsg(req, res, error.user.notFound);
                        return;
                    }

                    prisma.group.count({
                        where: {
                            id: groupId,
                            users: {
                                some: { id: user.id }
                            }
                        }
                    }).then((count) => {
                        if (count !== 1) {
                            sendMsg(req, res, error.group.notMember);
                            return;
                        }

                        prisma.group.update({
                            where: { id: groupId },
                            data: {
                                users: {
                                    disconnect: {
                                        id: user.id
                                    }
                                }
                            },
                            include: {
                                users: true,
                                creator: true
                            }
                        }).then((group) => {
                            const notif = notifs.group.userRemoved(user, group, res.locals.user);
                            const data = {
                                ...notif,
                                userId: user.id,
                                senderId: Number(res.locals.user.id)
                            };

                            prisma.notification.create({ data }).then(() => {
                                notify(user, data);

                                sendMsg(req, res, info.group.memberRemoved, group);
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

/**
 * Delete a group
 * The response will be sent by the function
 * @param req Express request
 * @param res Express response
 * @param asAdmin Weather to update as an admin or not
 */
function deleteGroup (req: express.Request, res: express.Response, asAdmin: boolean) {
    const groupId = sanitizer.id(req.params.id, true, req, res);
    if (groupId === null) return;

    prisma.group.findUnique({ where: { id: groupId } })
        .then((group) => {
            if (group === null) {
                sendMsg(req, res, error.group.notFound);
                return;
            }
            if (!asAdmin) {
                if (group.creatorId !== res.locals.user.id) {
                    sendMsg(req, res, error.group.notCreator);
                    return;
                }
            }
            prisma.travel.updateMany({
                where: {
                    groupId
                },
                data: { status: properties.travel.status.cancelled }
            }).then(() => {
                prisma.group.delete({
                    where: { id: groupId },
                    include: {
                        users: true,
                        creator: true
                    }
                }).then((group) => {
                    const data = group.users.map((user) => {
                        const notif = notifs.group.deleted(user, group, res.locals.user, asAdmin);
                        return {
                            ...notif,
                            userId: user.id,
                            senderId: Number(res.locals.user.id)
                        };
                    });

                    // create notifications
                    prisma.notification.createMany({ data }).then(() => {
                        for (const notif of data) {
                            const user = group.users.find((user) => user.id === notif.userId);
                            // send email notification
                            if (user !== undefined) notify(user, notif);
                        }

                        if (asAdmin) {
                            const notifC = notifs.group.deleted(group.creator, group, res.locals.user, asAdmin);

                            prisma.notification.create({
                                data: {
                                    ...notifC,
                                    userId: group.creator.id,
                                    senderId: Number(res.locals.user.id)
                                }
                            }).then(() => {
                                notify(group.creator, notifC);
                            }).catch((err) => {
                                console.error(err);
                                sendMsg(req, res, error.generic.internalError);
                            });
                        }

                        sendMsg(req, res, info.group.deleted);
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

exports.deleteGroup = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    deleteGroup(req, res, true)
}

exports.deleteMyGroup = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    deleteGroup(req, res, false)
}
