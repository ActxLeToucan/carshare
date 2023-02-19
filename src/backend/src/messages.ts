import { type Request, type Response } from 'express';
import { type User } from '@prisma/client';

type APIMessageVariants = Record<string, string>;
interface APIMessage { msg: string, code: number, isError: boolean }
type APIMessagesTranslation = Record<string, Record<string, (req: Request, ...args: any) => APIMessage>>;

const error: APIMessagesTranslation = {
    email: {
        required: (req: Request) => {
            return msgForLang(req, {
                fr: "L'adresse email est requise",
                en: 'Email address is required'
            }, 400, true);
        },
        max: (req: Request, length: number) => {
            return msgForLang(req, {
                fr: `L'adresse email doit contenir au plus ${length} caractère${length > 1 ? 's' : ''}`,
                en: `Email address must contain at most ${length} character${length > 1 ? 's' : ''}`
            }, 400, true);
        },
        invalid: (req: Request) => {
            return msgForLang(req, {
                fr: "L'adresse email est invalide",
                en: 'Email address is invalid'
            }, 400, true);
        },
        exists: (req: Request) => {
            return msgForLang(req, {
                fr: "L'adresse email est déjà utilisée",
                en: 'Email address is already in use'
            }, 400, true);
        }
    },
    password: {
        required: (req: Request) => {
            return msgForLang(req, {
                fr: 'Le mot de passe est requis',
                en: 'Password is required'
            }, 400, true);
        },
        length: (req: Request, length: number) => {
            return msgForLang(req, {
                fr: `Le mot de passe doit contenir au moins ${length} caractère${length > 1 ? 's' : ''}`,
                en: `Password must contain at least ${length} character${length > 1 ? 's' : ''}`
            }, 400, true);
        },
        upper: (req: Request, count: number) => {
            return msgForLang(req, {
                fr: `Le mot de passe doit contenir au moins ${count} majuscule${count > 1 ? 's' : ''}`,
                en: `Password must contain at least ${count} uppercase letter${count > 1 ? 's' : ''}`
            }, 400, true);
        },
        lower: (req: Request, count: number) => {
            return msgForLang(req, {
                fr: `Le mot de passe doit contenir au moins ${count} minuscule${count > 1 ? 's' : ''}`,
                en: `Password must contain at least ${count} lowercase letter${count > 1 ? 's' : ''}`
            }, 400, true);
        },
        number: (req: Request, count: number) => {
            return msgForLang(req, {
                fr: `Le mot de passe doit contenir au moins ${count} chiffre${count > 1 ? 's' : ''}`,
                en: `Password must contain at least ${count} number${count > 1 ? 's' : ''}`
            }, 400, true);
        },
        special: (req: Request, count: number) => {
            return msgForLang(req, {
                fr: `Le mot de passe doit contenir au moins ${count} caractère spécial${count > 1 ? 's' : ''}`,
                en: `Password must contain at least ${count} special character${count > 1 ? 's' : ''}`
            }, 400, true);
        }
    },
    lastname: {
        required: (req: Request) => {
            return msgForLang(req, {
                fr: 'Le nom est requis',
                en: 'Last name is required'
            }, 400, true);
        },
        max: (req: Request, length: number) => {
            return msgForLang(req, {
                fr: `Le nom doit contenir au plus ${length} caractère${length > 1 ? 's' : ''}`,
                en: `Last name must contain at most ${length} character${length > 1 ? 's' : ''}`
            }, 400, true);
        },
        number: (req: Request) => {
            return msgForLang(req, {
                fr: 'Le nom ne peut pas contenir de chiffre',
                en: 'Last name cannot contain numbers'
            }, 400, true);
        }
    },
    firstname: {
        required: (req: Request) => {
            return msgForLang(req, {
                fr: 'Le prénom est requis',
                en: 'First name is required'
            }, 400, true);
        },
        max: (req: Request, length: number) => {
            return msgForLang(req, {
                fr: `Le prénom doit contenir au plus ${length} caractère${length > 1 ? 's' : ''}`,
                en: `First name must contain at most ${length} character${length > 1 ? 's' : ''}`
            }, 400, true);
        },
        number: (req: Request) => {
            return msgForLang(req, {
                fr: 'Le prénom ne peut pas contenir de chiffre',
                en: 'First name cannot contain numbers'
            }, 400, true);
        }
    },
    phone: {
        required: (req: Request) => {
            return msgForLang(req, {
                fr: 'Le numéro de téléphone est requis',
                en: 'Phone number is required'
            }, 400, true);
        },
        invalid: (req: Request) => {
            return msgForLang(req, {
                fr: 'Le numéro de téléphone est invalide',
                en: 'Phone number is invalid'
            }, 400, true);
        },
        max: (req: Request, length: number) => {
            return msgForLang(req, {
                fr: `Le numéro de téléphone doit contenir au plus ${length} caractère${length > 1 ? 's' : ''}`,
                en: `Phone number must contain at most ${length} character${length > 1 ? 's' : ''}`
            }, 400, true);
        }
    },
    date: {
        required: (req: Request) => {
            return msgForLang(req, {
                fr: 'La date est requise',
                en: 'Date is required'
            }, 400, true);
        },
        invalid: (req: Request) => {
            return msgForLang(req, {
                fr: 'La date est invalide',
                en: 'Date is invalid'
            }, 400, true);
        },
        tooLate: (req: Request, date: Date) => {
            return msgForLang(req, {
                fr: `La date doit être avant le ${date.toLocaleDateString('fr-FR')}`,
                en: `Date must be before ${date.toLocaleDateString('en-US')}`
            }, 400, true);
        }
    },
    generic: {
        notImplemented: (req: Request) => {
            return msgForLang(req, {
                fr: "Cette fonctionnalité n'est pas encore implémentée",
                en: 'This feature is not yet implemented'
            }, 501, true);
        }
    }
}

const info: APIMessagesTranslation = {
    user: {
        created: (req: Request) => {
            return msgForLang(req, {
                fr: 'Utilisateur créé',
                en: 'User created'
            }, 201, false);
        }
    }
}

/**
 * Returns the message for the language of the request
 * @param req Express request
 * @param variants Variants of the message in different languages
 * @param code HTTP status code
 * @param isError Whether the message is an error or not
 * @returns The message for the language of the request
 */
function msgForLang (req: Request, variants: APIMessageVariants, code: number, isError: boolean): APIMessage {
    return {
        msg: variants[req.acceptsLanguages().find((lang) => lang in variants) ?? 'en'],
        code,
        isError
    };
}

/**
 * Sends a message to the client
 * @param req Express request
 * @param res Express response
 * @param msg Message to send
 * @param args Arguments to pass to the message function (if any)
 */
function sendMsg (req: Request, res: Response, msg: (req: Request, ...args: any) => APIMessage, ...args: any) {
    const m = msg(req, ...args);
    m.isError
        ? res.status(m.code).json({
            error: m.msg
        })
        : res.status(m.code).json({
            message: m.msg
        });
}

/**
 * Returns a user without the password
 * @param user User to display
 * @returns User without the password
 */
function displayableUser (user: User) {
    const u = user as any;
    delete u.password;
    return u;
}

export { error, info, sendMsg, displayableUser };
