import { type Request, type Response } from 'express';
import { type User, type Travel, type Group, type Step, type Booking, type Notification, type Evaluation } from '@prisma/client';

import properties from '../properties';
import { sendMail as mailerSend } from './mailer';
import moment from 'moment-timezone';
import { titleCase } from 'title-case';

export type Variants = {
    en: any
} & Record<string, any>;
type TemplateMessage = TemplateMail | TemplateMessageHTTP | TemplateNotif;
type Message = Mail | MessageHTTP | Notif;
type TranslationsMessageHTTP = Record<string, Record<string, (req: Request, ...args: any) => MessageHTTP>>;
type TranslationsMail = Record<string, Record<string, (req: Request, ...args: any) => Mail>>;
type TranslationsNotif = Record<string, Record<string, (user: User, ...args: any) => Notif>>;

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

interface TemplateNotif {
    title: Variants
    message: Variants
    type: string
    createdAt: Date
    data?: any
}

export interface Notif {
    title: string
    message: string
    type: string
    createdAt: Date
    data?: any
}

const mailHtmlHeader = process.env.FRONTEND_LOGO === undefined || process.env.FRONTEND_LOGO === ''
    ? ''
    : `<a href="${process.env.FRONTEND_URL ?? ''}"><img src="${process.env.FRONTEND_LOGO ?? ''}" alt="${process.env.FRONTEND_NAME ?? ''}" style="width: 100px; height: 100px; margin: 0 auto; display: block;"/></a>`;

