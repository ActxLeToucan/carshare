import { type Request, type Response } from 'express';
import { type User, type Travel, type Etape,  type Group } from '@prisma/client';

import { p } from '../properties';
import { sendMail as mailerSend } from './mailer';

export type Variants = {
    en: any
} & Record<string, any>;
type TemplateMessage = TemplateMail | TemplateMessageHTTP;
type Message = Mail | MessageHTTP;
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
    data?: any
}
export interface MessageHTTP {
    msg: string
    code: number
    data?: any
}

const mailHtmlHeader = process.env.FRONTEND_LOGO === undefined || process.env.FRONTEND_LOGO === ''
    ? ''
    : `<a href="${process.env.FRONTEND_URL ?? ''}"><img src="${process.env.FRONTEND_LOGO ?? ''}" alt="${process.env.FRONTEND_NAME ?? ''}" style="width: 100px; height: 100px; margin: 0 auto; display: block;"/></a>`;

const error = {
    email: {
        required: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: "L'adresse email est requise.",
                en: 'Email address is required.'
            },
            code: 400
        }),
        type: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: "L'adresse email doit être une chaîne de caractères.",
                en: 'Email address must be a string.'
            },
            code: 400
        }),
        max: (req: Request, length: number) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `L'adresse email doit contenir au plus ${length} caractère${length > 1 ? 's' : ''}.`,
                en: `Email address must contain at most ${length} character${length > 1 ? 's' : ''}.`
            },
            code: 400
        }),
        invalid: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: "L'adresse email est invalide.",
                en: 'Email address is invalid.'
            },
            code: 400
        }),
        exists: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: "L'adresse email est déjà utilisée.",
                en: 'Email address is already used.'
            },
            code: 400
        }),
        alreadyVerified: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: "L'adresse email a déjà été vérifiée.",
                en: 'Email address is already verified.'
            },
            code: 400
        })
    },
    users: {
        type: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Les utilisateurs doivent être un tableau de chaînes de caractères.',
                en: 'Users must be an array of strings.'
            },
            code: 400
        }),
        maxPerRequest: (req: Request, length: number) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Vous ne pouvez pas ajouter plus de ${length} utilisateur${length > 1 ? 's' : ''} à la fois.`,
                en: `You can't add more than ${length} user${length > 1 ? 's' : ''} at once.`
            },
            code: 400
        })
    },
    password: {
        required: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le mot de passe est requis.',
                en: 'Password is required.'
            },
            code: 400
        }),
        type: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le mot de passe doit être une chaîne de caractères.',
                en: 'Password must be a string.'
            },
            code: 400
        }),
        min: (req: Request, length: number) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Le mot de passe doit contenir au moins ${length} caractère${length > 1 ? 's' : ''}.`,
                en: `Password must contain at least ${length} character${length > 1 ? 's' : ''}.`
            },
            code: 400
        }),
        upper: (req: Request, length: number) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Le mot de passe doit contenir au moins ${length} majuscule${length > 1 ? 's' : ''}.`,
                en: `Password must contain at least ${length} uppercase character${length > 1 ? 's' : ''}.`
            },
            code: 400
        }),
        lower: (req: Request, length: number) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Le mot de passe doit contenir au moins ${length} minuscule${length > 1 ? 's' : ''}.`,
                en: `Password must contain at least ${length} lowercase character${length > 1 ? 's' : ''}.`
            },
            code: 400
        }),
        number: (req: Request, length: number) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Le mot de passe doit contenir au moins ${length} chiffre${length > 1 ? 's' : ''}.`,
                en: `Password must contain at least ${length} number${length > 1 ? 's' : ''}.`
            },
            code: 400
        }),
        special: (req: Request, length: number) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Le mot de passe doit contenir au moins ${length} caractère${length > 1 ? 's' : ''} spécia${length > 1 ? 'ux' : 'l'}.`,
                en: `Password must contain at least ${length} special character${length > 1 ? 's' : ''}.`
            },
            code: 400
        })
    },
    lastname: {
        required: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le nom est requis.',
                en: 'Lastname is required.'
            },
            code: 400
        }),
        type: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le nom doit être une chaîne de caractères.',
                en: 'Lastname must be a string.'
            },
            code: 400
        }),
        max: (req: Request, length: number) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Le nom doit contenir au plus ${length} caractère${length > 1 ? 's' : ''}.`,
                en: `Lastname must contain at most ${length} character${length > 1 ? 's' : ''}.`
            },
            code: 400
        }),
        number: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le nom ne peut pas contenir de chiffre.',
                en: 'Lastname cannot contain number.'
            },
            code: 400
        })
    },
    firstname: {
        required: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le prénom est requis.',
                en: 'Firstname is required.'
            },
            code: 400
        }),
        type: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le prénom doit être une chaîne de caractères.',
                en: 'Firstname must be a string.'
            },
            code: 400
        }),
        max: (req: Request, length: number) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Le prénom doit contenir au plus ${length} caractère${length > 1 ? 's' : ''}.`,
                en: `Firstname must contain at most ${length} character${length > 1 ? 's' : ''}.`
            },
            code: 400
        }),
        number: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le prénom ne peut pas contenir de chiffre.',
                en: 'Firstname cannot contain number.'
            },
            code: 400
        })
    },
    phone: {
        required: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le numéro de téléphone est requis.',
                en: 'Phone number is required.'
            },
            code: 400
        }),
        type: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le numéro de téléphone doit être une chaîne de caractères.',
                en: 'Phone number must be a string.'
            },
            code: 400
        }),
        invalid: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le numéro de téléphone est invalide.',
                en: 'Phone number is invalid.'
            },
            code: 400
        })
    },
    level: {
        required: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le niveau est requis.',
                en: 'Level is required.'
            },
            code: 400
        }),
        type: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le niveau doit être un nombre.',
                en: 'Level must be a number.'
            },
            code: 400
        }),
        tooHigh: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'a mountain too [H]igh | Le niveau est plus élevé que votre propre niveau.',
                en: 'Level is higher than your own level.'
            },
            code: 403
        })
    },
    groupName: {
        required: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le nom du groupe est requis.',
                en: 'Group name is required.'
            },
            code: 400
        }),
        type: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le nom du groupe doit être une chaîne de caractères.',
                en: 'Group name must be a string.'
            },
            code: 400
        })
    },
    boolean: {
        required: (req: Request, fieldName: string) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Le champ "${fieldName}" est requis.`,
                en: `Field "${fieldName}" is required.`
            },
            code: 400
        }),
        type: (req: Request, fieldName: string) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Le champ "${fieldName}" doit être un booléen.`,
                en: `Field "${fieldName}" must be a boolean.`
            },
            code: 400
        })
    },
    date: {
        required: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'La date est requise.',
                en: 'Date is required.'
            },
            code: 400
        }),
        invalid: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'La date est invalide.',
                en: 'Date is invalid.'
            },
            code: 400
        }),
        tooLate: (req: Request, date: Date) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `La date doit être antérieure à ${date.toLocaleDateString('fr-FR')}.`,
                en: `Date must be before ${date.toLocaleDateString('en-US')}.`
            },
            code: 400
        }),
        tooSoon: (req: Request, date: Date) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `La date doit être supérieur à ${date.toLocaleDateString('fr-FR')}.`,
                en: `Date must be greater than ${date.toLocaleDateString('en-US')}.`
            },
            code: 400
        })
    },
    user: {
        notFound: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Utilisateur introuvable.',
                en: 'User not found.'
            },
            code: 404
        }),
        invalidId: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'L\'identifiant de l\'utilisateur est invalide.',
                en: 'User id is invalid.'
            },
            code: 400
        })
    },
    db: {
        notReachable: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'La base de données n\'est pas joignable. Si le problème persiste, veuillez contacter un administrateur.',
                en: 'Database is not reachable. If the problem persists, please contact an administrator.'
            },
            code: 500
        })
    },
    auth: {
        noToken: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Aucun token n\'a été fourni.',
                en: 'No token provided.'
            },
            code: 401
        }),
        invalidToken: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le token fourni est invalide.',
                en: 'Invalid token provided.'
            },
            code: 498
        }),
        expiredToken: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le token fourni est expiré.',
                en: 'Expired token provided.'
            },
            code: 498
        }),
        insufficientPrivileges: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Vous n\'avez pas les droits suffisants pour effectuer cette action.',
                en: 'You do not have sufficient privileges to perform this action.'
            },
            code: 403
        }),
        invalidCredentials: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Les identifiants fournis sont invalides.',
                en: 'Invalid credentials provided.'
            },
            code: 401
        }),
        wrongPassword: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Mot de passe incorrect',
                en: 'Wrong password'
            },
            code: 401
        }),
        emailNotVerified: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Votre adresse email doit être vérifiée avant de pouvoir effectuer cette action.',
                en: 'Your email address must be verified before you can perform this action.'
            },
            code: 401
        })
    },
    generic: {
        notImplemented: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Cette fonctionnalité n\'est pas encore implémentée.',
                en: 'This feature is not yet implemented.'
            },
            code: 501
        }),
        internalError: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Une erreur interne est survenue. Si le problème persiste, veuillez contacter un administrateur.',
                en: 'An internal error occurred. If the problem persists, please contact an administrator.'
            },
            code: 500
        }),
        routeNotFound: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'La route demandée n\'existe pas.',
                en: 'The requested route does not exist.'
            },
            code: 404
        })
    },
    mailer: {
        cooldown: (req: Request, cooldown: Variants) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Un email a déjà été envoyé à cette adresse il y a moins de ${translate(req, cooldown)}. Veuillez patienter avant d'essayer à nouveau.`,
                en: `An email has already been sent to this address less than ${translate(req, cooldown)} ago. Please wait before trying again.`
            },
            code: 429
        })
    },
    documentation: {
        notFound: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: '<head><title>Documentation introuvable</title></head>' +
                    '<h1>Documentation introuvable</h1>' +
                    '<p>Si vous êtes le propriétaire du serveur, exécutez "npm run docs" pour la générer.</p>' +
                    '<p>Vous pouvez également trouver le fichier de documentation (YAML) <a href="/docs/yaml">ici</a>.</p>',
                en: '<head><title>Documentation not found</title></head>' +
                    '<h1>Documentation not found</h1>' +
                    '<p>If you are the owner of the server, run "npm run docs" to generate it.</p>' +
                    '<p>You can also find the documentation file (YAML) <a href="/docs/yaml">here</a>.</p>'
            },
            code: 404
        })
    },
    group: {
        notFound: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Groupe introuvable.',
                en: 'Group not found.'
            },
            code: 404
        })

    },
    number: {
        required: (req: Request, fieldName: string) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Le champ "${fieldName}" est requis.`,
                en: `Field "${fieldName}" is required.`
            },
            code: 400
        }),
        type: (req: Request, fieldName: string) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Le champ "${fieldName}" doit être un nombre.`,
                en: `Field "${fieldName}" must be a number.`
            },
            code: 400
        })
    },
    string: {
        required: (req: Request, fieldName: string) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Le champ "${fieldName}" est requis.`,
                en: `Field "${fieldName}" is required.`
            },
            code: 400
        }),
        type: (req: Request, fieldName: string) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Le champ "${fieldName}" doit être un string.`,
                en: `Field "${fieldName}" must be a string.`
            },
            code: 400
        })
    },
    etape: {
        required: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le champ listOfEtape est requis.',
                en: 'Field listOfEtape is required.'
            },
            code: 400
        }),
        etapeMin: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le champ listOfEtape doit avoir une taille supérieur à 2.',
                en: 'Field listOfEtape field must have a size greater than 2.'
            },
            code: 400
        }),
        type: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le champ listOfEtape doit être un objet.',
                en: 'Field listOfEtape must be a object.'
            },
            code: 400
        })
    }
} satisfies TranslationsMessageHTTP;

