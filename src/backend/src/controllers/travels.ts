import type express from 'express';
import { prisma } from '../app';
import * as properties from '../properties';
import { error, info, sendMsg } from '../tools/translator';

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

exports.createTravels = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }

    const { departureDate, arrivalDate, maxPassengers, price, description, groupId, listOfEtape } = req.body;

    if (!properties.checkDateDepartArrivalField(departureDate, req, res)) return;
    if (!properties.checkDateDepartArrivalField(arrivalDate, req, res)) return;

    if (maxPassengers !== undefined && maxPassengers !== null && typeof maxPassengers !== 'number') {
        sendMsg(req, res, error.number.type, 'maxPassengers');
        return false;
    }

    if (price !== undefined && price !== null && typeof price !== 'number') {
        sendMsg(req, res, error.number.type, 'price');
        return false;
    }

    if (typeof description !== 'string' && description !== undefined && description !== null) {
        sendMsg(req, res, error.string.type, 'description');
        return false;
    }

    if (typeof groupId === 'number') {
        const count = await prisma.group.count({ where: { id: groupId } });

        if (count === 0) {
            sendMsg(req, res, error.group.notFound);
            return;
        }
    }

    if (!properties.checkListOfEtapeField(listOfEtape, req, res)) return;

    prisma.travel.create({
        data: {
            departureDate,
            arrivalDate,
            maxPassengers,
            price,
            description,
            driverId: res.locals.user.id,
            groupId
        }
    }).then((travel) => {
        const data = Array.from({ length: listOfEtape.length }).map((value, index, array) => ({

            label: listOfEtape[index].label,
            city: listOfEtape[index].city,
            context: listOfEtape[index].context,
            lat: listOfEtape[index].lat,
            lng: listOfEtape[index].lng,
            travelId: travel.id,
            order: index
        }))

        prisma.etape.createMany({
            data
        }).then((etape) => {
            sendMsg(req, res, info.travel.created, travel, etape);
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}
