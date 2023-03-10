<<<<<<< HEAD
import type express from 'express';
import { displayableUser, error, info, sendMsg } from '../../tools/translator';
import * as properties from '../../properties';
import bcrypt from 'bcrypt';
import { prisma } from '../../app';
import * as _user from '../_common/user';

exports.getMe = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }

    res.status(200).json(displayableUser(res.locals.user));
}

exports.deleteMe = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }

    if (!properties.checkPasswordField(req.body.password, req, res, false)) return;

    bcrypt.compare(req.body.password, res.locals.user.password)
        .then((valid) => {
            if (!valid) {
                sendMsg(req, res, error.auth.wrongPassword);
                return;
            }

            prisma.user.delete({ where: { id: res.locals.user.id } })
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

exports.updateMe = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }

    _user.update(req, res, res.locals.user.id, false).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}
=======
import type express from 'express';
import { displayableUserPrivate, error, info, sendMsg } from '../../tools/translator';
import * as properties from '../../properties';
import bcrypt from 'bcrypt';
import { prisma } from '../../app';
import * as _user from './_common';

exports.getMe = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(200).json(displayableUserPrivate(res.locals.user));
}

exports.deleteMe = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!properties.checkPasswordField(req.body.password, req, res, false)) return;

    bcrypt.compare(req.body.password, res.locals.user.password)
        .then((valid) => {
            if (!valid) {
                sendMsg(req, res, error.auth.wrongPassword);
                return;
            }

            prisma.user.delete({ where: { id: res.locals.user.id } })
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

exports.updateMe = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    _user.update(req, res, res.locals.user.id, false).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}
>>>>>>> 90164db2887ff038926435f49aaf10c671d2018e