const error = {
    integer: {
        type: (req: Request, field: string, inBody: boolean = true) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `La valeur du ${inBody ? 'champ' : 'paramètre'} ${field} doit être un entier.`,
                en: `The value of the ${inBody ? 'field' : 'parameter'} ${field} must be an integer.`
            },
            code: 400
        }),
        outOfRange: (req: Request, min: number, max: number, field: string, inBody: boolean = true) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `La valeur du ${inBody ? 'champ' : 'paramètre'} ${field} doit être comprise entre ${min} et ${max}.`,
                en: `The value of the ${inBody ? 'field' : 'parameter'} ${field} must be between ${min} and ${max}.`
            },
            code: 400
        })
    },
    email: {
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
    password: {
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
        invalid: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le numéro de téléphone est invalide.',
                en: 'Phone number is invalid.'
            },
            code: 400
        })
    },
    level: {
        tooHigh: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'a mountain too [H]igh | Le niveau est trop élevé par rapport à votre niveau.',
                en: 'Level is too high compared to your level.'
            },
            code: 403
        })
    },
    gender: {
        unknown: (req: Request, genders: string[]) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Le genre doit être parmi [${genders.reduce((a, b) => `${a}, ${b}`)}].`,
                en: `Gender must be among [${genders.reduce((a, b) => `${a}, ${b}`)}].`
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
        tooSoon: (req: Request, date: Date, timezone: string) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `La date doit être après le ${dateToString(date, timezone, 'fr')}.`,
                en: `Date must be after ${dateToString(date, timezone, 'en')}.`
            },
            code: 400
        }),
        identical: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Les dates sont identiques.',
                en: 'Dates are identical.'
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
        }),
        disabled: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'L\'envoi d\'email est désactivé sur ce serveur.',
                en: 'Email sending is disabled on this server.'
            },
            code: 500
        })
    },
    documentation: {
        favicon: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'La variable d\'environnement "FRONTEND_LOGO" n\'est pas définie.',
                en: 'Environment variable "FRONTEND_LOGO" is not defined.'
            },
            code: 500
        })
    },
    group: {
        notFound: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Groupe introuvable.',
                en: 'Group not found.'
            },
            code: 404
        }),
        creatorMember: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Vous ne pouvez pas être un membre du groupe que vous avez créé.',
                en: 'You cannot be a member of the group you created.'
            },
            code: 400
        }),
        alreadyMember: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'L\'utilisateur est déjà dans le groupe.',
                en: 'The user is already in the group.'
            },
            code: 400
        }),
        notCreator: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Vous n\'êtes pas le créateur de ce groupe.',
                en: 'You are not the creator of this group.'
            },
            code: 403
        }),
        notMember: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Cet utilisateur n\'est pas dans le groupe.',
                en: 'This user is not in the group.'
            },
            code: 400
        })
    },
    number: {
        required: (req: Request, fieldName: string, inBody: boolean = true) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Le ${inBody ? 'champ' : 'paramètre'} "${fieldName}" est requis.`,
                en: `${inBody ? 'Field' : 'Parameter'} "${fieldName}" is required.`
            },
            code: 400
        }),
        type: (req: Request, fieldName: string, inBody: boolean = true) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Le ${inBody ? 'champ' : 'paramètre'} "${fieldName}" doit être un nombre.`,
                en: `${inBody ? 'Field' : 'Parameter'} "${fieldName}" must be a number.`
            },
            code: 400
        }),
        min: (req: Request, fieldName: string, min: number) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Le champ "${fieldName}" doit être supérieur ou égal à ${min}.`,
                en: `Field "${fieldName}" must be greater than or equal to ${min}.`
            },
            code: 400
        }),
        max: (req: Request, fieldName: string, max: number) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Le champ "${fieldName}" doit être inférieur ou égal à ${max}.`,
                en: `Field "${fieldName}" must be less than or equal to ${max}.`
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
                fr: `Le champ "${fieldName}" doit être une chaîne de caractères.`,
                en: `Field "${fieldName}" must be a string.`
            },
            code: 400
        })
    },
    steps: {
        required: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Les étapes sont requises.',
                en: 'Steps are required.'
            },
            code: 400
        }),
        min: (req: Request, length: number) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Un trajet doit comporter au minimum ${length} étape${length > 1 ? 's' : ''}.`,
                en: `A trip must have at least ${length} step${length > 1 ? 's' : ''}.`
            },
            code: 400
        }),
        type: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Les étapes doivent être un tableau.',
                en: 'Steps must be an array.'
            },
            code: 400
        }),
        badOrder: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Les dates données ne sont pas dans le bon ordre.',
                en: 'The dates given are not in the right order.'
            },
            code: 400
        }),
        alreadyTravel: (req: Request, dateDeb: Date, dateFin: Date, timezone: string) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Vous avez déjà un trajet de prévu du ${dateToString(dateDeb, timezone, 'fr')} au ${dateToString(dateFin, timezone, 'fr')}.`,
                en: `You already have a trip planned from ${dateToString(dateDeb, timezone, 'en')} to ${dateToString(dateFin, timezone, 'en')}.`
            },
            code: 400
        })
    },
    latitude: {
        minMax: (req: Request, min: number, max: number) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `La latitude doit être entre ${min} et ${max}.`,
                en: `The latitude must be between ${min} and ${max}.`
            },
            code: 400
        })
    },
    longitude: {
        minMax: (req: Request, min: number, max: number) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `La longitude doit être entre ${min} et ${max}.`,
                en: `The longitude must be between ${min} and ${max}.`
            },
            code: 400
        })
    },
    notification: {
        notFound: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Notification introuvable.',
                en: 'Notification not found.'
            },
            code: 404
        })
    },
    evaluation: {
        notPossible: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Vous n\'avez jamais fait de trajet avec la personne que vous voulez évaluer.',
                en: 'You have never made a trip with the person you want to evaluate.'
            },
            code: 400
        }),
        alreadyNoted: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Vous avez déjà noté cet utilisateur.',
                en: 'You have already noted this user.'
            },
            code: 400
        }),
        notFound: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Evaluation introuvable.',
                en: 'Evaluation not found.'
            },
            code: 404
        })
    },
    travel: {
        notModifiable: (req: Request, hours: number) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Vous ne pouvez pas modifier un trajet qui commence dans moins de ${hours} heure${hours > 1 ? 's' : ''}.`,
                en: `You cannot modify a trip that starts in less than ${hours} hour${hours > 1 ? 's' : ''}.`
            },
            code: 400
        }),
        notFound: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Trajet introuvable.',
                en: 'Travel not found.'
            },
            code: 404
        }),
        notDriver: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Vous n\'êtes pas le conducteur de ce trajet.',
                en: 'You are not the driver of this travel.'
            },
            code: 403
        }),
        isDriver: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Vous êtes le conducteur de ce trajet.',
                en: 'You are the driver of this travel.'
            },
            code: 400
        }),
        notOpen: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Ce trajet n\'est plus ouvert.',
                en: 'This travel is no longer open.'
            },
            code: 400
        }),
        notStarted: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Ce trajet n\'a pas encore commencé.',
                en: 'This travel has not yet started.'
            },
            code: 400
        }),
        noSeats: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Ce trajet n\'a plus de place.',
                en: 'This travel has no more seats.'
            },
            code: 400
        }),
        invalidSteps: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Les étapes ne sont pas valides.',
                en: 'The steps are not valid.'
            },
            code: 400
        }),
        tooManyPassengers: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Il y a plus de passagers que de places.',
                en: 'There are more passengers than seats.'
            },
            code: 400
        }),
        invalidType: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Le type de trajet recherché est invalide.',
                en: 'The type of travel searched is invalid.'
            },
            code: 400
        }),
        notEnded: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Ce trajet n\'est pas terminé.',
                en: 'This travel is not finished.'
            },
            code: 400
        })
    },
    booking: {
        notFound: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Réservation introuvable.',
                en: 'Booking not found.'
            },
            code: 404
        }),
        notYours: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Vous n\'êtes pas l\'auteur de cette réservation.',
                en: 'You are not the author of this booking.'
            },
            code: 403
        }),
        notPending: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Cette réservation n\'est plus en attente.',
                en: 'This booking is no longer pending.'
            },
            code: 400
        }),
        alreadyCancelled: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Cette réservation a déjà été annulée ou refusée.',
                en: 'This booking has already been cancelled or rejected.'
            },
            code: 400
        }),
        sameTime: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Vous avez une autre réservation durant cette période.',
                en: 'You have another booking during this period.'
            },
            code: 400
        })
    },
    timezone: {
        invalid: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Fuseau horaire invalide.',
                en: 'Invalid timezone.'
            },
            code: 400
        })
    },
    lang: {
        unknown: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Langue inconnue.',
                en: 'Unknown language.'
            },
            code: 400
        })
    },
    time: {
        invalid: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Heure invalide.',
                en: 'Invalid time.'
            },
            code: 400
        }),
        required: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Heure requise.',
                en: 'Time required.'
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
        created: (req: Request, travel: Travel & { steps: Step[], driver: User }) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Trajet créé',
                en: 'Travel created'
            },
            code: 201,
            data: {
                travel: displayableTravel(travel)
            }
        }),
        updated: (req: Request, travel: Travel & { steps: Step[], driver: User }) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Trajet mis à jour',
                en: 'Travel updated'
            },
            code: 200,
            data: {
                travel: displayableTravel(travel)
            }
        }),
        cancelled: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Trajet annulé',
                en: 'Travel cancelled'
            },
            code: 200
        }),
        ended: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Trajet terminé',
                en: 'Travel ended'
            },
            code: 200
        })
    },
    group: {
        created: (req: Request, group: Group & { users: User[], creator: User }) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Groupe créé',
                en: 'Group created'
            },
            code: 201,
            data: {
                group: displayableGroup(group)
            }
        }),
        userAdded: (req: Request, group: Group & { users: User[], creator: User }) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Utilisateur ajouté',
                en: 'User added'
            },
            code: 200,
            data: {
                group: displayableGroup(group)
            }
        }),
        deleted: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Groupe supprimé',
                en: 'Group removed'
            },
            code: 200
        }),
        updated: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Groupe modifié',
                en: 'Group updated'
            },
            code: 200
        }),
        memberRemoved: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Membre retiré',
                en: 'Member removed'
            },
            code: 200
        })
    },
    notification: {
        deletedAll: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Notifications supprimées',
                en: 'Notifications removed'
            },
            code: 200
        }),
        deletedOne: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Notification supprimée',
                en: 'Notification removed'
            },
            code: 200
        })
    },
    evaluation: {
        created: (req: Request, evaluation: Evaluation & { travel: Travel, evaluated: User, evaluator: User }) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Évaluation créée',
                en: 'Evaluation created'
            },
            code: 201,
            data: {
                evaluation: displayableEvaluation(evaluation)
            }
        }),
        deleted: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Evaluation retirée',
                en: 'Evaluation removed'
            },
            code: 200
        }),
        updated: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Évaluation modifiée',
                en: 'Evaluation updated'
            },
            code: 200
        })
    },
    booking: {
        accepted: (req: Request, user: User) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Vous venez d'accepter la demande de ${user.firstName ?? ''} ${user.lastName ?? ''}.`,
                en: `You have just accepted the request of ${user.firstName ?? ''} ${user.lastName ?? ''}.`
            },
            code: 200
        }),
        rejected: (req: Request, user: User) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Vous venez de refuser la demande de ${user.firstName ?? ''} ${user.lastName ?? ''}.`,
                en: `You have just rejected the request of ${user.firstName ?? ''} ${user.lastName ?? ''}.`
            },
            code: 200
        }),
        created: (req: Request, user: User) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: `Vous venez de demander à rejoindre le trajet de ${user.firstName ?? ''} ${user.lastName ?? ''}.`,
                en: `You have asked to join ${user.firstName ?? ''} ${user.lastName ?? ''}'s trip.`
            },
            code: 200
        }),
        cancelled: (req: Request) => msgForLang<TemplateMessageHTTP, MessageHTTP>(req, {
            msg: {
                fr: 'Réservation annulée',
                en: 'Booking cancelled'
            },
            code: 200
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
                <p><a href="${String(properties.url.passwordReset)}${token}">${String(properties.url.passwordReset)}${token}</a></p>
                <p>Ce lien est valable ${translate(req, properties.token.passwordReset.expirationTxt)}. Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.</p>
                <p>Cordialement,</p>
                <p>L'équipe de ${process.env.FRONTEND_NAME ?? ''}</p>`,
                en: `${mailHtmlHeader}
                <p>Hello ${user.firstName ?? ''} ${user.lastName ?? ''},</p>
                <p>You requested to reset your password. To do so, please click on the link below:</p>
                <p><a href="${String(properties.url.passwordReset)}${token}">${String(properties.url.passwordReset)}${token}</a></p>
                <p>This link is valid for ${translate(req, properties.token.passwordReset.expirationTxt)}. If you did not request this, please ignore this email.</p>
                <p>Best regards,</p>
                <p>The ${process.env.FRONTEND_NAME ?? ''} team</p>`
            },
            text: {
                fr: `Bonjour ${user.firstName ?? ''} ${user.lastName ?? ''},
                Vous avez demandé à réinitialiser votre mot de passe. Pour ce faire, veuillez cliquer sur le lien ci-dessous :
                ${String(properties.url.passwordReset)}${token}

                Ce lien est valable ${translate(req, properties.token.passwordReset.expirationTxt)}. Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.

                Cordialement,
                L'équipe de ${process.env.FRONTEND_NAME ?? ''}`,
                en: `Hello ${user.firstName ?? ''} ${user.lastName ?? ''},
                You requested to reset your password. To do so, please click on the link below:
                ${String(properties.url.passwordReset)}${token}

                This link is valid for ${translate(req, properties.token.passwordReset.expirationTxt)}. If you did not request this, please ignore this email.

                Best regards,
                The ${process.env.FRONTEND_NAME ?? ''} team`
            }
        })
    },
    email: {
        verification: (req: Request, user: User, token: string) => msgForLang<TemplateMail, Mail>(req, {
            to: user.email,
            subject: {
                fr: 'Vérification de votre adresse email',
                en: 'Email verification'
            },
            html: {
                fr: `${mailHtmlHeader}
                <p>Bonjour ${user.firstName ?? ''} ${user.lastName ?? ''},</p>
                <p>Pour vérifier votre adresse email, veuillez cliquer sur le lien ci-dessous :</p>
                <p><a href="${String(properties.url.emailVerification)}${token}">${String(properties.url.emailVerification)}${token}</a></p>
                <p>Ce lien est valable ${translate(req, properties.token.verify.expirationTxt)}. Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.</p>
                <p>Cordialement,</p>
                <p>L'équipe de ${process.env.FRONTEND_NAME ?? ''}</p>`,
                en: `${mailHtmlHeader}
                <p>Hello ${user.firstName ?? ''} ${user.lastName ?? ''},</p>
                <p>To verify your email address, please click on the link below:</p>
                <p><a href="${String(properties.url.emailVerification)}${token}">${String(properties.url.emailVerification)}${token}</a></p>
                <p>This link is valid for ${translate(req, properties.token.verify.expirationTxt)}. If you did not request this, please ignore this email.</p>
                <p>Best regards,</p>
                <p>The ${process.env.FRONTEND_NAME ?? ''} team</p>`
            },
            text: {
                fr: `Bonjour ${user.firstName ?? ''} ${user.lastName ?? ''},
                Pour vérifier votre adresse email, veuillez cliquer sur le lien ci-dessous :
                ${String(properties.url.emailVerification)}${token}

                Ce lien est valable ${translate(req, properties.token.verify.expirationTxt)}. Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email.

                Cordialement,
                L'équipe de ${process.env.FRONTEND_NAME ?? ''}`,
                en: `Hello ${user.firstName ?? ''} ${user.lastName ?? ''},
                To verify your email address, please click on the link below:
                ${String(properties.url.emailVerification)}${token}

                This link is valid for ${translate(req, properties.token.verify.expirationTxt)}. If you did not request this, please ignore this email.

                Best regards,
                The ${process.env.FRONTEND_NAME ?? ''} team`
            }
        })
    },
    notification: {
        new: (req: Request | string | null | undefined, user: User, notification: { type: string | null, title: string, message: string, createdAt: Date } & Record<string, any>) => msgForLang<TemplateMail, Mail>(req, {
            to: user.email,
            subject: {
                fr: `Nouvelle notification : ${notification.title}`,
                en: `New notification: ${notification.title}`
            },
            html: {
                fr: `${mailHtmlHeader}
                <p>Bonjour ${user.firstName ?? ''} ${user.lastName ?? ''},</p>
                <p>Vous avez reçu une nouvelle notification :</p>
                <div style="border: 1px solid #ccc; border-radius: 0.5em; padding: 1em; margin: 1em 0;">
                    <div style="font-weight: bold;">
                        <p style="font-size: 0.8em; opacity: 0.5;">${dateToString(notification.createdAt, user.timezone, 'fr')}</p>
                        <p>${notification.title}</p>
                    </div>
                    <p style="margin-top: 0.5em;">${notification.message}</p>
                </div>
                ${notification.type === 'request'
                    ? `<p>Pour accepter ou refuser cette demande, <a href="${String(properties.url.notifs)}">rendez-vous sur votre espace personnel</a>.</p>`
                    : ''}
                <p>Cordialement,</p>
                <p>L'équipe de ${process.env.FRONTEND_NAME ?? ''}</p>`,
                en: `${mailHtmlHeader}
                <p>Hello ${user.firstName ?? ''} ${user.lastName ?? ''},</p>
                <p>You received a new notification:</p>
                <div style="border: 1px solid #ccc; border-radius: 0.5em; padding: 1em; margin: 1em 0;">
                    <div style="font-weight: bold;">
                        <p style="font-size: 0.8em; opacity: 0.5;">${dateToString(notification.createdAt, user.timezone, 'en')}</p>
                        <p>${notification.title}</p>
                    </div>
                    <p style="margin-top: 0.5em;">${notification.message}</p>
                </div>
                ${notification.type === 'request'
                    ? `<p>To accept or refuse this request, <a href="${String(properties.url.notifs)}">go to your personal space</a>.</p>`
                    : ''}
                <p>Best regards,</p>
                <p>The ${process.env.FRONTEND_NAME ?? ''} team</p>`
            },
            text: {
                fr: `Bonjour ${user.firstName ?? ''} ${user.lastName ?? ''},
                Vous avez reçu une nouvelle notification :
                ${notification.title}
                ${dateToString(notification.createdAt, user.timezone, 'fr')}
                ${notification.message}

                ${notification.type === 'request'
                    ? `\nPour accepter ou refuser cette demande, rendez-vous sur votre espace personnel : ${String(properties.url.notifs)}\n`
                    : ''}

                Cordialement,
                L'équipe de ${process.env.FRONTEND_NAME ?? ''}`,
                en: `Hello ${user.firstName ?? ''} ${user.lastName ?? ''},
                You received a new notification:
                ${notification.title}
                ${dateToString(notification.createdAt, user.timezone, 'en')}
                ${notification.message}

                ${notification.type === 'request'
                    ? `\nTo accept or refuse this request, go to your personal space: ${String(properties.url.notifs)}\n`
                    : ''}

                Best regards,
                The ${process.env.FRONTEND_NAME ?? ''} team`
            }
        })
    }
} satisfies TranslationsMail;

