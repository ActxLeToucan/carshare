import type express from 'express';
import { prisma } from '../app';
import { displayableUser, error, info, sendMsg } from '../tools/translator';
import * as properties from '../properties';
import * as _user from './_common/user';

exports.getAllUsers = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    prisma.user.findMany()
        .then(users => {
            res.status(200).json(users.map(displayableUser));
        })
        .catch(err => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
}

exports.deleteUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userId = properties.sanitizeUserId(req.params.id, req, res);
    if (userId === null) return;

    prisma.user.findUnique({ where: { id: userId } })
        .then(user => {
            if (user == null) {
                sendMsg(req, res, error.user.notFound);
                return;
            }

            if (res.locals.user.level <= user.level) {
                sendMsg(req, res, error.auth.insufficientPrivileges);
                return;
            }

            prisma.user.delete({ where: { id: userId } })
                .then(() => { sendMsg(req, res, info.user.deleted); })
                .catch((err) => {
                    console.error(err);
                    sendMsg(req, res, error.generic.internalError);
                });
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
}

exports.updateUser = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userId = properties.sanitizeUserId(req.params.id, req, res);
    if (userId === null) return;

    prisma.user.findUnique({ where: { id: userId } })
        .then(user => {
            if (user == null) {
                sendMsg(req, res, error.user.notFound);
                return;
            }

            if (res.locals.user.level <= user.level) {
                sendMsg(req, res, error.auth.insufficientPrivileges);
                return;
            }

            _user.update(req, res, userId, true).catch((err) => {
                console.error(err);
                sendMsg(req, res, error.generic.internalError);
            });
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
}
