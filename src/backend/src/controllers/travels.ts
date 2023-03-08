import type express from 'express';
import { prisma } from '../app';
import { error, sendMsg } from '../tools/translator';
import { checkCityField, checkDateField } from '../properties';

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

exports.searchTravels = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }

    const { date, startCity, endCity } = req.body;
    if (!checkCityField(startCity, req, res, 'startCity')) return;
    if (!checkCityField(endCity, req, res, 'endCity')) return;
    if (!checkDateField(date, req, res)) return;

    const date1 = new Date(new Date(date).getTime() - 1000 * 60 * 60);
    const date2 = new Date(new Date(date).getTime() + 1000 * 60 * 60);

    // TODO: verifier les dates sur les etapes
    prisma.$queryRaw`select t.* from travel t
    inner join etape e1 on e1.travelId = t.id and e1.city = ${startCity}
    inner join etape e2 on e2.travelId = t.id and e2.city = ${endCity}
    where e1.\`order\` < e2.\`order\` and t.arrivalDate BETWEEN ${date1} and ${date2}`
        .then((data) => {
            res.status(200).json(data);
        }).catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
}