const notifs = {
    request: {
        new: (user: User, travel: Travel & { steps: Step[] }, booking: Booking & { arrival: Step, departure: Step, passenger: User }, sender: User) => msgForLang<TemplateNotif, Notif>(user.lang, {
            title: {
                fr: 'Nouvelle demande',
                en: 'New request'
            },
            message: {
                fr: `${sender.firstName ?? ''} ${sender.lastName ?? ''} souhaite vous accompagner sur le trajet ${travel.steps[0].city} - ${travel.steps[travel.steps.length - 1].city}` +
                 ` (du ${dateToString(new Date(travel.steps[0].date), user.timezone, 'fr')}) de l'étape ${booking.departure.city} à ${booking.arrival.city}.` +
                    (booking.comment === null || booking.comment === ''
                        ? ''
                        : `\n\n${sender.firstName ?? ''} ${sender.lastName ?? ''} vous a laissé le message suivant :\n${booking.comment ?? ''}`),
                en: `${sender.firstName ?? ''} ${sender.lastName ?? ''} wants to accompany you on the trip ${travel.steps[0].city} - ${travel.steps[travel.steps.length - 1].city}` +
                    ` (from ${dateToString(new Date(travel.steps[0].date), user.timezone, 'en')}) from the step ${booking.departure.city} to ${booking.arrival.city}.` +
                    (booking.comment === null || booking.comment === ''
                        ? ''
                        : `\n\n${sender.firstName ?? ''} ${sender.lastName ?? ''} left you the following message:\n${booking.comment ?? ''}`)
            },
            type: 'request',
            createdAt: new Date()
        }),
        accepted: (user: User, oldNotif: Notification, passenger: User, date: Date) => msgForLang<TemplateNotif, Notif>(user.lang, {
            title: {
                fr: `Demande de ${passenger.firstName ?? ''} ${passenger.lastName ?? ''} acceptée`,
                en: `Request from ${passenger.firstName ?? ''} ${passenger.lastName ?? ''} accepted`
            },
            message: {
                fr: `${oldNotif.message}
                \n =====================
                \nVous avez accepté la demande de ${passenger.firstName ?? ''} ${passenger.lastName ?? ''} le ${dateToString(date, user.timezone, 'fr')}.`,
                en: `${oldNotif.message}
                \n =====================
                \nYou accepted the request from ${passenger.firstName ?? ''} ${passenger.lastName ?? ''} on ${dateToString(date, user.timezone, 'en')}.`
            },
            type: 'request.accepted',
            createdAt: date
        }),
        rejected: (user: User, oldNotif: Notification, passenger: User, date: Date) => msgForLang<TemplateNotif, Notif>(user.lang, {
            title: {
                fr: `Demande de ${passenger.firstName ?? ''} ${passenger.lastName ?? ''} refusée`,
                en: `Request from ${passenger.firstName ?? ''} ${passenger.lastName ?? ''} rejected`
            },
            message: {
                fr: `${oldNotif.message}
                \n =====================
                \nVous avez refusé la demande de ${passenger.firstName ?? ''} ${passenger.lastName ?? ''} le ${dateToString(date, user.timezone, 'fr')}.`,
                en: `${oldNotif.message}
                \n =====================
                \nYou rejected the request from ${passenger.firstName ?? ''} ${passenger.lastName ?? ''} on ${date.toLocaleString('en-US')}.`
            },
            type: 'request.rejected',
            createdAt: date
        })
    },
    travel: {
        cancelled: (user: User, departure: Step, arrival: Step, byAdmin: boolean, reason: string | undefined) => msgForLang<TemplateNotif, Notif>(user.lang, {
            title: {
                fr: 'Annulation de trajet',
                en: 'Travel cancelled'
            },
            message: {
                fr: `Votre trajet de ${departure.city} à ${arrival.city} du ${dateToString(departure.date, user.timezone, 'fr')} a été annulé par ${byAdmin ? 'un administateur' : 'le conducteur'}.` +
                    (reason === undefined ? '' : `\n\nRaison : ${reason}`),
                en: `Your trip from ${departure.city} to ${arrival.city} on ${dateToString(departure.date, user.timezone, 'en')} has been cancelled by ${byAdmin ? 'an administrator' : 'the driver'}.` +
                    (reason === undefined ? '' : `\n\nReason: ${reason}`)
            },
            type: 'standard',
            createdAt: new Date()
        }),
        ended: (user: User, departure: Step, arrival: Step, byAdmin: boolean) => msgForLang<TemplateNotif, Notif>(user.lang, {
            title: {
                fr: 'Fin de trajet',
                en: 'Travel finished'
            },
            message: {
                fr: `Votre trajet de ${departure.city} à ${arrival.city} du ${dateToString(departure.date, user.timezone, 'fr')} a été marqué fini par ${byAdmin ? 'un administateur' : 'le conducteur'}.`,
                en: `Your trip from ${departure.city} to ${arrival.city} on ${dateToString(departure.date, user.timezone, 'en')} has been marked finished by ${byAdmin ? 'an administrator' : 'the driver'}.`
            },
            type: 'standard',
            createdAt: new Date()
        }),
        updated: (user: User, travel: Travel & { steps: Step[] }, reason: string | undefined) => msgForLang<TemplateNotif, Notif>(user.lang, {
            title: {
                fr: 'Modification de votre trajet par un administrateur',
                en: 'Your trip has been modified by an administrator'
            },
            message: {
                fr: `Votre trajet de ${travel.steps[0].city} à ${travel.steps[travel.steps.length - 1].city} du ${dateToString(new Date(travel.steps[0].date), user.timezone, 'fr')} a été modifié par un administrateur.` +
                '\n\nVeuillez vérifier que les informations sont correctes et que vous êtes toujours disponible pour ce trajet.' +
                (reason === undefined ? '' : `\n\nRaison : ${reason}`),
                en: `Your trip from ${travel.steps[0].city} to ${travel.steps[travel.steps.length - 1].city} on ${dateToString(new Date(travel.steps[0].date), user.timezone, 'en')} has been modified by an administrator.` +
                '\n\nPlease check that the information is correct and that you are still available for this trip.' +
                (reason === undefined ? '' : `\n\nReason: ${reason}`)
            },
            type: 'standard',
            createdAt: new Date()
        }),
        invitation: (user: User, travel: Travel & { steps: Step[], driver: User }, groupName: string) => msgForLang<TemplateNotif, Notif>(user.lang, {
            title: {
                fr: `Invitation de ${travel.driver.firstName ?? ''} ${travel.driver.lastName ?? ''}`,
                en: `Invitation from ${travel.driver.firstName ?? ''} ${travel.driver.lastName ?? ''}`
            },
            message: {
                fr: `Vous êtes dans le groupe "${groupName}" de ${travel.driver.firstName ?? ''} ${travel.driver.lastName ?? ''} et ce conducteur vous invite à le/la rejoindre` +
                    ` sur le trajet ${travel.steps[0].city} - ${travel.steps[travel.steps.length - 1].city} (du ${dateToString(new Date(travel.steps[0].date), user.timezone, 'fr')}).`,
                en: `You are in the group "${groupName}" of ${travel.driver.firstName ?? ''} ${travel.driver.lastName ?? ''} and this driver invites you to join him/her` +
                    ` on the trip ${travel.steps[0].city} - ${travel.steps[travel.steps.length - 1].city} (on ${dateToString(new Date(travel.steps[0].date), user.timezone, 'en')}).`
            },
            type: 'standard',
            createdAt: new Date()
        })
    },
    booking: {
        accepted: (user: User, booking: Booking & { departure: Step, arrival: Step } & Record<string, any>) => msgForLang<TemplateNotif, Notif>(user.lang, {
            title: {
                fr: 'Réservation acceptée',
                en: 'Booking accepted'
            },
            message: {
                fr: `Votre réservation pour le trajet ${booking.departure.city} - ${booking.arrival.city} du ${dateToString(booking.departure.date, user.timezone, 'fr')} a été acceptée par le conducteur.`,
                en: `Your booking for the trip ${booking.departure.city} - ${booking.arrival.city} on ${dateToString(booking.departure.date, user.timezone, 'en')} has been accepted by the driver.`
            },
            type: 'standard',
            createdAt: new Date()
        }),
        rejected: (user: User, booking: Booking & { departure: Step, arrival: Step } & Record<string, any>) => msgForLang<TemplateNotif, Notif>(user.lang, {
            title: {
                fr: 'Réservation refusée',
                en: 'Booking rejected'
            },
            message: {
                fr: `Votre réservation pour le trajet ${booking.departure.city} - ${booking.arrival.city} du ${dateToString(booking.departure.date, user.timezone, 'fr')} a été refusée par le conducteur.`,
                en: `Your booking for the trip ${booking.departure.city} - ${booking.arrival.city} on ${dateToString(booking.departure.date, user.timezone, 'en')} has been rejected by the driver.`
            },
            type: 'standard',
            createdAt: new Date()
        }),
        cancelled: (user: User, booking: (Booking & { departure: Step, arrival: Step, passenger: User }), travel: Travel & { steps: Step[] } & Record<string, any>, previousStatus: number) => msgForLang<TemplateNotif, Notif>(user.lang, {
            title: {
                fr: 'Annulation de réservation',
                en: 'Booking cancellation'
            },
            message: {
                fr: `${booking.passenger.firstName ?? ''} ${booking.passenger.lastName ?? ''} a annulé sa réservation de ${booking.departure.city} à ${booking.arrival.city}` +
                ` sur le trajet ${travel.steps[0].city} - ${travel.steps[travel.steps.length - 1].city} du ${dateToString(booking.departure.date, user.timezone, 'fr')}.\n` +
                (() => {
                    switch (previousStatus) {
                        case properties.booking.status.accepted:
                            return 'Vous aviez accepté cette réservation.'
                        case properties.booking.status.rejected:
                            return 'Vous aviez refusé cette réservation.'
                        default:
                            return 'Vous n\'aviez pas encore répondu à cette demande.'
                    }
                })(),
                en: `${booking.passenger.firstName ?? ''} ${booking.passenger.lastName ?? ''} cancelled his booking from ${booking.departure.city} to ${booking.arrival.city}` +
                ` on the trip ${travel.steps[0].city} - ${travel.steps[travel.steps.length - 1].city} on ${dateToString(booking.departure.date, user.timezone, 'en')}.\n` +
                (() => {
                    switch (previousStatus) {
                        case properties.booking.status.accepted:
                            return 'You had accepted this booking.'
                        case properties.booking.status.rejected:
                            return 'You had rejected this booking.'
                        default:
                            return 'You had not yet answered this request.'
                    }
                })()
            },
            type: 'standard',
            createdAt: new Date()
        }),
        travelUpdated: (user: User, booking: Booking & { departure: Step, passenger: User, arrival: Step } & Record<string, any>, byAnAdmin: boolean, reason: string | undefined) => msgForLang<TemplateNotif, Notif>(user.lang, {
            title: {
                fr: 'Modification de trajet',
                en: 'Travel updated'
            },
            message: {
                fr: `Votre trajet de ${booking.departure.city} à ${booking.arrival.city} du ${dateToString(booking.departure.date, user.timezone, 'fr')} a été modifié par ${byAnAdmin ? 'un administrateur' : 'le conducteur'}.` +
                '\n\nVeuillez vérifier que vous êtes toujours disponible pour ce trajet.' +
                    (reason === undefined ? '' : `\n\nRaison : ${reason}`),
                en: `Your trip from ${booking.departure.city} to ${booking.arrival.city} on ${dateToString(booking.departure.date, user.timezone, 'en')} has been updated by ${byAnAdmin ? 'an administrator' : 'the driver'}.` +
                '\n\nPlease check that you are still available for this trip.' +
                    (reason === undefined ? '' : `\n\nReason: ${reason}`)
            },
            type: 'standard',
            createdAt: new Date()
        }),
        deletedDueToTravelUpdate: (user: User, booking: Booking & { departure: Step, passenger: User, arrival: Step } & Record<string, any>, updatedTravel: Travel & { steps: Step[], driver: User } & Record<string, any>, byAnAdmin: boolean, reason: string | undefined) => msgForLang<TemplateNotif, Notif>(user.lang, {
            title: {
                fr: 'Réservation supprimée suite à modification de trajet',
                en: 'Booking deleted due to travel update'
            },
            message: {
                fr: `Votre réservation pour le trajet ${booking.departure.city} - ${booking.arrival.city} du ${dateToString(booking.departure.date, user.timezone, 'fr')} a été supprimée suite à une modification du trajet par ${byAnAdmin ? 'un administrateur' : 'le conducteur'}.` +
                `\nLe trajet ne passe plus par ${updatedTravel.steps.findIndex(s => s.id === booking.departure.id) === -1 ? booking.departure.city : booking.arrival.city}.` +
                    (reason === undefined ? '' : `\n\nRaison : ${reason}`),
                en: `Your booking for the trip ${booking.departure.city} - ${booking.arrival.city} on ${dateToString(booking.departure.date, user.timezone, 'en')} has been deleted due to a modification of the trip by ${byAnAdmin ? 'an administrator' : 'the driver'}.` +
                `\nThe travel no longer passes through ${updatedTravel.steps.findIndex(s => s.id === booking.departure.id) === -1 ? booking.departure.city : booking.arrival.city}.` +
                    (reason === undefined ? '' : `\n\nReason: ${reason}`)
            },
            type: 'standard',
            createdAt: new Date()
        })
    },
    group: {
        nameUpdated: (user: User, oldName: string, newName: string, byAdmin: boolean, toTheOwner: boolean) => msgForLang<TemplateNotif, Notif>(user.lang, {
            title: {
                fr: 'Nom du groupe modfié',
                en: 'Group name updated'
            },
            message: {
                fr: `${toTheOwner ? 'Votre' : 'Le'} groupe ${oldName} a été renommé en ${newName} par ${byAdmin ? 'un administrateur' : 'le créateur'}.`,
                en: `${toTheOwner ? 'Your' : 'The'} group ${oldName} has been renamed to ${newName} by ${byAdmin ? 'an administrator' : 'the creator'}.`
            },
            type: 'standard',
            createdAt: new Date()
        }),
        userAdded: (user: User, group: Group, creator: User) => msgForLang<TemplateNotif, Notif>(user.lang, {
            title: {
                fr: 'Ajout dans un groupe',
                en: 'Added to a group'
            },
            message: {
                fr: `${creator.firstName ?? ''} ${creator.lastName ?? ''} vous a ajouté dans le groupe ${group.name}, vous recevrez toutes les notifications de ce groupe.`,
                en: `${creator.firstName ?? ''} ${creator.lastName ?? ''} added you to the group ${group.name}, you will receive all notifications from this group.`
            },
            type: 'standard',
            createdAt: new Date()
        }),
        deleted: (user: User, group: Group, creator: User, byAdmin: boolean) => msgForLang<TemplateNotif, Notif>(user.lang, {
            title: {
                fr: 'Groupe supprimé',
                en: 'Group deleted'
            },
            message: {
                fr: `${byAdmin ? 'Un administateur' : `${creator.firstName ?? ''} ${creator.lastName ?? ''}`} a supprimé le groupe ${group.name}. Tous les trajets reliés à ce groupe ont été supprimées et vous ne recevrez plus de notifications de ce groupe.`,
                en: `${byAdmin ? 'An administrator' : `${creator.firstName ?? ''} ${creator.lastName ?? ''}`} deleted the group ${group.name}. All trips related to this group have been deleted and you will no longer receive notifications from this group.`
            },
            type: 'standard',
            createdAt: new Date()
        }),
        userRemoved: (user: User, group: Group, creator: User) => msgForLang<TemplateNotif, Notif>(user.lang, {
            title: {
                fr: 'Retiré d\'un groupe',
                en: 'Removed from a group'
            },
            message: {
                fr: `${creator.firstName ?? ''} ${creator.lastName ?? ''} vous a retiré du groupe ${group.name}, vous ne recevrez plus les notifications de ce groupe.`,
                en: `${creator.firstName ?? ''} ${creator.lastName ?? ''} removed you from the group ${group.name}, you will no longer receive notifications from this group.`
            },
            type: 'standard',
            createdAt: new Date()
        })
    },
    general: {
        welcome: (user: User) => msgForLang<TemplateNotif, Notif>(user.lang, {
            title: {
                fr: `Bienvenue sur ${process.env.FRONTEND_NAME ?? ''} !`,
                en: `Welcome to ${process.env.FRONTEND_NAME ?? ''}!`
            },
            message: {
                fr: `Bonjour ${user.firstName ?? ''} ${user.lastName ?? ''} !\n\n` +
                    'Nous sommes ravis de vous compter parmi nous !\n' +
                    `Si ce n'est pas déjà fait, pensez à vérifier votre adresse mail pour accéder à l'ensemble des fonctionnalités de ${process.env.FRONTEND_NAME ?? ''} !\n\n` +
                    'À bientôt !',
                en: `Hello ${user.firstName ?? ''} ${user.lastName ?? ''}!\n\n` +
                    'We are delighted to welcome you among us!\n' +
                    `If it is not already done, don't forget to verify your email address to access all the features of ${process.env.FRONTEND_NAME ?? ''} !\n\n` +
                    'See you soon!'
            },
            type: 'standard',
            createdAt: new Date()
        })
    }
} satisfies TranslationsNotif;

