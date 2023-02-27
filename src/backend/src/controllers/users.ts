import type express from 'express';
import { prisma } from '../app';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { displayableUser, error, info, mail, sendMail, sendMsg } from '../tools/translator';
import * as properties from '../properties';

exports.signup = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { email, password, lastName, firstName, phone, hasCar, gender } = req.body;

    if (!properties.checkEmailField(email, req, res)) return;
    if (!properties.checkPasswordField(password, req, res)) return;
    if (!properties.checkLastNameField(lastName, req, res)) return;
    if (!properties.checkFirstNameField(firstName, req, res)) return;
    const phoneSanitized = properties.sanitizePhone(phone, req, res);
    if (phoneSanitized === null) return;
    if (hasCar !== undefined && !properties.checkBooleanField(hasCar, req, res, 'hasCar')) return;
    const genderSanitized = properties.sanitizeGender(gender);

    prisma.user.count({ where: { email } })
        .then((count) => {
            if (count > 0) {
                sendMsg(req, res, error.email.exists);
                return;
            }

            bcrypt.hash(password, properties.p.password.salt)
                .then((hash) => {
                    prisma.user.create({
                        data: {
                            email,
                            password: hash,
                            firstName,
                            lastName,
                            phone: phoneSanitized,
                            avatar: null,
                            hasCar,
                            gender: genderSanitized
                        }
                    }).then((user) => {
                        const msg = info.user.created(req, res);
                        res.status(msg.code).json({
                            message: msg.msg,
                            user: displayableUser(user),
                            token: jwt.sign(
                                {
                                    userId: user.id,
                                    type: 'access'
                                },
                                process.env.JWT_SECRET ?? 'secret',
                                { expiresIn: properties.p.token.access.expiration }
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
    if (!properties.checkEmailField(req.body.email, req, res, false)) return;
    if (!properties.checkPasswordField(req.body.password, req, res, false)) return;

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
                            {
                                userId: user.id,
                                type: 'access'
                            },
                            process.env.JWT_SECRET ?? 'secret',
                            { expiresIn: properties.p.token.access.expiration }
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

    if (!properties.checkPasswordField(req.body.password, req, res, false)) return;

    bcrypt.compare(req.body.password, res.locals.user.password)
        .then((valid) => {
            if (!valid) {
                sendMsg(req, res, error.auth.invalidCredentials);
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
    sendMsg(req, res, error.generic.notImplemented);
}

exports.passwordResetSendEmail = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!properties.checkEmailField(req.body.email, req, res, false)) return;

    prisma.user.findUnique({ where: { email: req.body.email } })
        .then((user) => {
            if (user === null) {
                sendMsg(req, res, info.mailSent.passwordReset);
                return;
            }

            const token = jwt.sign(
                {
                    userId: user.id,
                    type: 'resetPassword'
                },
                process.env.JWT_SECRET ?? 'secret',
                { expiresIn: properties.p.token.passwordReset.expiration }
            );

            const frontendPath = `${String(process.env.FRONTEND_URL)}/password-reset`;

            sendMail(req, mail.password.reset, user, token, frontendPath)
                .then(() => { sendMsg(req, res, info.mailSent.passwordReset); })
                .catch((err) => {
                    console.error(err);
                    sendMsg(req, res, error.generic.internalError);
                });
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
}

exports.passwordReset = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }
    if (!properties.checkPasswordField(req.body.password, req, res)) return;

    bcrypt.hash(req.body.password, properties.p.password.salt)
        .then((hash) => {
            prisma.user.update({
                where: { id: res.locals.user.id },
                data: { password: hash }
            }).then(() => {
                sendMsg(req, res, info.user.passwordChanged);
            }).catch((err) => {
                console.error(err);
                sendMsg(req, res, error.generic.internalError);
            });
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
}

exports.emailVerificationSendEmail = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }

    const token = jwt.sign(
        {
            userId: res.locals.user.id,
            type: 'verify'
        },
        process.env.JWT_SECRET ?? 'secret',
        { expiresIn: properties.p.token.verify.expiration }
    );

    sendMail(req, mail.email.verification, res.locals.user, token)
        .then(() => { sendMsg(req, res, info.mailSent.emailVerification); })
        .catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
}

exports.emailVerification = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }

    prisma.user.update({
        where: { id: res.locals.user.id },
        data: { emailVerifiedOn: new Date() }
    }).then(() => {
        sendMsg(req, res, info.user.emailVerified);
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}
