import { type Variants } from './tools/translator';

const properties = {
    settings: {
        defaultLanguage: 'en',
        defaultTimezone: 'UTC'
    },
    languages: ['en', 'fr'],
    email: {
        max: 64 // from schema.prisma
    },
    password: {
        min: 10,
        upper: 1,
        lower: 1,
        number: 1,
        special: 1,
        salt: 10
    },
    lastname: {
        max: 50 // from schema.prisma
    },
    firstname: {
        max: 50 // from schema.prisma
    },
    phone: {
        max: 16 // from schema.prisma
    },
    gender: {
        values: [-1, 0, 1]
    },
    userLevel: {
        user: 0,
        admin: 1
    },
    token: {
        access: {
            expiration: '24h',
            expirationTxt: {
                fr: '24 heures',
                en: '24 hours'
            } satisfies Variants
        },
        passwordReset: {
            expiration: '1h',
            expirationTxt: {
                fr: '1 heure',
                en: '1 hour'
            } satisfies Variants
        },
        verify: {
            expiration: '4h',
            expirationTxt: {
                fr: '4 heures',
                en: '4 hours'
            } satisfies Variants
        }
    },
    url: {
        passwordReset: `${String(process.env.FRONTEND_URL)}/reinit?token=`,
        emailVerification: `${String(process.env.FRONTEND_URL)}/validate?token=`,
        notifs: `${String(process.env.FRONTEND_URL)}/profile#notifs`
    },
    mailer: {
        passwordReset: {
            cooldown: 10 * 60 * 1000, // 10 minutes
            cooldownTxt: {
                fr: '10 minutes',
                en: '10 minutes'
            } satisfies Variants
        },
        emailVerification: {
            cooldown: 10 * 60 * 1000, // 10 minutes
            cooldownTxt: {
                fr: '10 minutes',
                en: '10 minutes'
            } satisfies Variants
        }
    },
    latitude: {
        min: -90,
        max: 90
    },
    longitude: {
        min: -180,
        max: 180
    },
    stepList: {
        minLength: 2
    },
    query: {
        defaultLimit: 10,
        minLimit: 1, // in database queries, the minimum value allowed for LIMIT statements
        maxLimit: 50 // the max value allowed for LIMIT statements
    },
    note: {
        min: 0,
        max: 5
    },
    travel: {
        status: {
            cancelled: -1,
            open: 0,
            ended: 1
        },
        hoursLimit: 24,
        search: {
            maxDistance: 5 // in kilometers
        }
    },
    booking: {
        status: {
            cancelled: -1,
            pending: 0,
            accepted: 1, // this value can not be changed, it is used in the database
            rejected: 2
        }
    },
    integer: {
        min: -2147483648,
        max: 2147483647
    }
} satisfies Record<string, Record<string, any>>;

export default properties;
