import validator from '../../tools/validator';
import { prisma } from '../../app';
import { error, info, sendMsg } from '../../tools/translator';
import type express from 'express';
import sanitizer from '../../tools/sanitizer';

/**
 * Update a user
 * The response will be sent by the function
 * @param req Express request
 * @param res Express response
 * @param userId ID of the user to update
 * @param asAdmin Weather to update as an admin or not (admin can update level)
 */
async function update (req: express.Request, res: express.Response, userId: number, asAdmin: boolean) {
    const { email, lastName, firstName, phone, hasCar, gender, level } = req.body;

    if (email !== undefined && !validator.email(email, true, req, res)) return;
    if (lastName !== undefined && !validator.lastName(lastName, true, req, res)) return;
    if (firstName !== undefined && !validator.firstName(firstName, true, req, res)) return;
    if (hasCar !== undefined && !validator.typeBoolean(hasCar, true, req, res, 'hasCar')) return;
    if (asAdmin && level !== undefined && !validator.level(level, true, req, res)) return;
    let _phoneSanitized;
    if (phone !== undefined) {
        _phoneSanitized = sanitizer.phone(phone, true, req, res);
        if (_phoneSanitized === null) return;
    }
    const phoneSanitized = _phoneSanitized;
    const genderSanitized = sanitizer.gender(gender, false, req, res);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user === null) {
        sendMsg(req, res, error.user.notFound);
        return;
    }

    const data = {
        email,
        lastName,
        firstName,
        phone: phoneSanitized,
        hasCar,
        gender: genderSanitized,
        emailVerifiedOn: email !== undefined && email !== user.email ? null : undefined,
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

            sendMsg(req, res, info.user.updated, user);
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
}

export { update };
