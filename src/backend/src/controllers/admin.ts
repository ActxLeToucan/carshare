import type express from 'express';
import { prisma } from '../app';
import { type Prisma } from '@prisma/client';
import { displayableUser, error, info, sendMsg } from '../tools/translator';
import * as properties from '../properties';
import bcrypt from 'bcrypt';

exports.users = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const offset = Number.isNaN(req.query.offset) ? 0 : Math.max(0, Number(req.query.offset)); // default 0, min 0
    const limit = Number.isNaN(req.query.limit)
        ? properties.p.query.maxLimit // default
        : Math.min(properties.p.query.maxLimit,
            Math.max(properties.p.query.minLimit, Number(req.query.limit))
        ); // default max, min p.query.minLimit, max p.query.maxLimit

    prisma.user.findMany<Prisma.UserFindManyArgs>({
        skip: offset,
        take: limit,
        orderBy: [
            {
                id: 'asc'
            }
        ]
    })
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
    if (userId == null) return;

    prisma.user.delete({ where: { id: userId } })
        .then(() => { sendMsg(req, res, info.user.deleted); })
        .catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
}

exports.updateUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userId = properties.sanitizeUserId(req.params.id, req, res);
    if (userId == null) return;

    const { email, lastName, firstName, phone, hasCar, gender, mailNotif, level, password } = req.body;

    if (email !== undefined && !properties.checkEmailField(email, req, res)) return;
    if (password !== undefined && !properties.checkPasswordField(password, req, res)) return;
    if (lastName !== undefined && !properties.checkLastNameField(lastName, req, res)) return;
    if (firstName !== undefined && !properties.checkFirstNameField(firstName, req, res)) return;
    if (hasCar !== undefined && !properties.checkBooleanField(hasCar, req, res, 'hasCar')) return;
    if (mailNotif !== undefined && !properties.checkBooleanField(mailNotif, req, res, 'mailNotif')) return;
    if (level !== undefined && !properties.checkLevelField(level, req, res)) return;
    let _phoneSanitized;
    if (phone !== undefined) {
        _phoneSanitized = properties.sanitizePhone(phone, req, res);
        if (_phoneSanitized === null) return;
    }
    const phoneSanitized = _phoneSanitized;
    const genderSanitized = properties.sanitizeGender(gender);

    const data = {
        email,
        lastName,
        firstName,
        phone: phoneSanitized,
        hasCar,
        mailNotif,
        gender: genderSanitized,
        emailVerifiedOn: email !== undefined ? null : undefined,
        level,
        password
    };

    if (password !== undefined) {
        try {
            data.password = await bcrypt.hash(password, properties.p.password.salt);
        } catch (err) {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
            return;
        }
    }

    if (email !== undefined) {
        try {
            if (await prisma.user.count({ where: { email, id: { not: userId } } }) > 0) {
                sendMsg(req, res, error.email.exists);
                return;
            }
        } catch (err) {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
            return;
        }
    }

    prisma.user.update({ where: { id: userId }, data })
        .then(() => {
            sendMsg(req, res, info.user.updated);
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
}
