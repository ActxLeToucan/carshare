import { type Request, type Response } from 'express';

type APIMessageVariants = Record<string, string>;
interface APIMessage { msg: string, code: number }
type APIMessagesTranslation = Record<string, Record<string, (req: Request) => APIMessage>>;

const error: APIMessagesTranslation = {
    email: {
        required: (req: Request) => {
            return msgForLang(req, {
                fr: "L'adresse email est requise",
                en: 'Email address is required'
            }, 400);
        },
        invalid: (req: Request) => {
            return msgForLang(req, {
                fr: "L'adresse email est invalide",
                en: 'Email address is invalid'
            }, 400);
        }
    },
    password: {
        required: (req: Request) => {
            return msgForLang(req, {
                fr: 'Le mot de passe est requis',
                en: 'Password is required'
            }, 400);
        }
    },
    generic: {
        notImplemented: (req: Request) => {
            return msgForLang(req, {
                fr: "Cette fonctionnalité n'est pas encore implémentée",
                en: 'This feature is not yet implemented'
            }, 501);
        }
    }
}

const info: APIMessagesTranslation = {

}

function msgForLang (req: Request, variants: APIMessageVariants, code: number): APIMessage {
    return {
        msg: variants[req.acceptsLanguages().find((lang) => lang in variants) ?? 'en'],
        code
    };
}

function sendMsg (req: Request, res: Response, msg: (req: Request) => APIMessage) {
    const m = msg(req);
    res.status(m.code).json({
        message: m.msg
    });
}

export { error, info, sendMsg };
