import type express from 'express';
import { prisma } from '../app';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { displayableUserPrivate, error, info, mail, sendMail, sendMsg } from '../tools/translator';
import * as validator from '../tools/validator';
import * as _user from './users/_common';
import { preparePagination } from './_common';
import { MailerError } from '../tools/mailer';
import { type User } from '@prisma/client';
import properties from '../properties';

exports.signup = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const { email, password, lastName, firstName, phone, hasCar, gender } = req.body;

    if (!validator.checkEmailField(email, req, res)) return;
    if (!validator.checkPasswordField(password, req, res)) return;
    if (!validator.checkLastNameField(lastName, req, res)) return;
    if (!validator.checkFirstNameField(firstName, req, res)) return;
    const phoneSanitized = validator.sanitizePhone(phone, req, res);
    if (phoneSanitized === null) return;
    if (hasCar !== undefined && !validator.checkBooleanField(hasCar, req, res, 'hasCar')) return;
    const genderSanitized = validator.sanitizeGender(gender);

    prisma.user.count({ where: { email } })
        .then((count) => {
            if (count > 0) {
                sendMsg(req, res, error.email.exists);
                return;
            }

            bcrypt.hash(password, properties.password.salt)
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
                            { expiresIn: properties.token.access.expiration }
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

exports.login = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    if (!validator.checkEmailField(req.body.email, req, res, false)) return;
    if (!validator.checkPasswordField(req.body.password, req, res, false)) return;

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
                        { expiresIn: properties.token.access.expiration }
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

exports.askForPasswordReset = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    if (!validator.checkEmailField(req.body.email, req, res, false)) return;

    prisma.user.findUnique({ where: { email: req.body.email } })
        .then((user) => {
            if (user === null) {
                sendMsg(req, res, info.mailSent.passwordReset);
                return;
            }

            if (user.lastPasswordResetEmailedOn !== null && user.lastPasswordResetEmailedOn > new Date(Date.now() - properties.mailer.passwordReset.cooldown)) {
                sendMsg(req, res, error.mailer.cooldown, properties.mailer.passwordReset.cooldownTxt);
                return;
            }

            const token = jwt.sign(
                {
                    userId: user.id,
                    type: 'resetPassword'
                },
                process.env.JWT_SECRET ?? 'secret',
                { expiresIn: properties.token.passwordReset.expiration }
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
            if (err instanceof MailerError) {
                sendMsg(req, res, error.mailer.disabled);
                return;
            }
            sendMsg(req, res, error.generic.internalError);
        });
}

exports.resetPassword = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    exports.updatePassword(req, res, next);
}

exports.updatePassword = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    if (!validator.checkPasswordField(req.body.password, req, res)) return;
    if (!validator.checkOldPasswordField(req.body.oldPassword, req, res)) return;

    bcrypt.compare(req.body.oldPassword, res.locals.user.password)
        .then((valid) => {
            if (!valid) {
                sendMsg(req, res, error.auth.wrongPassword);
                return;
            }

            bcrypt.hash(req.body.password, properties.password.salt)
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

exports.askForEmailVerification = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    if (res.locals.user.emailVerifiedOn !== null) {
        sendMsg(req, res, error.email.alreadyVerified);
        return;
    }

    if (res.locals.user.lastEmailVerificationEmailedOn !== null && res.locals.user.lastEmailVerificationEmailedOn > new Date(Date.now() - properties.mailer.emailVerification.cooldown)) {
        sendMsg(req, res, error.mailer.cooldown, properties.mailer.emailVerification.cooldownTxt);
        return;
    }

    const token = jwt.sign(
        {
            userId: res.locals.user.id,
            type: 'verify'
        },
        process.env.JWT_SECRET ?? 'secret',
        { expiresIn: properties.token.verify.expiration }
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
            if (err instanceof MailerError) {
                sendMsg(req, res, error.mailer.disabled);
                return;
            }
            sendMsg(req, res, error.generic.internalError);
        });
}

exports.emailVerification = (req: express.Request, res: express.Response, _: express.NextFunction) => {
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

exports.searchUsers = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const pagination = preparePagination(req, true);

    const q = `%${pagination.query ?? ''}%`;

    prisma.$queryRaw`SELECT COUNT(*) AS count
                        FROM user
                        WHERE IF(${pagination.query !== undefined}, email LIKE ${q}
                            OR phone LIKE ${q}
                            OR CONCAT(firstName, ' ', lastName) LIKE ${q}, TRUE)`
        .then((count: any) => {
            prisma.$queryRaw`SELECT *
                     FROM user
                     WHERE IF(${pagination.query !== undefined}, email LIKE ${q}
                         OR phone LIKE ${q}
                         OR CONCAT(firstName, ' ', lastName) LIKE ${q}, TRUE)
                     LIMIT ${pagination.pagination.take} OFFSET ${pagination.pagination.skip}`
                .then(users => {
                    res.status(200).json(pagination.results((users as User[]).map(displayableUserPrivate), Number(count[0].count)));
                }).catch(err => {
                    console.error(err);
                    sendMsg(req, res, error.generic.internalError);
                });
        }).catch(err => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
}

exports.deleteUser = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const userId = validator.sanitizeId(req.params.id, req, res);
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
                .then(() => {
                    sendMsg(req, res, info.user.deleted);
                })
                .catch((err) => {
                    console.error(err);
                    sendMsg(req, res, error.generic.internalError);
                });
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
}

exports.updateUser = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const userId = validator.sanitizeId(req.params.id, req, res);
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
