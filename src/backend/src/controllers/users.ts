import type express from 'express';
import { error, sendMsg } from '../messages';
import * as constraints from '../constraints';

exports.signup = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!constraints.checkEmailField(req.body.email, req, res)) {
        return;
    }
    if (!constraints.checkPasswordField(req.body.password, req, res)) {
        return;
    }
    if (!constraints.checkLastNameField(req.body.lastname, req, res)) {
        return;
    }
    if (!constraints.checkFirstNameField(req.body.firstname, req, res)) {
        return;
    }

    sendMsg(req, res, error.generic.notImplemented);
}
