import type express from 'express';
import { prisma } from '../app';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { displayableUser, error, info, sendMsg } from '../messages';
import * as constraints from '../constraints';

exports.signup = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!constraints.checkEmailField(req.body.email, req, res)) return;
    if (!constraints.checkPasswordField(req.body.password, req, res)) return;
    if (!constraints.checkLastNameField(req.body.lastName, req, res)) return;
    if (!constraints.checkFirstNameField(req.body.firstName, req, res)) return;
    const phoneNum = constraints.sanitizePhone(req.body.phone, req, res);
    if (phoneNum === null) return;
    const gender = constraints.sanitizeGender(req.body.gender);

    prisma.user.count({ where: { email: req.body.email } })
        .then((count) => {
            if (count > 0) {
                sendMsg(req, res, error.email.exists);
                return;
            }

            bcrypt.hash(req.body.password, constraints.constraints.password.salt)
                .then((hash) => {
                    prisma.user.create({
                        data: {
                            email: req.body.email,
                            password: hash,
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            phone: phoneNum,
                            avatar: null,
                            gender,
                            hasCar: req.body.hasCar
                        }
                    }).then((user) => {
                        const msg = info.user.created(req, res);
                        res.status(msg.code).json({
                            message: msg.msg,
                            user: displayableUser(user),
                            token: jwt.sign(
                                { userId: user.id },
                                process.env.JWT_SECRET ?? 'secret',
                                { expiresIn: '24h' }
                            )
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

exports.login = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!constraints.checkEmailField(req.body.email, req, res, false)) return;
    if (!constraints.checkPasswordField(req.body.password, req, res, false)) return;

    prisma.user.findUnique({ where: { email: req.body.email } })
        .then((user) => {
            if (user === null) {
                sendMsg(req, res, error.auth.invalidCredentials);
                return;
            }

            bcrypt.compare(req.body.password, user.password)
                .then((valid) => {
                    if (!valid) {
                        sendMsg(req, res, error.auth.invalidCredentials);
                        return;
                    }

                    const msg = info.user.loggedIn(req, res);
                    res.status(msg.code).json({
                        message: msg.msg,
                        userId: user.id,
                        token: jwt.sign(
                            { userId: user.id },
                            process.env.JWT_SECRET ?? 'secret',
                            { expiresIn: '24h' }
                        )
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

    prisma.user.delete({ where: { id: res.locals.user.id } })
        .then(() => {
            sendMsg(req, res, info.user.deleted);
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
}

exports.updateMe = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    sendMsg(req, res, error.generic.notImplemented);
}

exports.routeList = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }
    sendMsg(req, res, error.generic.notImplemented);
}
