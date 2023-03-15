import { User } from '@prisma/client';
import type express from 'express';
import { prisma } from '../app';
import * as properties from '../properties';
import { error, info, sendMsg} from '../tools/translator';
import { preparePagination } from './_common';

exports.getMyTravels = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const pagination = preparePagination(req, false);

    prisma.user.findMany({
        where: { id: res.locals.user.id },
        select: {
            travelsAsDriver: true,
            travelsAsPassenger: { select: { travel: true } }
        },
        ...pagination.pagination
    }).then(travels => {
        res.status(200).json(pagination.results(travels));
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}

exports.searchTravels = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const { date, startCity, startContext, endCity, endContext } = req.query;
    if (!properties.checkCityField(startCity, req, res, 'startCity')) return;
    if (!properties.checkCityField(endCity, req, res, 'endCity')) return;
    if (!properties.checkDateField(date, req, res)) return;
    if (startContext !== undefined && !properties.checkStringField(startContext, req, res, 'startContext')) return;
    if (endContext !== undefined && !properties.checkStringField(endContext, req, res, 'endContext')) return;

    const startCtx = startContext === undefined ? '' : startContext;
    const endCtx = endContext === undefined ? '' : endContext;

    const date1 = new Date(new Date(date as string).getTime() - 1000 * 60 * 60);
    const date2 = new Date(new Date(date as string).getTime() + 1000 * 60 * 60);

    // TODO: verifier les dates sur les etapes
    prisma.$queryRaw`select t.*
                     from travel t
                              inner join etape e1 on e1.travelId = t.id and e1.city = ${startCity}
                              inner join etape e2 on e2.travelId = t.id and e2.city = ${endCity}
                     where e1.\`order\` < e2.\`order\`
                       and IF(${startCtx} = '', true, e1.context = ${startCtx})
                       and IF(${endCtx} = '', true, e2.context = ${endCtx})
                       and t.arrivalDate BETWEEN ${date1} and ${date2}`
        .then((data) => {
            res.status(200).json(data);
        }).catch((err) => {
            console.log(err);
            res.status(500).json(err);
        });
}

exports.createTravel = async (req: express.Request, res: express.Response, _: express.NextFunction) => {
    const { departureDate, arrivalDate, maxPassengers, price, description, groupId, listOfEtape } = req.body;

    if (!properties.checkDateDepartArrivalField(departureDate, req, res)) return;
    if (!properties.checkDateDepartArrivalField(arrivalDate, req, res)) return;
    if (!properties.checkMaxPassengersField(maxPassengers, req, res)) return;
    if (!properties.checkPriceField(price, req, res)) return;
    if (!properties.checkDescriptionField(description, req, res, 'description')) return;

    if (typeof groupId === 'number') {
        try {
            const count = await prisma.group.count({ where: { id: groupId } });

            if (count === 0) {
                sendMsg(req, res, error.group.notFound);
                return;
            }
        } catch (err) {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
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

exports.cancelTravel = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }

    const travel = req.body.travel;

    if ( !(res.locals.user.id === travel.driver.id) && !(res.locals.user.level >= 1) ) {
        sendMsg(req, res, error.auth.insufficientPrivileges);
        return;
    }

    const dateCheck = new Date(new Date(travel.date).getTime() - 1000 * 60 * 60 * 24);

    if ( !(travel.passagers === undefined || travel.passagers.length == 0) && dateCheck <= new Date() ) {
        sendMsg(req, res, error.travel.unableToCancel);
        return;
    }

    prisma.travel.update({
        where: { id: travel.id },
        data: { status: -1 }
    }).then(() => {
        sendMsg(req, res, info.travel.successfulCancel);
        if ( travel.passagers !== undefined || travel.passagers.length > 0 ){
            //TODO Translator for notifications
            properties.sendNotification(travel.id, travel.passagers.array, "todo annulation", "todo message annulation", req, res);
        }
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}