/**
 * Returns the message for the language of the request
 * @param langOrRequest Language or request
 * @param message Message to translate
 * @returns Translated message
 */
function msgForLang<T extends TemplateMessage, U extends Message> (langOrRequest: string | Request | null | undefined, message: T): U {
    const newMessage: Record<any, any> = {};

    for (const key in message) {
        const value = message[key];
        if (areVariants(value)) {
            newMessage[key] = translate(langOrRequest, value);
        } else {
            newMessage[key] = message[key];
        }
    }

    return newMessage as U;
}

/**
 * Checks if the given object is a Variants object
 * @param obj Object to check
 */
function areVariants (obj: any): obj is Variants {
    return typeof obj === 'object' && properties.settings.defaultLanguage in obj;
}

/**
 * Translates a message by choosing the right variant
 * @param langOrRequest Language or request
 * @param variants Variants of the message
 * @returns Translated message
 */
function translate (langOrRequest: string | Request | null | undefined, variants: Variants): string {
    if (langOrRequest === null || langOrRequest === undefined) {
        return variants[properties.settings.defaultLanguage];
    }
    if (typeof langOrRequest === 'string') {
        return variants[langOrRequest] ?? variants[properties.settings.defaultLanguage];
    }
    return variants[langOrRequest.acceptsLanguages().find((lang) => lang in variants) ?? properties.settings.defaultLanguage];
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
        message: msg.msg,
        ...msg.data
    });
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
 * Will send a notification to the user
 * @param user User to notify
 * @param notification Notification to send
 */
