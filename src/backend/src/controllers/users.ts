import type express from 'express';
import { prisma } from '../app';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { displayableUserPrivate, error, info, mail, sendMail, sendMsg } from '../tools/translator';
import * as properties from '../properties';
import * as _user from './users/_common';
import { type Prisma } from '@prisma/client';

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
                        const token = jwt.sign(
                            {
                                userId: user.id,
                                type: 'access'
                            },
                            process.env.JWT_SECRET ?? 'secret',
                            { expiresIn: properties.p.token.access.expiration }
                        );
                        sendMsg(req, res, info.user.created, user, token);
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

                    const token = jwt.sign(
                        {
                            userId: user.id,
                            type: 'access'
                        },
                        process.env.JWT_SECRET ?? 'secret',
                        { expiresIn: properties.p.token.access.expiration }
                    );
                    sendMsg(req, res, info.user.loggedIn, user.id, token);
                }).catch((err) => {
                    console.error(err);
                    sendMsg(req, res, error.generic.internalError);
                });
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
}

exports.passwordResetSendEmail = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!properties.checkEmailField(req.body.email, req, res, false)) return;

    prisma.user.findUnique({ where: { email: req.body.email } })
        .then((user) => {
            if (user === null) {
                sendMsg(req, res, info.mailSent.passwordReset);
                return;
            }

            if (user.lastPasswordResetEmailedOn !== null && user.lastPasswordResetEmailedOn > new Date(Date.now() - properties.p.mailer.passwordReset.cooldown)) {
                sendMsg(req, res, error.mailer.cooldown, properties.p.mailer.passwordReset.cooldownTxt);
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
                .then(() => {
                    prisma.user.update({
                        where: { id: user.id },
                        data: { lastPasswordResetEmailedOn: new Date() }
                    }).then(() => {
                        sendMsg(req, res, info.mailSent.passwordReset);
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

exports.updatePassword = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }
    if (!properties.checkPasswordField(req.body.password, req, res)) return;
    if (!properties.checkOldPasswordField(req.body.oldPassword, req, res)) return;

    bcrypt.compare(req.body.oldPassword, res.locals.user.password)
        .then((valid) => {
            if (!valid) {
                sendMsg(req, res, error.auth.wrongPassword);
                return;
            }

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

    if (res.locals.user.emailVerifiedOn !== null) {
        sendMsg(req, res, error.email.alreadyVerified);
        return;
    }

    if (res.locals.user.lastEmailVerificationEmailedOn !== null && res.locals.user.lastEmailVerificationEmailedOn > new Date(Date.now() - properties.p.mailer.emailVerification.cooldown)) {
        sendMsg(req, res, error.mailer.cooldown, properties.p.mailer.emailVerification.cooldownTxt);
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
        .then(() => {
            prisma.user.update({
                where: { id: res.locals.user.id },
                data: { lastEmailVerificationEmailedOn: new Date() }
            }).then(() => {
                sendMsg(req, res, info.mailSent.emailVerification);
            }).catch((err) => {
                console.error(err);
                sendMsg(req, res, error.generic.internalError);
            });
        }).catch((err) => {
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

exports.getAllUsers = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const offset = Number.isNaN(Number(req.query.offset)) ? 0 : Math.max(0, Number(req.query.offset)); // default 0, min 0
    const limit = Number.isNaN(Number(req.query.limit))
        ? properties.p.query.maxLimit // default
        : Math.min(properties.p.query.maxLimit,
            Math.max(properties.p.query.minLimit, Number(req.query.limit))
        ); // default max, min p.query.minLimit, max p.query.maxLimit

    const lastName = String(req.query.lastName ?? '');
    const firstName = String(req.query.firstName ?? '');
    const email = String(req.query.email ?? '');

    const where: {lastName?: any, firstName?: any, email?: any} = {};
    if (lastName !== '') { where.lastName = { startsWith: lastName }; }
    if (firstName !== '') { where.firstName = { startsWith: firstName }; }
    if (email !== '') { where.email = { startsWith: email }; }

    prisma.user.findMany<Prisma.UserFindManyArgs>({
        where,
        skip: offset,
        take: limit,
        orderBy: [
            {
                id: 'asc'
            }
        ]
    })
        .then(users => {
            res.status(200).json(users.map(displayableUserPrivate));
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
