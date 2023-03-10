import jwt from 'jsonwebtoken';
import type express from 'express';
import { error, sendMsg } from '../tools/translator';
import { prisma } from '../app';

export type AuthType = 'access' | 'resetPassword' | 'verify';

function access (req: express.Request, res: express.Response, next: express.NextFunction) {
    auth(req, res, next, 'access');
}

function resetPassword (req: express.Request, res: express.Response, next: express.NextFunction) {
    auth(req, res, next, 'resetPassword');
}

function verify (req: express.Request, res: express.Response, next: express.NextFunction) {
    auth(req, res, next, 'verify');
}

function auth (req: express.Request, res: express.Response, next: express.NextFunction, type: AuthType) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token === undefined) {
            sendMsg(req, res, error.auth.noToken);
            return;
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET ?? 'secret');
        const userId = (decodedToken as jwt.JwtPayload).userId;
        const typeToken = (decodedToken as jwt.JwtPayload).type;
        if (userId === undefined || typeToken !== type) {
            sendMsg(req, res, error.auth.invalidToken);
            return;
        }

        prisma.user.findUnique({ where: { id: userId } })
            .then(user => {
                if (user === null) {
                    sendMsg(req, res, error.auth.invalidToken);
                    return;
                }
                res.locals.user = user;
                next();
            }).catch(err => {
                console.error(err);
                sendMsg(req, res, error.generic.internalError);
            });
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            sendMsg(req, res, error.auth.expiredToken);
            return;
        }
        console.error(err);
        sendMsg(req, res, error.auth.invalidToken);
    }
}

export default { access, resetPassword, verify }
