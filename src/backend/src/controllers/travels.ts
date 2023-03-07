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

    // Initialize a list to store the resulting Travel records
    let travels: number[] = [];
    let ending_stages: Etape[] = [];
    let starting_stages: Etape[] = [];

    // Query Etape table to get all stages starting at the start_city
    prisma.etape.findMany({
        where: {
            city: req.body.start_city,
        },
    }).then((starting_stages) => {
        // Loop through all starting stages
        for (let starting_stage of starting_stages) {
            // Query Etape table to get all stages ending at the end_city and having a higher order than the starting stage
            prisma.etape.findFirst({
                where: {
                    city: req.body.end_city,
                    order: {
                        gt: starting_stage.order,
                    },
                    travelId: starting_stage.travelId
                }
            }).then((ending_stage) => {
                // Append the Travel record to the list of resulting travels
                if (ending_stage) travels.push(ending_stage.travelId);
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
            return
        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });
    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });
}
