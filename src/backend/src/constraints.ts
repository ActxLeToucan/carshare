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
        special: 1
    },
    lastname: {
        max: 50 // from schema.prisma
    },
    firstname: {
        max: 50 // from schema.prisma
    }
}

/**
 * Check if the email is valid
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
    if (email.length > constraints.email.max) {
        sendMsg(req, res, error.email.max, constraints.email.max);
        return false;
    }
    if (!IsEmail.validate(email)) {
        sendMsg(req, res, error.email.invalid);
        return false;
    }
    return true;
}

/**
 * Check if the password is valid
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
 * Check if the lastname is valid
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
 * Check if the firstname is valid
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

export { checkEmailField, checkPasswordField, checkLastNameField, checkFirstNameField };
