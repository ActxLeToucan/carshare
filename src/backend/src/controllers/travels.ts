import type express from 'express';
import { prisma } from '../app';
import { error, sendMsg } from '../tools/translator';
import { checkDateField } from '../properties'; 

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

exports.serchTravels = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }
    if (typeof req.body.ville1 !== 'string' || typeof req.body.ville2 !== 'string') {
        sendMsg(req, res, error.ville.type);
        return false;
    }
    if (!checkDateField(req.body.date, req, res)) return;

    prisma.travel.findMany({
        where: {
            AND: [
                {
                    etapes: { 
                        some: {
                            city: req.body.ville1
                        }
                    }
                },
                {
                    etapes: { 
                        some: {
                            city: req.body.ville2,
                            order: {
                                gt: {
                                    select: {
                                        order: true
                                    },
                                    where: {
                                        city: req.body.ville1
                                    }
                                }
                            }
                        }
                    }
                },
                {
                    departureDate: { lte:req.body.date }
                }
            ],
            
        },
        select: {
            id: true,
            departureDate: true,
            arrivalDate: true,
            etapes: true
        }

    }).then((data) => {


        res.status(200).json();
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}