const info = {
    user: {
        created: (req: Request, user: User, token: string) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Utilisateur créé',
                en: 'User created'
            },
            code: 201,
            data: {
                user: displayableUserPrivate(user),
                token
            }
        }),
        loggedIn: (req: Request, userId: number, token: string) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Utilisateur connecté',
                en: 'User logged in'
            },
            code: 200,
            data: {
                userId,
                token
            }
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
        emailVerified: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Adresse email vérifiée',
                en: 'Email address verified'
            },
            code: 200
        }),
        updated: (req: Request, user: User) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Utilisateur mis à jour',
                en: 'User updated'
            },
            code: 200,
            data: {
                user: displayableUserPrivate(user)
            }
        })
    },
    mailSent: {
        passwordReset: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Si l\'adresse email fournie correspond à un compte, un email de réinitialisation de mot de passe a été envoyé.',
                en: 'If the provided email address matches an account, a password reset email has been sent.'
            },
            code: 200
        }),
        emailVerification: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Un lien de vérification a été envoyé à votre adresse email.',
                en: 'A verification link has been sent to your email address.'
            },
            code: 200
        })
    },
    settings: {
        saved: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Paramètres enregistrés',
                en: 'Settings saved'
            },
            code: 200
        })
    },
    travel: {
        created: (req: Request, travel: Travel, etape: Etape) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Trajet créé',
                en: 'Travel created'
            },
            code: 201,
            data: {
                travel,
                numberOfEtape: etape
            }
        })
    },
    group: {
        created: (req: Request, group: Group & { users: User[] }) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Groupe créé',
                en: 'Group created'
            },
            code: 201,
            data: {
                group: displayableGroup(group)
            }
        })
    }

} satisfies TranslationsMessageHTTP;

