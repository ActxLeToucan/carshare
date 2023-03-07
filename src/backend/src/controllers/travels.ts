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

exports.searchTravels = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }
    if (typeof req.body.startCity !== 'string' || typeof req.body.endCity !== 'string') {
        sendMsg(req, res, error.ville.type);
        return false;
    }
    if (!checkDateField(req.body.date, req, res)) return;

    // Initialize a list to store the resulting Travel records
    const travels: number[] = [];

    // Query Etape table to get all stages starting at the start_city
    prisma.etape.findMany({
        where: {
            city: req.body.startCity
        }
    }).then(async (startingStages) => {
        // Loop through all starting stages
        for (const startingStage of startingStages) {
            // Query Etape table to get all stages ending at the end_city and having a higher order than the starting stage
            await prisma.etape.findFirst({
                where: {
                    city: req.body.endCity,
                    order: {
                        gt: startingStage.order
                    },
                    travelId: startingStage.travelId
                }
            }).then((endingStage) => {
                // Append the Travel record to the list of resulting travels
                if (endingStage != null) travels.push(endingStage.travelId);
            }).catch((err) => {
                console.error(err);
                sendMsg(req, res, error.generic.internalError);
            });
        }
        // Get all tavels and return them in JSON
        prisma.travel.findMany({
            where: {
                id: {
                    in: travels
                }
            }
        }).then((data) => {
            console.log(data);
            res.status(200).json(data);
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}