function notify (user: User, notification: { type: string | null, title: string, message: string, createdAt: Date } & Record<string, any>) {
    if (!user.mailNotif || user.emailVerifiedOn === null) return;
    mailerSend(mail.notification.new(user.lang, user, notification))
        .then(() => {
            console.log(`Notification sent to ${user.email}.`);
        }).catch((err) => {
            console.error(`Failed to send notification to ${user.email}.`);
            console.error(err);
        });
}

/**
 * Returns a user without some properties for display to the user itself or to admins
 * @param user User to display
 * @see displayableUserPublic
 */
function displayableUserPrivate (user: User): Partial<User> {
    const u = user as any;
    if (typeof u.firstName === 'string') u.firstName = titleCase(u.firstName);
    if (typeof u.lastName === 'string') u.lastName = u.lastName.toUpperCase();
    delete u.password;
    delete u.lastPasswordResetEmailedOn;
    delete u.lastEmailVerificationEmailedOn;
    return u;
}

/**
 * Returns a user without some properties for display to other users
 * @param user User to display
 * @see displayableUserPrivate
 */
function displayableUserPublic (user: User): Partial<User> {
    const u = displayableUserPrivate(user);
    delete u.mailNotif;
    delete u.createdAt;
    return u;
}

/**
 * Returns only the minimal information about a user for display
 * @param user User to display
 */
