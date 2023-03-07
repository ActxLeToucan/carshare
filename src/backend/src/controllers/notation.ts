import type express from 'express';
import {prisma} from '../app';
import {error, info, sendMsg} from '../tools/translator';
import * as properties from '../properties';


exports.getUserEvaluation = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.locals.user === undefined) {
        sendMsg(req, res, error.auth.noToken);
        return;
    }
    const userId = properties.sanitizeUserId(req.params.id, req, res);
    if (userId === null) return;


    prisma.evaluation.aggregate({
        where: {
            evaluatedId: userId

        },
        _avg: {
            note: true,
        },
        _count: {
            note: true,
        }

    }).then((evaluated) => {
        prisma.evaluation.aggregate({
            where: {
                evaluatorId: userId

            },
            _avg: {
                note: true,
            },
            _count: {
                note: true,
            }

        }).then((evaluator) => {

            res.status(200).json({ evaluated : evaluated, evaluator: evaluator});

        }).catch((err) => {
            console.error(err);
            sendMsg(req, res, error.generic.internalError);
        });

    }).catch((err) => {
        console.error(err);
        sendMsg(req, res, error.generic.internalError);
    });

}