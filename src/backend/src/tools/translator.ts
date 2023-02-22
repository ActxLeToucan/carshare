import { type Request, type Response } from 'express';
import { type User } from '@prisma/client';

import { p } from '../properties';
import { sendMail as mailerSend } from './mailer';

type Variants = Record<string, any>;
type TemplateMessage = TemplateMail | TemplateMessageHTTP
type Message = Mail | MessageHTTP
type TranslationsMessageHTTP = Record<string, Record<string, (req: Request, ...args: any) => MessageHTTP>>;
type TranslationsMail = Record<string, Record<string, (req: Request, ...args: any) => Mail>>;

interface TemplateMail {
    to: string
    subject: Variants
    text: Variants
    html: Variants
}

export interface Mail {
    to: string
    subject: string
    text: string
    html: string
}
interface TemplateMessageHTTP {
    msg: Variants
    code: number
}
export interface MessageHTTP {
    msg: string
    code: number
}

const error: TranslationsMessageHTTP = {
    email: {
        required: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: "L'adresse email est requise",
                en: 'Email address is required'
            },
            code: 400
        }),
        max: (req: Request, length: number) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `L'adresse email doit contenir au plus ${length} caractère${length > 1 ? 's' : ''}`,
                en: `Email address must contain at most ${length} character${length > 1 ? 's' : ''}`
            },
            code: 400
        }),
        invalid: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: "L'adresse email est invalide",
                en: 'Email address is invalid'
            },
            code: 400
        }),
        exists: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: "L'adresse email est déjà utilisée",
                en: 'Email address is already used'
            },
            code: 400
        })
    },
    password: {
        required: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le mot de passe est requis',
                en: 'Password is required'
            },
            code: 400
        }),
        min: (req: Request, length: number) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Le mot de passe doit contenir au moins ${length} caractère${length > 1 ? 's' : ''}`,
                en: `Password must contain at least ${length} character${length > 1 ? 's' : ''}`
            },
            code: 400
        }),
        upper: (req: Request, length: number) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Le mot de passe doit contenir au moins ${length} majuscule${length > 1 ? 's' : ''}`,
                en: `Password must contain at least ${length} uppercase character${length > 1 ? 's' : ''}`
            },
            code: 400
        }),
        lower: (req: Request, length: number) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Le mot de passe doit contenir au moins ${length} minuscule${length > 1 ? 's' : ''}`,
                en: `Password must contain at least ${length} lowercase character${length > 1 ? 's' : ''}`
            },
            code: 400
        }),
        number: (req: Request, length: number) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Le mot de passe doit contenir au moins ${length} chiffre${length > 1 ? 's' : ''}`,
                en: `Password must contain at least ${length} number${length > 1 ? 's' : ''}`
            },
            code: 400
        }),
        special: (req: Request, length: number) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Le mot de passe doit contenir au moins ${length} caractère${length > 1 ? 's' : ''} spécia${length > 1 ? 'ux' : 'l'}`,
                en: `Password must contain at least ${length} special character${length > 1 ? 's' : ''}`
            },
            code: 400
        })
    },
    lastname: {
        required: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le nom est requis',
                en: 'Lastname is required'
            },
            code: 400
        }),
        max: (req: Request, length: number) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Le nom doit contenir au plus ${length} caractère${length > 1 ? 's' : ''}`,
                en: `Lastname must contain at most ${length} character${length > 1 ? 's' : ''}`
            },
            code: 400
        }),
        number: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le nom ne peut pas contenir de chiffre',
                en: 'Lastname cannot contain number'
            },
            code: 400
        })
    },
    firstname: {
        required: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le prénom est requis',
                en: 'Firstname is required'
            },
            code: 400
        }),
        max: (req: Request, length: number) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Le prénom doit contenir au plus ${length} caractère${length > 1 ? 's' : ''}`,
                en: `Firstname must contain at most ${length} character${length > 1 ? 's' : ''}`
            },
            code: 400
        }),
        number: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le prénom ne peut pas contenir de chiffre',
                en: 'Firstname cannot contain number'
            },
            code: 400
        })
    },
    phone: {
        required: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le numéro de téléphone est requis',
                en: 'Phone number is required'
            },
            code: 400
        }),
        invalid: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le numéro de téléphone est invalide',
                en: 'Phone number is invalid'
            },
            code: 400
        })
    },
    date: {
        required: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'La date est requise',
                en: 'Date is required'
            },
            code: 400
        }),
        invalid: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'La date est invalide',
                en: 'Date is invalid'
            },
            code: 400
        }),
        tooLate: (req: Request, date: Date) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `La date doit être antérieure à ${date.toLocaleDateString('fr-FR')}`,
                en: `Date must be before ${date.toLocaleDateString('en-US')}`
            },
            code: 400
        })
    },
    user: {
        notFound: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Utilisateur introuvable',
                en: 'User not found'
            },
            code: 404
        })
    },
    db: {
        notReachable: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'La base de données n\'est pas joignable. Si le problème persiste, veuillez contacter l\'administrateur',
                en: 'Database is not reachable. If the problem persists, please contact the administrator'
            },
            code: 500
        })
    },
    auth: {
        noToken: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Aucun token n\'a été fourni',
                en: 'No token provided'
            },
            code: 401
        }),
        invalidToken: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le token fourni est invalide',
                en: 'Invalid token provided'
            },
            code: 498
        }),
        expiredToken: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le token fourni est expiré',
                en: 'Expired token provided'
            },
            code: 498
        }),
        insufficientPrivileges: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Vous n\'avez pas les droits suffisants pour effectuer cette action',
                en: 'You do not have sufficient privileges to perform this action'
            },
            code: 403
        }),
        invalidCredentials: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Les identifiants fournis sont invalides',
                en: 'Invalid credentials provided'
            },
            code: 401
        })
    },
    generic: {
        notImplemented: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Cette fonctionnalité n\'est pas encore implémentée',
                en: 'This feature is not yet implemented'
            },
            code: 501
        }),
        unknownError: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Une erreur inconnue est survenue. Si le problème persiste, veuillez contacter l\'administrateur',
                en: 'An unknown error occurred. If the problem persists, please contact the administrator'
            },
            code: 500
        })
    }
}

const info: TranslationsMessageHTTP = {
    user: {
        created: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Utilisateur créé',
                en: 'User created'
            },
            code: 201
        }),
        loggedIn: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Utilisateur connecté',
                en: 'User logged in'
            },
            code: 200
        }),
        deleted: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Utilisateur supprimé',
                en: 'User deleted'
            },
            code: 200
        }),
        passwordChanged: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Mot de passe modifié',
                en: 'Password changed'
            },
            code: 200
        }),
        passwordResetEmailSent: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Si l\'adresse email fournie correspond à un compte, un email de réinitialisation de mot de passe a été envoyé',
                en: 'If the provided email address matches an account, a password reset email has been sent'
            },
            code: 200
        })
    }
}

const mail: TranslationsMail = {
    _: {
        passwordReset: (req: Request, user: User, token: string, frontendPath: string) => msgForLang<TemplateMail, Mail>(req, {
            to: user.email,
            subject: {
                fr: 'Réinitialisation de votre mot de passe',
                en: 'Password reset'
            },
            html: {
                fr: `<p>Bonjour ${user.firstName ?? ''} ${user.lastName ?? ''},</p>
                <p>Vous avez demandé à réinitialiser votre mot de passe. Pour ce faire, veuillez cliquer sur le lien ci-dessous :</p>
                <p><a href="${frontendPath}/${token}">${frontendPath}/${token}</a></p>
                <p>Ce lien est valable ${String(p.token.passwordReset.expiration)}. Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.</p>
                <p>Cordialement,</p>
                <p>L'équipe de ${process.env.FRONTEND_NAME ?? ''}</p>`,
                en: `<p>Hello ${user.firstName ?? ''} ${user.lastName ?? ''},</p>
                <p>You requested to reset your password. To do so, please click on the link below :</p>
                <p><a href="${frontendPath}/${token}">${frontendPath}/${token}</a></p>
                <p>This link is valid for ${String(p.token.passwordReset.expiration)}. If you did not request this, please ignore this email.</p>
                <p>Best regards,</p>
                <p>The ${process.env.FRONTEND_NAME ?? ''} team</p>`
            },
            text: {
                fr: `Bonjour ${user.firstName ?? ''} ${user.lastName ?? ''},
                Vous avez demandé à réinitialiser votre mot de passe. Pour ce faire, veuillez cliquer sur le lien ci-dessous :
                ${frontendPath}/${token}
                
                Ce lien est valable ${String(p.token.passwordReset.expiration)}. Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.
                
                Cordialement,
                L'équipe de ${process.env.FRONTEND_NAME ?? ''}`,
                en: `Hello ${user.firstName ?? ''} ${user.lastName ?? ''},
                You requested to reset your password. To do so, please click on the link below :
                ${frontendPath}/${token}
                
                This link is valid for ${String(p.token.passwordReset.expiration)}. If you did not request this, please ignore this email.
                
                Best regards,
                The ${process.env.FRONTEND_NAME ?? ''} team`
            }
        })
    }
}

/**
 * Returns the message for the language of the request
 * @param req Express request
 * @param message Message to translate
 * @returns Translated message
 */
function msgForLang<T extends TemplateMessage, U extends Message> (req: Request, message: T): U {
    const newMessage: Record<any, any> = {};

    for (const key in message) {
        if (typeof message[key] === 'object') {
            const variants = message[key] as Variants;
            newMessage[key] = variants[req.acceptsLanguages().find((lang) => lang in variants) ?? 'en'];
        } else {
            newMessage[key] = message[key];
        }
    }

    return newMessage as U;
}

/**
 * Sends a response with the given message
 * @param req Express request
 * @param res Express response
 * @param message Message to send
 * @param args Arguments to pass to the message function (if any)
 */
function sendMsg (req: Request, res: Response, message: (req: Request, ...args: any) => MessageHTTP, ...args: any) {
    const msg = message(req, ...args);
    res.status(msg.code).json({ message: msg.msg });
}

async function sendMail (req: Request, message: (req: Request, ...args: any) => Mail, ...args: any): Promise<any> {
    return mailerSend(message(req, ...args));
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

export { error, info, mail, sendMsg, sendMail, displayableUser }
