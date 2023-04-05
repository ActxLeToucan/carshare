import type express from 'express';
import { prisma } from '../app';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { displayableUserMinimal, displayableUserPrivate, error, info, mail, notifs, sendMail, sendMsg } from '../tools/translator';
import validator from '../tools/validator';
import * as _user from './users/_common';
import { preparePagination } from './_common';
import { MailerError } from '../tools/mailer';
import { type User } from '@prisma/client';
import properties from '../properties';
import sanitizer from '../tools/sanitizer';

exports.signup = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const { email, password, lastName, firstName, phone, hasCar, gender, timezone } = req.body;

    if (!validator.email(email, true, req, res)) return;
    if (!validator.password(password, true, req, res)) return;
    if (!validator.lastName(lastName, true, req, res)) return;
    if (!validator.firstName(firstName, true, req, res)) return;
    const phoneSanitized = sanitizer.phone(phone, true, req, res);
    if (phoneSanitized === null) return;
    if (hasCar !== undefined && !validator.typeBoolean(hasCar, true, req, res, 'hasCar')) return;
    const genderSanitized = sanitizer.gender(gender, false, req, res);
    let timezoneSanitized: string | undefined;
    if (timezone !== undefined && timezone !== null) {
        timezoneSanitized = sanitizer.timezone(timezone, false, req, res);
    }

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
                            gender: genderSanitized,
                            lang: req.acceptsLanguages().find((lang) => properties.languages.includes(lang)), // detect language from browser
                            timezone: timezoneSanitized
                        }
                    }).then((user) => {
                        const notif = notifs.general.welcome(user);
                        prisma.notification.create({
                            data: {
                                user: { connect: { id: user.id } },
                                title: notif.title,
                                message: notif.message,
                                type: 'standard'
                            }
                        }).then(() => {
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
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
}

exports.login = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    if (!validator.email(req.body.email, true, req, res, false)) return;
    if (!validator.password(req.body.password, true, req, res, false)) return;

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
    if (!validator.email(req.body.email, true, req, res, false)) return;

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
    exports.updatePassword(req, res, next, false);
}

exports.updatePassword = async (req: express.Request, res: express.Response, _: express.NextFunction, checkOld = true) => {
    if (!validator.password(req.body.password, true, req, res)) return;
    if (checkOld && !validator.passwordOld(req.body.oldPassword, true, req, res)) return;

    if (checkOld) {
        try {
            const valid = await bcrypt.compare(req.body.oldPassword, res.locals.user.password);
            if (!valid) {
                sendMsg(req, res, error.auth.wrongPassword);
                return;
            }
        } catch (err) {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        }
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

exports.searchUsers = (req: express.Request, res: express.Response, _: express.NextFunction, asAdmin = true) => {
    const pagination = preparePagination(req, true);

    const q = `%${pagination.query ?? ''}%`;

    prisma.$queryRaw`SELECT COUNT(*) AS count
                     FROM user
                     WHERE IF(${pagination.query !== undefined}, email LIKE ${q}
                        OR (IF(${asAdmin}, phone LIKE ${q}, FALSE))
                        OR CONCAT(firstName, ' ', lastName) LIKE ${q}, TRUE)`
        .then((count: any) => {
            prisma.$queryRaw`SELECT *
                     FROM user
                     WHERE IF(${pagination.query !== undefined}, email LIKE ${q}
                         OR (IF(${asAdmin}, phone LIKE ${q}, FALSE))
                         OR CONCAT(firstName, ' ', lastName) LIKE ${q}, TRUE)
                     LIMIT ${pagination.pagination.take} OFFSET ${pagination.pagination.skip}`
                .then(users => {
                    res.status(200).json(pagination.results((users as User[]).map(asAdmin ? displayableUserPrivate : displayableUserMinimal), Number(count[0].count)));
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
    const userId = sanitizer.id(req.params.id, true, req, res);
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
    const userId = sanitizer.id(req.params.id, true, req, res);
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

exports.searchUsersPublic = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    return exports.searchUsers(req, res, _, false);
}
