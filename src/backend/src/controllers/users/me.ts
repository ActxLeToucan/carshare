import type express from 'express';
import { displayableUserPrivate, error, info, sendMsg } from '../../tools/translator';
import validator from '../../tools/validator';
import bcrypt from 'bcrypt';
import { prisma } from '../../app';
import * as _user from './_common';

const usersController = require('../../controllers/users');

exports.getMe = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    res.status(200).json(displayableUserPrivate(res.locals.user));
}

exports.deleteMe = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    if (!validator.password(req.body.password, true, req, res, false)) return;

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

exports.updateMe = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    _user.update(req, res, res.locals.user.id, false).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}

exports.updateMyPassword = usersController.updatePassword;
