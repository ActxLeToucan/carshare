import {Request, Response} from "express";

type APIMessageVariants = { [key: string]: string };
type APIMessage = { msg: string, code: number };
type APIMessagesTranslation = { [key: string]: { [key: string]: (req: Request) => APIMessage } };

const error: APIMessagesTranslation = {
    email: {
        required: (req: Request) => {
            return msgForLang(req, {
                fr: "L'adresse email est requise",
                en: "Email address is required"
            }, 400);
        },
        invalid: (req: Request) => {
            return msgForLang(req, {
                fr: "L'adresse email est invalide",
                en: "Email address is invalid"
            }, 400);
        }
    },
    password: {
        required: (req: Request) => {
            return msgForLang(req, {
                fr: "Le mot de passe est requis",
                en: "Password is required"
            }, 400);
        }
    },
    generic: {
        notImplemented: (req: Request) => {
            return msgForLang(req, {
                fr: "Cette fonctionnalité n'est pas encore implémentée",
                en: "This feature is not yet implemented"
            }, 501);
        }
    }
}

const info: APIMessagesTranslation = {

}

function msgForLang (req: Request, variants: APIMessageVariants, code: number): APIMessage {
    return {
        msg: variants[req.acceptsLanguages().find((lang) => lang in variants) ?? "en"],
        code: code
    };
}

function sendMsg (req: Request, res: Response, msg: (req: Request) => APIMessage) {
    let m = msg(req);
    res.status(m.code).json({
        message: m.msg
    });
}

export {error, info, sendMsg};