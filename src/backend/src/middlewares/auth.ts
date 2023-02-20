import jwt from 'jsonwebtoken';
import type express from 'express';
import { error, sendMsg } from '../messages';

module.exports = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token === undefined) {
            sendMsg(req, res, error.auth.noToken);
            return;
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET ?? 'secret');
        const userId = (decodedToken as jwt.JwtPayload).userId;
        if (userId === undefined) {
            sendMsg(req, res, error.auth.invalidToken);
            return;
        }
        res.locals.userId = userId;
        next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            sendMsg(req, res, error.auth.expiredToken);
            return;
        }
        console.error(err);
        sendMsg(req, res, error.auth.invalidToken);
    }
};