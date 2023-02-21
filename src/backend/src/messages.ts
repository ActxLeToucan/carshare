import { type Request, type Response } from 'express';
import { type User } from '@prisma/client';

type APIMessageVariants = Record<string, string>;
interface APIMessage { msg: string, code: number }
type APIMessagesTranslation = Record<string, Record<string, (req: Request, ...args: any) => APIMessage>>;

const error: APIMessagesTranslation = {
    email: {
        required: (req: Request) => msgForLang(req, {
            fr: "L'adresse email est requise",
            en: 'Email address is required'
        }, 400),
        max: (req: Request, length: number) => msgForLang(req, {
            fr: `L'adresse email doit contenir au plus ${length} caractère${length > 1 ? 's' : ''}`,
            en: `Email address must contain at most ${length} character${length > 1 ? 's' : ''}`
        }, 400),
        invalid: (req: Request) => msgForLang(req, {
            fr: "L'adresse email est invalide",
            en: 'Email address is invalid'
        }, 400),
        exists: (req: Request) => msgForLang(req, {
            fr: "L'adresse email est déjà utilisée",
            en: 'Email address is already in use'
        }, 400)
    },
    password: {
        required: (req: Request) => msgForLang(req, {
            fr: 'Le mot de passe est requis',
            en: 'Password is required'
        }, 400),
        min: (req: Request, length: number) => msgForLang(req, {
            fr: `Le mot de passe doit contenir au moins ${length} caractère${length > 1 ? 's' : ''}`,
            en: `Password must contain at least ${length} character${length > 1 ? 's' : ''}`
        }, 400),
        upper: (req: Request, count: number) => msgForLang(req, {
            fr: `Le mot de passe doit contenir au moins ${count} majuscule${count > 1 ? 's' : ''}`,
            en: `Password must contain at least ${count} uppercase letter${count > 1 ? 's' : ''}`
        }, 400),
        lower: (req: Request, count: number) => msgForLang(req, {
            fr: `Le mot de passe doit contenir au moins ${count} minuscule${count > 1 ? 's' : ''}`,
            en: `Password must contain at least ${count} lowercase letter${count > 1 ? 's' : ''}`
        }, 400),
        number: (req: Request, count: number) => msgForLang(req, {
            fr: `Le mot de passe doit contenir au moins ${count} chiffre${count > 1 ? 's' : ''}`,
            en: `Password must contain at least ${count} number${count > 1 ? 's' : ''}`
        }, 400),
        special: (req: Request, count: number) => msgForLang(req, {
            fr: `Le mot de passe doit contenir au moins ${count} caractère spécial${count > 1 ? 's' : ''}`,
            en: `Password must contain at least ${count} special character${count > 1 ? 's' : ''}`
        }, 400)
    },
    lastname: {
        required: (req: Request) => msgForLang(req, {
            fr: 'Le nom est requis',
            en: 'Last name is required'
        }, 400),
        max: (req: Request, length: number) => msgForLang(req, {
            fr: `Le nom doit contenir au plus ${length} caractère${length > 1 ? 's' : ''}`,
            en: `Last name must contain at most ${length} character${length > 1 ? 's' : ''}`
        }, 400),
        number: (req: Request) => msgForLang(req, {
            fr: 'Le nom ne peut pas contenir de chiffre',
            en: 'Last name cannot contain numbers'
        }, 400)
    },
    firstname: {
        required: (req: Request) => msgForLang(req, {
            fr: 'Le prénom est requis',
            en: 'First name is required'
        }, 400),
        max: (req: Request, length: number) => msgForLang(req, {
            fr: `Le prénom doit contenir au plus ${length} caractère${length > 1 ? 's' : ''}`,
            en: `First name must contain at most ${length} character${length > 1 ? 's' : ''}`
        }, 400),
        number: (req: Request) => msgForLang(req, {
            fr: 'Le prénom ne peut pas contenir de chiffre',
            en: 'First name cannot contain numbers'
        }, 400)
    },
    phone: {
        required: (req: Request) => msgForLang(req, {
            fr: 'Le numéro de téléphone est requis',
            en: 'Phone number is required'
        }, 400),
        invalid: (req: Request) => msgForLang(req, {
            fr: 'Le numéro de téléphone est invalide',
            en: 'Phone number is invalid'
        }, 400)
    },
    date: {
        required: (req: Request) => msgForLang(req, {
            fr: 'La date est requise',
            en: 'Date is required'
        }, 400),
        invalid: (req: Request) => msgForLang(req, {
            fr: 'La date est invalide',
            en: 'Date is invalid'
        }, 400),
        tooLate: (req: Request, date: Date) => msgForLang(req, {
            fr: `La date doit être avant le ${date.toLocaleDateString('fr-FR')}`,
            en: `Date must be before ${date.toLocaleDateString('en-US')}`
        }, 400)
    },
    user: {
        notFound: (req: Request) => msgForLang(req, {
            fr: 'Utilisateur introuvable',
            en: 'User not found'
        }, 404)
    },
    db: {
        notReachable: (req: Request) => msgForLang(req, {
            fr: 'La base de données n\'est pas joignable. Si le problème persiste, veuillez contacter un administrateur',
            en: 'Database is not reachable. If the problem persists, please contact an administrator'
        }, 500)
    },
    auth: {
        noToken: (req: Request) => msgForLang(req, {
            fr: 'Aucun token n\'a été fourni',
            en: 'No token provided'
        }, 401),
        invalidToken: (req: Request) => msgForLang(req, {
            fr: 'Le token fourni est invalide',
            en: 'Invalid token provided'
        }, 498),
        expiredToken: (req: Request) => msgForLang(req, {
            fr: 'Le token fourni est expiré',
            en: 'Expired token provided'
        }, 498),
        insufficientPrivileges: (req: Request) => msgForLang(req, {
            fr: 'Vous n\'avez pas les droits suffisants pour effectuer cette action',
            en: 'You do not have sufficient rights to perform this action'
        }, 403),
        invalidCredentials: (req: Request) => msgForLang(req, {
            fr: 'Les identifiants fournis sont invalides',
            en: 'Invalid credentials provided'
        }, 401)
    },
    generic: {
        notImplemented: (req: Request) => msgForLang(req, {
            fr: "Cette fonctionnalité n'est pas encore implémentée",
            en: 'This feature is not yet implemented'
        }, 501),
        internalError: (req: Request) => msgForLang(req, {
            fr: 'Une erreur interne est survenue, veuillez réessayer ultérieurement ou contacter un administrateur',
            en: 'An internal error has occurred, please try again later or contact an administrator'
        }, 500)
    }
}

