import type express from 'express';
import { error, sendMsg, type Variants } from './tools/translator';
import IsEmail from 'isemail';

const txtExpirationTokenAccess: Variants = {
    fr: '24 heures',
    en: '24 hours'
}
const txtExpirationTokenPasswordReset: Variants = {
    fr: '1 heure',
    en: '1 hour'
}
const txtExpirationTokenEmailVerification: Variants = {
    fr: '4 heures',
    en: '4 hours'
}

const p: Record<string, Record<string, any>> = {
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
        admin: 1
    },
    token: {
        access: {
            expiration: '24h',
            expirationTxt: txtExpirationTokenAccess
        },
        passwordReset: {
            expiration: '1h',
            expirationTxt: txtExpirationTokenPasswordReset
        },
        verify: {
            expiration: '4h',
            expirationTxt: txtExpirationTokenEmailVerification
        }
    },
    url: {
        passwordReset: `${String(process.env.FRONTEND_URL)}/reinit?token=`,
        emailVerification: `${String(process.env.FRONTEND_URL)}/validate?token=`
    }
}

/**
 * Check if the email is in a valid format
 * If the email is not valid, send an error message to the client
 * @param email Email to check
 * @param req Express request
 * @param res Express response
 * @param checkFormat If true, check if the email is valid
 * @returns true if the email is valid, false otherwise
 */
function checkEmailField (email: string | undefined, req: express.Request, res: express.Response, checkFormat: boolean = true): boolean {
    if (email === undefined || email === '') {
        sendMsg(req, res, error.email.required);
        return false;
    }
    if (checkFormat) {
        if (!IsEmail.validate(email)) {
            sendMsg(req, res, error.email.invalid);
            return false;
        }
        if (email.length > p.email.max) {
            sendMsg(req, res, error.email.max, p.email.max);
            return false;
        }
    }
    return true;
}

/**
 * Check if the password is in a valid format
 * If the password is not valid, send an error message to the client
 * @param password Password to check
 * @param req Express request
 * @param res Express response
 * @param checkFormat If true, check if the password is valid
 * @returns true if the password is valid, false otherwise
 */
function checkPasswordField (password: string | undefined, req: express.Request, res: express.Response, checkFormat = true): boolean {
    if (password === undefined || password === '') {
        sendMsg(req, res, error.password.required);
        return false;
    }
    if (checkFormat) {
        if (password.length < p.password.min) {
            sendMsg(req, res, error.password.min, p.password.min);
            return false;
        }
        const upper = password.match(/[A-Z]/g);
        if (upper === null || upper.length < p.password.upper) {
            sendMsg(req, res, error.password.upper, p.password.upper);
            return false;
        }
        const lower = password.match(/[a-z]/g);
        if (lower === null || lower.length < p.password.lower) {
            sendMsg(req, res, error.password.lower, p.password.lower);
            return false;
        }
        const number = password.match(/[0-9]/g);
        if (number === null || number.length < p.password.number) {
            sendMsg(req, res, error.password.number, p.password.number);
            return false;
        }
        const special = password.match(/[^A-Za-z0-9]/g);
        if (special === null || special.length < p.password.special) {
            sendMsg(req, res, error.password.special, p.password.special);
            return false;
        }
    }
    return true;
}

/**
 * Check if the lastname is in a valid format
 * If the lastname is not valid, send an error message to the client
 * @param lastname Lastname to check
 * @param req Express request
 * @param res Express response
 * @returns true if the lastname is valid, false otherwise
 */
function checkLastNameField (lastname: string | undefined, req: express.Request, res: express.Response): boolean {
    if (lastname === undefined || lastname === '') {
        sendMsg(req, res, error.lastname.required);
        return false;
    }
    if (lastname.length > p.lastname.max) {
        sendMsg(req, res, error.lastname.max, p.lastname.max);
        return false;
    }
    if (lastname.match(/[0-9]/g) !== null) {
        sendMsg(req, res, error.lastname.number);
        return false;
    }
    return true;
}

/**
 * Check if the firstname is in a valid format
 * If the firstname is not valid, send an error message to the client
 * @param firstname Firstname to check
 * @param req Express request
 * @param res Express response
 * @returns true if the firstname is valid, false otherwise
 */
function checkFirstNameField (firstname: string | undefined, req: express.Request, res: express.Response): boolean {
    if (firstname === undefined || firstname === '') {
        sendMsg(req, res, error.firstname.required);
        return false;
    }
    if (firstname.length > p.firstname.max) {
        sendMsg(req, res, error.firstname.max, p.firstname.max);
        return false;
    }
    if (firstname.match(/[0-9]/g) !== null) {
        sendMsg(req, res, error.firstname.number);
        return false;
    }
    return true;
}

/**
 * Check if a date is in a valid format
 * If the date is not valid, send an error message to the client
 * @param date Date to check
 * @param req Express request
 * @param res Express response
 * @returns true if the date is valid, false otherwise
 */
function checkDateField (date: string | undefined, req: express.Request, res: express.Response): boolean {
    if (date === undefined || date === '') {
        sendMsg(req, res, error.date.required);
        return false;
    }
    if (isNaN(new Date(date).getTime())) {
        sendMsg(req, res, error.date.invalid);
        return false;
    }
    if (new Date(date) > new Date()) {
        sendMsg(req, res, error.date.tooLate, new Date());
        return false;
    }
    return true;
}

/**
 * Sanitize the phone number
 * If the phone is not valid, send an error message to the client
 * @param phone Phone to sanitize
 * @param req Express request
 * @param res Express response
 * @returns The phone number if it is valid, null otherwise
 */
function sanitizePhone (phone: string | undefined, req: express.Request, res: express.Response): string | null {
    if (phone === undefined || phone === '') {
        sendMsg(req, res, error.phone.required);
        return null;
    }
    const num = phone.replace(/(\.|\s|-)/g, '').trim();
    if (num.match(/^((00[0-9]{2})?0[0-9][0-9]{8}|\+[0-9]{11,12})$/) === null) {
        sendMsg(req, res, error.phone.invalid);
        return null;
    }
    return num;
}

/**
 * Sanitize the gender
 * @param gender Gender to sanitize
 * @returns Gender if it is valid, undefined otherwise
 */
function sanitizeGender (gender: any): number | undefined {
    if (typeof gender !== 'number') {
        return undefined;
    }
    if (p.gender.values.includes(gender) === false) {
        return undefined;
    }
    return gender;
}
/**
 * Sanitize the id of user
 * @param gender id to sanitize
 * @param req Express request
 * @param res Express response
 * @returns The id number if it is valid, null otherwise
 */
function sanitizeId (id: number | undefined, req: express.Request, res: express.Response): number | null {
    if (typeof id !== 'number' || id === undefined) {
        sendMsg(req, res, error.userId.invalid);
        return null;
    }

    return id;
}

export {
    p,
    checkEmailField,
    checkPasswordField,
    checkLastNameField,
    checkFirstNameField,
    checkDateField,
    sanitizePhone,
    sanitizeGender,
    sanitizeId
};
