import * as properties from '../../properties';
import { prisma } from '../../app';
import { displayableUser, error, info, sendMsg } from '../../tools/translator';
import type express from 'express';

/**
 * Update a user
 * The response will be sent by the function
 * @param req Express request
 * @param res Express response
 * @param userId ID of the user to update
 * @param asAdmin Weather to update as an admin or not (admin can update level)
 */
async function update (req: express.Request, res: express.Response, userId: number, asAdmin: boolean) {
    const { email, lastName, firstName, phone, hasCar, gender, mailNotif, level } = req.body;

    if (email !== undefined && !properties.checkEmailField(email, req, res)) return;
    if (lastName !== undefined && !properties.checkLastNameField(lastName, req, res)) return;
    if (firstName !== undefined && !properties.checkFirstNameField(firstName, req, res)) return;
    if (hasCar !== undefined && !properties.checkBooleanField(hasCar, req, res, 'hasCar')) return;
    if (mailNotif !== undefined && !properties.checkBooleanField(mailNotif, req, res, 'mailNotif')) return;
    if (asAdmin && level !== undefined && !properties.checkLevelField(level, req, res)) return;
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
        level: asAdmin ? level : undefined
    };

    if (email !== undefined) {
        try {
            if (await prisma.user.count({ where: { email, id: { not: userId } } }) > 0) {
                sendMsg(req, res, error.email.exists);
                return;
            }
        } catch (err) {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        }
    }

    prisma.user.update({ where: { id: userId }, data })
        .then((user) => {
            if (user === null) {
                sendMsg(req, res, error.user.notFound);
                return;
            }

            const msg = info.user.updated(req);
            res.status(msg.code).json({
                message: msg.msg,
                user: displayableUser(user)
            });
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
}

export { update };