function displayableUserMinimal (user: User | Partial<User>): Partial<User> {
    const { id, firstName, lastName, email } = user;
    return {
        id,
        firstName: titleCase(firstName ?? ''),
        lastName: lastName?.toUpperCase(),
        email
    };
}

/**
 * Returns a travel without some properties for display to all users
 * @param travel Travel to display
 */
function displayableTravel (travel: Travel & { steps: Step[], driver: User }): Partial<Travel> {
    const t = Object.assign({}, travel) as any;
    t.driver = displayableUserPublic(t.driver);
    return t;
}

/**
 * Returns a group without some properties for display to all users
 * @param group Group to display
 */
function displayableGroup (group: Group & { users: User[], creator: User }): Partial<Group> {
    const g = group as any;
    g.users = g.users.map(displayableUserPublic);
    g.creator = displayableUserPublic(g.creator);
    return g;
}

/**
 * Returns a value with avg and count rename
 * @param value value to rename avg and count
 * @returns value with rename
 */
function displayableAverage (value: any) {
    const v = value;
    v.average = value._avg;
    delete v._avg;
    v.count = value._count;
    delete v._count;
    return v;
}

/**
 * Returns an evaluation without some properties for display to all users
 * @param evaluation Evaluation to display
 * @returns User without some properties
 * @see displayableUserPrivate
 */
