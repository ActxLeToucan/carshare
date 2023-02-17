import express from "express";
import {PrismaClient} from "@prisma/client";
import {error, sendMsg} from "../messages";
import IsEmail from "isemail";

const prisma = new PrismaClient();

exports.signup = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.body.email) {
        return sendMsg(req, res, error.email.required);
    }
    if (!IsEmail.validate(req.body.email)) {
        return sendMsg(req, res, error.email.invalid);
    }
    if (!req.body.password) {
        return sendMsg(req, res, error.password.required);
    }

    sendMsg(req, res, error.generic.notImplemented);
}