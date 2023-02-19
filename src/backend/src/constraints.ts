import type express from 'express';
import { error, sendMsg } from './messages';
import IsEmail from 'isemail';

const constraints: Record<string, Record<string, any>> = {
    email: {
        max: 64 // from schema.prisma
    },
    password: {
        length: 10,
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
    birthdate: {
        regex: /^\d{4}-\d{2}-\d{2}$/ // YYYY-MM-DD
    },
    phone: {
        max: 16 // from schema.prisma
    },
    gender: {
        values: [-1, 0, 1]
    }
}

/**
 * Check if the email is in a valid format
 * If the email is not valid, send an error message to the client
 * @param email Email to check
 * @param req Express request
 * @param res Express response
 * @returns true if the email is valid, false otherwise
 */
function checkEmailField (email: string | undefined, req: express.Request, res: express.Response): boolean {
    if (email === undefined || email === '') {
        sendMsg(req, res, error.email.required);
        return false;
    }
    if (!IsEmail.validate(email)) {
        sendMsg(req, res, error.email.invalid);
        return false;
    }
    if (email.length > constraints.email.max) {
        sendMsg(req, res, error.email.max, constraints.email.max);
        return false;
    }
    return true;
}

/**
 * Check if the password is in a valid format
 * If the password is not valid, send an error message to the client
 * @param password Password to check
 * @param req Express request
 * @param res Express response
 * @returns true if the password is valid, false otherwise
 */
function checkPasswordField (password: string | undefined, req: express.Request, res: express.Response): boolean {
    if (password === undefined || password === '') {
        sendMsg(req, res, error.password.required);
        return false;
    }
    if (password.length < constraints.password.length) {
        sendMsg(req, res, error.password.length, constraints.password.length);
        return false;
    }
    const upper = password.match(/[A-Z]/g);
    if (upper === null || upper.length < constraints.password.upper) {
        sendMsg(req, res, error.password.upper, constraints.password.upper);
        return false;
    }
    const lower = password.match(/[a-z]/g);
    if (lower === null || lower.length < constraints.password.lower) {
        sendMsg(req, res, error.password.lower, constraints.password.lower);
        return false;
    }
    const number = password.match(/[0-9]/g);
    if (number === null || number.length < constraints.password.number) {
        sendMsg(req, res, error.password.number, constraints.password.number);
        return false;
    }
    const special = password.match(/[^A-Za-z0-9]/g);
    if (special === null || special.length < constraints.password.special) {
        sendMsg(req, res, error.password.special, constraints.password.special);
        return false;
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
    if (lastname.length > constraints.lastname.max) {
        sendMsg(req, res, error.lastname.max, constraints.lastname.max);
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
    if (firstname.length > constraints.firstname.max) {
        sendMsg(req, res, error.firstname.max, constraints.firstname.max);
        return false;
    }
    if (firstname.match(/[0-9]/g) !== null) {
        sendMsg(req, res, error.firstname.number);
        return false;
    }
    return true;
}

/**
 * Check if the birthdate is in a valid format
 * If the date is not valid, send an error message to the client
 * @param date Date to check
 * @param req Express request
 * @param res Express response
 * @returns true if the date is valid, false otherwise
 */
function checkBirthDateField (date: string | undefined, req: express.Request, res: express.Response): boolean {
    if (date === undefined || date === '') {
        sendMsg(req, res, error.date.required);
        return false;
    }
    if (date.match(constraints.birthdate.regex) === null) {
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
        return null;
    }
    const num = phone.replace(/[^0-9+]/g, '');
    if (num.match(/^(\+)?[0-9]{10,}$/g) === null) {
        sendMsg(req, res, error.phone.invalid);
        return null;
    }
    if (num.length > constraints.phone.max) {
        sendMsg(req, res, error.phone.max, constraints.phone.max);
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
    if (constraints.gender.values.includes(gender) === false) {
        return undefined;
    }
    return gender;
}

export {
    constraints,
    checkEmailField,
    checkPasswordField,
    checkLastNameField,
    checkFirstNameField,
    checkBirthDateField,
    sanitizePhone,
    sanitizeGender
};