const mail = {
    password: {
        reset: (req: Request, user: User, token: string) => msgForLang<TemplateMail, Mail>(req, {
            to: user.email,
            subject: {
                fr: 'Réinitialisation de votre mot de passe',
                en: 'Password reset'
            },
            html: {
                fr: `${mailHtmlHeader}
                <p>Bonjour ${user.firstName ?? ''} ${user.lastName ?? ''},</p>
                <p>Vous avez demandé à réinitialiser votre mot de passe. Pour ce faire, veuillez cliquer sur le lien ci-dessous :</p>
                <p><a href="${String(p.url.passwordReset)}${token}">${String(p.url.passwordReset)}${token}</a></p>
                <p>Ce lien est valable ${translate(req, p.token.passwordReset.expirationTxt)}. Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.</p>
                <p>Cordialement,</p>
                <p>L'équipe de ${process.env.FRONTEND_NAME ?? ''}</p>`,
                en: `${mailHtmlHeader}
                <p>Hello ${user.firstName ?? ''} ${user.lastName ?? ''},</p>
                <p>You requested to reset your password. To do so, please click on the link below :</p>
                <p><a href="${String(p.url.passwordReset)}${token}">${String(p.url.passwordReset)}${token}</a></p>
                <p>This link is valid for ${translate(req, p.token.passwordReset.expirationTxt)}. If you did not request this, please ignore this email.</p>
                <p>Best regards,</p>
                <p>The ${process.env.FRONTEND_NAME ?? ''} team</p>`
            },
            text: {
                fr: `Bonjour ${user.firstName ?? ''} ${user.lastName ?? ''},
                Vous avez demandé à réinitialiser votre mot de passe. Pour ce faire, veuillez cliquer sur le lien ci-dessous :
                ${String(p.url.passwordReset)}${token}

                Ce lien est valable ${translate(req, p.token.passwordReset.expirationTxt)}. Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.

                Cordialement,
                L'équipe de ${process.env.FRONTEND_NAME ?? ''}`,
                en: `Hello ${user.firstName ?? ''} ${user.lastName ?? ''},
                You requested to reset your password. To do so, please click on the link below :
                ${String(p.url.passwordReset)}${token}

                This link is valid for ${translate(req, p.token.passwordReset.expirationTxt)}. If you did not request this, please ignore this email.

                Best regards,
                The ${process.env.FRONTEND_NAME ?? ''} team`
            }
        })
    },
    email: {
        verification: (req: Request, user: User, token: string, frontendPath: string) => msgForLang<TemplateMail, Mail>(req, {
            to: user.email,
            subject: {
                fr: 'Vérification de votre adresse email',
                en: 'Email verification'
            },
            html: {
                fr: `${mailHtmlHeader}
                <p>Bonjour ${user.firstName ?? ''} ${user.lastName ?? ''},</p>
                <p>Pour vérifier votre adresse email, veuillez cliquer sur le lien ci-dessous :</p>
                <p><a href="${String(p.url.emailVerification)}${token}">${String(p.url.emailVerification)}${token}</a></p>
                <p>Ce lien est valable ${translate(req, p.token.verify.expirationTxt)}. Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.</p>
                <p>Cordialement,</p>
                <p>L'équipe de ${process.env.FRONTEND_NAME ?? ''}</p>`,
                en: `${mailHtmlHeader}
                <p>Hello ${user.firstName ?? ''} ${user.lastName ?? ''},</p>
                <p>To verify your email address, please click on the link below :</p>
                <p><a href="${String(p.url.emailVerification)}${token}">${String(p.url.emailVerification)}${token}</a></p>
                <p>This link is valid for ${translate(req, p.token.verify.expirationTxt)}. If you did not request this, please ignore this email.</p>
                <p>Best regards,</p>
                <p>The ${process.env.FRONTEND_NAME ?? ''} team</p>`
            },
            text: {
                fr: `Bonjour ${user.firstName ?? ''} ${user.lastName ?? ''},
                Pour vérifier votre adresse email, veuillez cliquer sur le lien ci-dessous :
                ${String(p.url.emailVerification)}${token}

                Ce lien est valable ${translate(req, p.token.verify.expirationTxt)}. Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.

                Cordialement,
                L'équipe de ${process.env.FRONTEND_NAME ?? ''}`,
                en: `Hello ${user.firstName ?? ''} ${user.lastName ?? ''},
                To verify your email address, please click on the link below :
                ${String(p.url.emailVerification)}${token}

                This link is valid for ${translate(req, p.token.verify.expirationTxt)}. If you did not request this, please ignore this email.

                Best regards,
                The ${process.env.FRONTEND_NAME ?? ''} team`
            }
        })
    }
} satisfies TranslationsMail;