function displayableEvaluation (evaluation: Evaluation & { travel: Travel, evaluated: User, evaluator: User }) {
    const e = evaluation as any;
    e.evaluated = displayableUserPublic(e.evaluated);
    e.evaluator = displayableUserPublic(e.evaluator);
    delete e.createdAt;
    delete e.travelId;
    delete e.evaluatedId;
    delete e.evaluatorId;
    return e;
}

/**
 * Returns a date as a string
 * @param date Date to format
 * @param timezone Timezone to use (default: {@link properties.settings.defaultTimezone})
 * @param lang Language to use (default: {@link properties.settings.defaultLanguage})
 * @returns Formatted date in the given timezone and language
 */
function dateToString (date: Date, timezone: string | null | undefined, lang: string | null | undefined) {
    if (timezone === null || timezone === undefined) timezone = properties.settings.defaultTimezone;
    if (lang === null || lang === undefined) lang = properties.settings.defaultLanguage;
    return moment.tz(date, timezone).locale(lang).format('LLL')
}
/**
 * Returns a trip without all the steps, with only the start and finish.
 * @param travel Travel to display
 */
function displayableSteps (travel: Travel & { driver: User, steps: Step[] }): Partial<Travel> {
    const t = Object.assign({}, travel) as any;
    t.driver = displayableUserPublic(t.driver);
    t.departure = travel.steps[0];
    t.arrival = travel.steps[travel.steps.length - 1];
    delete t.steps;

    return t;
}

export {
    error,
    info,
    mail,
    notifs,
    sendMsg,
    sendMail,
    notify,
    displayableUserPrivate,
    displayableUserPublic,
    displayableUserMinimal,
    displayableTravel,
    displayableGroup,
    displayableAverage,
    displayableEvaluation,
    displayableSteps
};
