import type express from 'express';
import { prisma } from '../app';
import { error, sendMsg } from '../tools/translator';
import { checkDateField } from '../properties'; 
import { Etape } from '@prisma/client';

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
    if (typeof req.body.start_city !== 'string' || typeof req.body.end_city !== 'string') {
        sendMsg(req, res, error.ville.type);
        return false;
    }
    if (!checkDateField(req.body.date, req, res)) return;

    // Query Etape table to get all stages starting at the start_city
    let starting_stages: Etape[] = [];
    prisma.etape.findMany({
        where: {
            city: req.body.start_city,
        },
    }).then((data) => {
        starting_stages = data;
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });

    // Initialize a list to store the resulting Travel records
    let travels = [];
    let ending_stages: Etape[] = [];

    // Loop through all starting stages
    for (let starting_stage of starting_stages) {
        // Query Etape table to get all stages ending at the end_city and having a higher order than the starting stage
        prisma.etape.findMany({
            where: {
                city: req.body.end_city,
                order: {
                    gt: starting_stage.order,
                },
                travelId: starting_stage.travelId
            }
        }).then((data) => {
            ending_stages = data;
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
    }

    // Loop through all ending stages
    for (let ending_stage of ending_stages) {
        // Append the Travel record to the list of resulting travels
        travels.push(ending_stage.travelId);
    }

    // Get all tavels and return them in JSON
    prisma.travel.findMany({
        where: {
            id: {
                in: travels
            }
        }
    }).then((data) => {
        res.status(200).json(data);
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}