/**
 * Returns the message for the language of the request
 * @param req Express request
 * @param message Message to translate
 * @returns Translated message
 */
function msgForLang<T extends TemplateMessage, U extends Message> (req: Request, message: T): U {
    const newMessage: Record<any, any> = {};

    for (const key in message) {
        const value = message[key];
        if (areVariants(value)) {
            newMessage[key] = translate(req, value);
        } else {
            newMessage[key] = message[key];
        }
    }

    return newMessage as U;
}

function areVariants (obj: any): obj is Variants {
    return typeof obj === 'object' && 'en' in obj;
}

/**
 * Translates a message by choosing the right variant
 * @param req Express request
 * @param variants Variants of the message
 * @returns Translated message
 */
function translate (req: Request, variants: Variants): string {
    return variants[req.acceptsLanguages().find((lang) => lang in variants) ?? 'en'];
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
    res.status(msg.code).json({
        ...msg.data
    });
}

/**
 * Sends a raw text with the given message
 * @param req Express request
 * @param res Express response
 * @param page Message to send
 * @param args Arguments to pass to the message function (if any)
 */
function sendRaw (req: Request, res: Response, page: (req: Request, ...args: any) => MessageHTTP, ...args: any) {
    const p = page(req, ...args);
    res.status(p.code).send(p.msg);
}

/**
 * Sends an email
 * @param req Express request
 * @param message Message to send
 * @param args Arguments to pass to the message function (if any)
 * @returns Promise of the mailer response
 */
async function sendMail (req: Request, message: (req: Request, ...args: any) => Mail, ...args: any): Promise<any> {
    return mailerSend(message(req, ...args));
}

/**
 * Returns a user without some properties for display to the user itself or to admins
 * @param user User to display
 * @returns User without some properties
 * @see displayableUserPublic
 */
function displayableUserPrivate (user: User) {
    const u = user as any;
    delete u.password;
    delete u.lastPasswordResetEmailedOn;
    delete u.lastEmailVerificationEmailedOn;
    return u;
}

/**
 * Returns a user without some properties for display to other users
 * @param user User to display
 * @returns User without some properties
 * @see displayableUserPrivate
 */
function displayableUserPublic (user: User) {
    const u = displayableUserPrivate(user);
    delete u.mailNotif;
    delete u.createdAt;
    return u;
}

function displayableGroup (group: Group & { users: User[] }) {
    const g = group as any;
    g.users = g.users.map(displayableUserPublic);
    return g;
}

export { error, info, mail, sendMsg, sendMail, sendRaw, displayableUserPrivate, displayableGroup };
