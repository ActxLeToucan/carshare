import type express from 'express';
import { error, sendMsg } from './translator';
import properties from '../properties';
import moment from 'moment-timezone';
import validator from './validator';

/**
 * Sanitize the phone number
 * @param phone Phone to sanitize
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @returns The phone number if it is valid, null otherwise
 */
function phone (phone: any, sendError: boolean, req: express.Request, res: express.Response): string | null {
    if (!validator.typeString(phone, sendError, req, res, 'phone')) return null;
    const num = phone.replace(/(\.|\s|-)/g, '').trim();
    if (num.match(/^((00[0-9]{2})?0[0-9][0-9]{8}|\+[0-9]{11,12})$/) === null) {
        if (sendError) sendMsg(req, res, error.phone.invalid);
        return null;
    }
    return num;
}

/**
 * Sanitize the gender
 * @param gender Gender to sanitize
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @returns Gender if it is valid, undefined otherwise
 */
function gender (gender: any, sendError: boolean, req: express.Request, res: express.Response): number | undefined {
    if (!validator.typeInteger(gender, sendError, req, res, 'gender')) return undefined;
    if (!properties.gender.values.includes(gender)) {
        if (sendError) sendMsg(req, res, error.gender.unknown, properties.gender.values);
        return undefined;
    }
    return gender;
}

/**
 * Sanitize a number
 * @param number Number to sanitize
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @param fieldName Name of the field
 * @param inBody Weather write "field" or "parameter" in the error message
 * @returns The number if it is valid, null otherwise
 */
function typeNumber (number: any, sendError: boolean, req: express.Request, res: express.Response, fieldName: string, inBody: boolean = true): number | undefined {
    if (number === '' || Number.isNaN(Number(number))) {
        if (sendError) sendMsg(req, res, error.number.type, fieldName, inBody);
        return undefined;
    }

    return Number(number);
}

/**
 * Sanitize the id of user
 * @param id id to sanitize
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @param fieldName Name of the field
 * @returns The id number if it is valid, null otherwise
 */
function id (id: any, sendError: boolean, req: express.Request, res: express.Response, fieldName: string = 'id'): number | null {
    const num = typeNumber(id, sendError, req, res, fieldName, false);
    if (num === undefined) return null;

    if (!validator.typeInteger(num, true, req, res, fieldName, false)) return null;

    return num;
}

/**
 * Sanitize the timezone
 * @param timezone Timezone to sanitize
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @returns the timezone if it is valid, undefined otherwise
 */
function timezone (timezone: any, sendError: boolean, req: express.Request, res: express.Response): string | undefined {
    if (!validator.typeString(timezone, sendError, req, res, 'timezone')) return undefined;
    if (!moment.tz.names().includes(timezone)) {
        if (sendError) sendMsg(req, res, error.timezone.invalid);
        return undefined;
    }
    return timezone;
}

/**
 * Sanitize the time
 * If the time is not valid, send an error message to the client
 * @param time Time to sanitize
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @returns the time as a moment object if it is valid, null otherwise
 */
function time (time: any, sendError: boolean, req: express.Request, res: express.Response): moment.Moment | null {
    if (time === undefined || typeof time !== 'string' || time === '') {
        if (sendError) sendMsg(req, res, error.time.required);
        return null;
    }
    const momentTime = moment(time, 'HH:mm', true);
    if (!momentTime.isValid()) {
        if (sendError) sendMsg(req, res, error.time.invalid);
        return null;
    }
    return momentTime;
}

export default {
    typeNumber,
    gender,
    id,
    phone,
    time,
    timezone
}
