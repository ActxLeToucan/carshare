import type express from 'express';
import { error, sendMsg } from './translator';
import properties from '../properties';
import moment from 'moment-timezone';
import validator from './validator';

/**
 * Sanitize the phone number
 * If the phone is not valid, send an error message to the client
 * @param phone Phone to sanitize
 * @param req Express request
 * @param res Express response
 * @returns The phone number if it is valid, null otherwise
 */
function phone (phone: any, req: express.Request, res: express.Response): string | null {
    if (phone === undefined || phone === '') {
        sendMsg(req, res, error.phone.required);
        return null;
    }
    if (typeof phone !== 'string') {
        sendMsg(req, res, error.phone.type);
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
function gender (gender: any): number | undefined {
    if (typeof gender !== 'number') {
        return undefined;
    }
    if (!properties.gender.values.includes(gender)) {
        return undefined;
    }
    return gender;
}

/**
 * Sanitize the id of user
 * @param id id to sanitize
 * @param req Express request
 * @param res Express response
 * @returns The id number if it is valid, null otherwise
 */
function id (id: any, req: express.Request, res: express.Response): number | null {
    if (id === '' || Number.isNaN(Number(id))) {
        sendMsg(req, res, error.id.invalid);
        return null;
    }

    const num = Number(id);
    if (!validator.typeInteger(num, true, req, res, 'id', false)) return null;

    return num;
}

/**
 * Sanitize the timezone
 * @param timezone Timezone to sanitize
 * @returns the timezone if it is valid, undefined otherwise
 */
function timezone (timezone: any): string | undefined {
    if (timezone === undefined || typeof timezone !== 'string' || timezone === '') return undefined;
    if (moment.tz.names().includes(timezone)) return timezone;
    return undefined;
}

/**
 * Sanitize the time
 * If the time is not valid, send an error message to the client
 * @param time Time to sanitize
 * @param req Express request
 * @param res Express response
 * @returns the time as a moment object if it is valid, null otherwise
 */
function time (time: any, req: express.Request, res: express.Response): moment.Moment | null {
    if (time === undefined || typeof time !== 'string' || time === '') {
        sendMsg(req, res, error.time.required);
        return null;
    }
    const momentTime = moment(time, 'HH:mm', true);
    if (!momentTime.isValid()) {
        sendMsg(req, res, error.time.invalid);
        return null;
    }
    return momentTime;
}

export default {
    gender,
    id,
    phone,
    time,
    timezone
}
