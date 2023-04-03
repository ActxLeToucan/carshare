import type express from 'express';
import { prisma } from '../app';
import { error, info, sendMsg } from '../tools/translator';
import { preparePagination } from './_common';
import sanitizer from '../tools/sanitizer';

exports.getMyNotifications = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const pagination = preparePagination(req, false);

    prisma.notification.count({
        where: { userId: res.locals.user.id }
    }).then((count) => {
        prisma.notification.findMany({
            where: { userId: res.locals.user.id },
            orderBy: { createdAt: 'desc' },
            ...pagination.pagination
        }).then(notifications => {
            res.status(200).json(pagination.results(notifications, count));
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}

exports.deleteAllNotifications = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    prisma.notification.deleteMany({
        where: { userId: res.locals.user.id }
    }).then(() => {
        sendMsg(req, res, info.notification.deletedAll);
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}

exports.deleteOneNotification = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const notifId = sanitizer.id(req.params.id, true, req, res);
    if (notifId === null) return;

    prisma.notification.count({
        where: {
            id: notifId,
            userId: res.locals.user.id
        }

    }).then((count) => {
        if (count <= 0) {
            sendMsg(req, res, error.notification.notFound);
            return;
        }

        prisma.notification.delete({
            where: { id: notifId }
        }).then(() => {
            sendMsg(req, res, info.notification.deletedOne);
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}
