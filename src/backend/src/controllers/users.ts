import type express from 'express';
import { PrismaClient } from '@prisma/client';
import { error, sendMsg } from '../messages';
import * as constraints from '../constraints';

const prisma = new PrismaClient();

exports.signup = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!constraints.checkEmailField(req.body.email, req, res)) return;
    if (!constraints.checkPasswordField(req.body.password, req, res)) return;
    if (!constraints.checkLastNameField(req.body.lastname, req, res)) return;
    if (!constraints.checkFirstNameField(req.body.firstname, req, res)) return;
    if (!constraints.checkBirthDateField(req.body.birthdate, req, res)) return;
    const phoneNum = constraints.sanitizePhone(req.body.phone, req, res);
    const gender = req.body.gender;
    const hasCar = req.body.car;

    console.log('optional fields:');
    console.log(`phone: ${phoneNum ?? 'null'}`);
    console.log(`gender: ${typeof gender}`);
    console.log(`car: ${typeof hasCar}`);

    prisma.user.count({
        where: {
            email: req.body.email
        }
    }).then((count) => {
        if (count > 0) {
            sendMsg(req, res, error.email.alreadyExists);
            return;
        }

        // TODO: hash password

        // TODO: create user
        sendMsg(req, res, error.generic.notImplemented);
    }).catch((err) => {
        console.log(err);
        sendMsg(req, res, error.generic.internalError);
    });
}
