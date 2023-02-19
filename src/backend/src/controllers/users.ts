import type express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { displayableUser, error, info, sendMsg } from '../messages';
import * as constraints from '../constraints';

const prisma = new PrismaClient();

exports.signup = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!constraints.checkEmailField(req.body.email, req, res)) return;
    if (!constraints.checkPasswordField(req.body.password, req, res)) return;
    if (!constraints.checkLastNameField(req.body.lastName, req, res)) return;
    if (!constraints.checkFirstNameField(req.body.firstName, req, res)) return;
    const phoneNum = constraints.sanitizePhone(req.body.phone, req, res);
    if (phoneNum === null) return;
    const gender = constraints.sanitizeGender(req.body.gender);

    prisma.user.count({
        where: {
            email: req.body.email
        }
    }).then((count) => {
        if (count > 0) {
            sendMsg(req, res, error.email.exists);
            return;
        }

        bcrypt.hash(req.body.password, constraints.constraints.password.salt).then((hash) => {
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
