import type express from 'express';
import { error, sendMsg } from '../messages';
import IsEmail from 'isemail';

exports.signup = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.body.email === undefined || req.body.email === '') {
        sendMsg(req, res, error.email.required);
        return;
    }
    if (!IsEmail.validate(req.body.email)) {
        sendMsg(req, res, error.email.invalid);
        return;
    }
    if (req.body.password === undefined || req.body.password === '') {
        sendMsg(req, res, error.password.required);
        return;
    }

    sendMsg(req, res, error.generic.notImplemented);
}