const info: APIMessagesTranslation = {
    user: {
        created: (req: Request) => msgForLang(req, {
            fr: 'Utilisateur créé',
            en: 'User created'
        }, 201),
        loggedIn: (req: Request) => msgForLang(req, {
            fr: 'Utilisateur connecté',
            en: 'User logged in'
        }, 200),
        deleted: (req: Request) => msgForLang(req, {
            fr: 'Utilisateur supprimé',
            en: 'User deleted'
        }, 200),
        passwordChanged: (req: Request) => msgForLang(req, {
            fr: 'Mot de passe modifié',
            en: 'Password changed'
        }, 200),
        passwordResetEmailSent: (req: Request) => msgForLang(req, {
            fr: 'Si l\'adresse mail fournie correspond à un compte, un email de réinitialisation de mot de passe a été envoyé',
            en: 'If the provided email address corresponds to an account, a password reset email has been sent'
        }, 200)
    }
}

/**
 * Returns the message for the language of the request
 * @param req Express request
 * @param variants Variants of the message in different languages
 * @param code HTTP status code
 * @returns The message for the language of the request
 */
function msgForLang (req: Request, variants: APIMessageVariants, code: number): APIMessage {
    return {
        msg: variants[req.acceptsLanguages().find((lang) => lang in variants) ?? 'en'],
        code
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
    res.status(m.code).json({
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
