import type express from 'express';
import { prisma } from '../app';
import { error, sendMsg } from '../tools/translator';
import { checkDateField, sanitizeCityName } from '../properties';

exports.myTravels = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }

    prisma.user.findMany({
        where: { id: res.locals.user.id },
        select: {
            travelsAsDriver: true,
            travelsAsPassenger: { select: { travel: true } }

        }

    }).then(travel => {
        res.status(200).json(travel);
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}

exports.searchTravels = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }
    const startCity = sanitizeCityName(req.body.startCity, req, res);
    const endCity = sanitizeCityName(req.body.endCity, req, res);
    if (startCity === null) return;
    if (endCity === null) return;
    if (!checkDateField(req.body.date, req, res)) return;

    const travels = await prisma.$executeRaw`
        SELECT DISTINCT travel.*
        FROM travel
        JOIN etape AS start_stage ON start_stage.travelId = travel.id
        JOIN etape AS end_stage ON end_stage.travelId = travel.id
        WHERE start_stage.city = ${startCity}
        AND end_stage.city = ${endCity}
        AND start_stage.order < end_stage.order
    `;

    res.status(200).json(travels);
}
