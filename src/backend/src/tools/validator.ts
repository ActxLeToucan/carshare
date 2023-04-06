/**
 * This file contains functions to check if the data sent by the client are valid.
 * The functions return true if the data are valid, false otherwise.
 * If the data are not valid, an error message can be sent to the client.
 *
 * If your function returns data, you should put it in the sanitizer.ts file.
 */

import type express from 'express';
import { error, sendMsg } from './translator';
import IsEmail from 'isemail';
import properties from '../properties';
import moment from 'moment-timezone';

/**
 * Check if a boolean field is valid
 * @param value Value to sanitize
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @param fieldName Name of the field
 * @returns true if the value is valid, false otherwise
 */
function typeBoolean (value: any, sendError: boolean, req: express.Request, res: express.Response, fieldName: string): boolean {
    if (value === undefined || value === '') {
        if (sendError) sendMsg(req, res, error.boolean.required, fieldName);
        return false;
    }
    if (typeof value !== 'boolean') {
        if (sendError) sendMsg(req, res, error.boolean.type, fieldName);
        return false;
    }
    return true;
}

/**
 * Check if a number is an integer and is in the range of the integer properties
 * @param number Number to check
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @param fieldName Name of the field
 * @param inBody Weather write "field" or "parameter" in the error message
 */
function typeInteger (number: number, sendError: boolean, req: express.Request, res: express.Response, fieldName: string, inBody: boolean = true): boolean {
    if (!typeNumber(number, sendError, req, res, fieldName, inBody)) return false;
    if (!Number.isInteger(number)) {
        if (sendError) sendMsg(req, res, error.integer.type, fieldName, inBody);
        return false;
    }
    if (number < properties.integer.min || number > properties.integer.max) {
        if (sendError) sendMsg(req, res, error.integer.outOfRange, properties.integer.min, properties.integer.max, fieldName, inBody);
        return false;
    }
    return true;
}

/**
 * Check if a number field is valid
 * @param value Value to sanitize
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @param fieldName Name of the field
 * @param inBody Weather write "field" or "parameter" in the error message
 * @returns true if the value is valid, false otherwise
 */
function typeNumber (value: any, sendError: boolean, req: express.Request, res: express.Response, fieldName: string, inBody: boolean = true): boolean {
    if (value === undefined || value === '') {
        if (sendError) sendMsg(req, res, error.number.required, fieldName, inBody);
        return false;
    }
    if (typeof value !== 'number') {
        if (sendError) sendMsg(req, res, error.number.type, fieldName, inBody);
        return false;
    }
    return true;
}

/**
 * Check if a string field is valid
 * @param value Value to sanitize
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @param fieldName Name of the field
 * @returns true if the value is valid, false otherwise
 */
function typeString (value: any, sendError: boolean, req: express.Request, res: express.Response, fieldName: string): boolean {
    if (value === undefined || value === '') {
        if (sendError) sendMsg(req, res, error.string.required, fieldName);
        return false;
    }
    if (typeof value !== 'string') {
        if (sendError) sendMsg(req, res, error.string.type, fieldName);
        return false;
    }
    return true;
}

/**
 * Check if the email is in a valid format
 * @param email Email to check
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @param checkFormat If true, check if the email is valid
 * @returns true if the email is valid, false otherwise
 */
function email (email: any, sendError: boolean, req: express.Request, res: express.Response, checkFormat: boolean = true): boolean {
    if (!typeString(email, sendError, req, res, 'email')) return false;
    if (checkFormat) {
        if (!IsEmail.validate(email)) {
            if (sendError) sendMsg(req, res, error.email.invalid);
            return false;
        }
        if (email.length > properties.email.max) {
            if (sendError) sendMsg(req, res, error.email.max, properties.email.max);
            return false;
        }
    }
    return true;
}

/**
 * Check if the password is in a valid format
 * @param password Password to check
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @param checkFormat If true, check if the password is valid
 * @returns true if the password is valid, false otherwise
 */
function password (password: any, sendError: boolean, req: express.Request, res: express.Response, checkFormat = true): boolean {
    if (!typeString(password, sendError, req, res, 'password')) return false;
    if (checkFormat) {
        if (password.length < properties.password.min) {
            if (sendError) sendMsg(req, res, error.password.min, properties.password.min);
            return false;
        }
        const upper = password.match(/[A-Z]/g);
        if (upper === null || upper.length < properties.password.upper) {
            if (sendError) sendMsg(req, res, error.password.upper, properties.password.upper);
            return false;
        }
        const lower = password.match(/[a-z]/g);
        if (lower === null || lower.length < properties.password.lower) {
            if (sendError) sendMsg(req, res, error.password.lower, properties.password.lower);
            return false;
        }
        const number = password.match(/[0-9]/g);
        if (number === null || number.length < properties.password.number) {
            if (sendError) sendMsg(req, res, error.password.number, properties.password.number);
            return false;
        }
        const special = password.match(/[^A-Za-z0-9]/g);
        if (special === null || special.length < properties.password.special) {
            if (sendError) sendMsg(req, res, error.password.special, properties.password.special);
            return false;
        }
    }
    return true;
}

/**
 * Check if the old password is in a valid format
 * @param oldPassword Old password to check
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @returns true if the old password is valid, false otherwise
 */
function passwordOld (oldPassword: any, sendError: boolean, req: express.Request, res: express.Response): boolean {
    return typeString(oldPassword, sendError, req, res, 'oldPassword');
}

/**
 * Check if the lastname is in a valid format
 * @param lastname Lastname to check
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @returns true if the lastname is valid, false otherwise
 */
function lastName (lastname: any, sendError: boolean, req: express.Request, res: express.Response): boolean {
    if (!typeString(lastname, sendError, req, res, 'lastName')) return false;
    if (lastname.length > properties.lastname.max) {
        if (sendError) sendMsg(req, res, error.lastname.max, properties.lastname.max);
        return false;
    }
    if (lastname.match(/[0-9]/g) !== null) {
        if (sendError) sendMsg(req, res, error.lastname.number);
        return false;
    }
    return true;
}

/**
 * Check if the firstname is in a valid format
 * @param firstname Firstname to check
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @returns true if the firstname is valid, false otherwise
 */
function firstName (firstname: any, sendError: boolean, req: express.Request, res: express.Response): boolean {
    if (!typeString(firstname, sendError, req, res, 'firstname')) return false;
    if (firstname.length > properties.firstname.max) {
        if (sendError) sendMsg(req, res, error.firstname.max, properties.firstname.max);
        return false;
    }
    if (firstname.match(/[0-9]/g) !== null) {
        if (sendError) sendMsg(req, res, error.firstname.number);
        return false;
    }
    return true;
}

/**
 * Check if the level is in a valid format
 * @param level Level to sanitize
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @returns true if the level is valid, false otherwise
 */
function level (level: any, sendError: boolean, req: express.Request, res: express.Response): boolean {
    if (!typeInteger(level, sendError, req, res, 'level')) return false;
    if (res.locals.user.level <= level) {
        if (sendError) sendMsg(req, res, error.level.tooHigh);
        return false;
    }
    return true;
}

/**
 * Check if the group name is in a valid format
 * @param name Group name to check
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @returns true if the group name is valid, false otherwise
 */
function groupName (name: any, sendError: boolean, req: express.Request, res: express.Response): boolean {
    return typeString(name, sendError, req, res, 'name');
}

/**
 * Check if a date is in a valid format
 * @param date Date to check
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @param travelHours add a check, if the date must not be within the next 24 hours.
 * @returns true if the date is valid, false otherwise
 */
function date (date: any, sendError: boolean, req: express.Request, res: express.Response, travelHours: boolean): boolean {
    if (date === undefined || date === '') {
        if (sendError) sendMsg(req, res, error.date.required);
        return false;
    }
    if (isNaN(new Date(date).getTime())) {
        if (sendError) sendMsg(req, res, error.date.invalid);
        return false;
    }

    if (travelHours) {
        if (!checkTravelHours(new Date(date))) {
            if (sendError) sendMsg(req, res, error.date.tooSoon, moment().add(properties.travel.hoursLimit, 'hours').toDate(), res.locals.user.timezone);
            return false;
        }
    }
    return true;
}

/**
 * Check if a city is in a valid format
 * @param name City to check
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @param fieldName Name of the field
 * @returns true if the city is valid, false otherwise
 */
function city (name: any, sendError: boolean, req: express.Request, res: express.Response, fieldName: string): boolean {
    return typeString(name, sendError, req, res, fieldName);
}

/**
 * Check if a price field is valid
 * @param value Value to sanitize
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @returns true if the value is valid and a positive number, false otherwise
 */
function price (value: any, sendError: boolean, req: express.Request, res: express.Response): boolean {
    if (!typeNumber(value, sendError, req, res, 'price')) return false;

    if (value < 0) {
        if (sendError) sendMsg(req, res, error.number.min, 'price', 0);
        return false;
    }
    return true;
}

/**
 * Check if a price field is valid
 * @param value Value to sanitize
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @returns true if the value is valid, false otherwise
 */
function maxPassengers (value: any, sendError: boolean, req: express.Request, res: express.Response): boolean {
    if (!typeInteger(value, sendError, req, res, 'maxPassengers')) return false;

    if (value < 1) {
        if (sendError) sendMsg(req, res, error.number.min, 'maxPassengers', 1);
        return false;
    }
    return true;
}

/**
 * Check if a lng field is valid
 * @param value Value to sanitize
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @param fieldName Name of the field
 * @returns true if the value is valid and if the value is between -180 and 180, false otherwise
 */
function longitude (value: any, sendError: boolean, req: express.Request, res: express.Response, fieldName: string): boolean {
    if (!typeNumber(value, sendError, req, res, fieldName)) return false;

    if (value < -180 || value > 180) {
        if (sendError) sendMsg(req, res, error.longitude.minMax, properties.longitude.min, properties.longitude.max);
        return false;
    }
    return true;
}

/**
 * Check if a lat field is valid
 * @param value Value to sanitize
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @param fieldName Name of the field
 * @returns true if the value is valid and if the value is between -90 and 90, false otherwise
 */
function latitude (value: any, sendError: boolean, req: express.Request, res: express.Response, fieldName: string): boolean {
    if (!typeNumber(value, sendError, req, res, fieldName)) return false;

    if (value < -90 || value > 90) {
        if (sendError) sendMsg(req, res, error.latitude.minMax, properties.latitude.min, properties.latitude.max);
        return false;
    }
    return true;
}

/**
 * Check if a description field is valid
 * @param value Value to sanitize
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @returns true if the value is valid, false otherwise
 */
function description (value: any, sendError: boolean, req: express.Request, res: express.Response): boolean {
    if (value === undefined || value === '') return true;
    return typeString(value, sendError, req, res, 'description');
}

/**
 * Check if the dates is in a good order
 * @param date1 Date to check
 * @param date2 Date to check
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @returns true if the date is in a good order, false otherwise
 */
function checkDatesOrder (date1: any, date2: any, sendError: boolean, req: express.Request, res: express.Response): boolean {
    if (!date(date2, sendError, req, res, true)) return false;

    if (new Date(date1).getTime() === new Date(date2).getTime()) {
        if (sendError) sendMsg(req, res, error.date.identical);
        return false;
    }

    if (new Date(date1) > new Date(date2)) {
        if (sendError) sendMsg(req, res, error.steps.badOrder);
        return false;
    }
    return true;
}

/**
 * Check if the user doesn't have a trip yet
 * @param dateMin Date to check
 * @param dateMax Date to check
 * @param steps Steps of an existing travel
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @returns true if the user doesn't have a trip , false otherwise
 */
function checkTravelAlready (dateMin: any, dateMax: any, steps: any, sendError: boolean, req: express.Request, res: express.Response): boolean {
    if (steps.length === 0) return true;
    if (new Date(dateMin) >= new Date(steps[0].date) && new Date(dateMin) <= new Date(steps[steps.length - 1].date)) {
        if (sendError) sendMsg(req, res, error.steps.alreadyTravel, new Date(steps[0].date), new Date(steps[steps.length - 1].date), res.locals.user.timezone);
        return false;
    }

    if (new Date(dateMax) >= new Date(steps[0].date) && new Date(dateMax) <= new Date(steps[steps.length - 1].date)) {
        if (sendError) sendMsg(req, res, error.steps.alreadyTravel, new Date(steps[0].date), new Date(steps[steps.length - 1].date), res.locals.user.timezone);
        return false;
    }
    if ((new Date(dateMin) <= new Date(steps[0].date) && new Date(dateMax) >= new Date(steps[0].date)) && (new Date(dateMin) <= new Date(steps[steps.length - 1].date) && new Date(dateMax) >= new Date(steps[steps.length - 1].date))) {
        if (sendError) sendMsg(req, res, error.steps.alreadyTravel, new Date(steps[0].date), new Date(steps[steps.length - 1].date), res.locals.user.timezone);
        return false;
    }

    return true;
}

/**
 * Check if a list of steps is valid
 * @param steps List of steps to check
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @returns true if the list of steps is valid, false otherwise
 */
function checkStepList (steps: any, sendError: boolean, req: express.Request, res: express.Response): boolean {
    if (steps === undefined || steps === '') {
        if (sendError) sendMsg(req, res, error.steps.required);
        return false;
    }
    if (typeof steps !== 'object') {
        if (sendError) sendMsg(req, res, error.steps.type);
        return false;
    }
    if (steps.length < 2) {
        if (sendError) sendMsg(req, res, error.steps.min, properties.stepList.minLength);
        return false;
    }

    let incr: number = 1;
    for (const step in steps) {
        if (!date(steps[step].date, true, req, res, true)) return false;

        if (step !== String(steps.length - 1)) {
            if (!checkDatesOrder(steps[step].date, steps[incr].date, sendError, req, res)) return false;
        }

        if (!typeString(steps[step].label, sendError, req, res, 'label')) return false;
        if (!typeString(steps[step].city, sendError, req, res, 'city')) return false;
        if (!typeString(steps[step].context, sendError, req, res, 'context')) return false;
        if (!latitude(steps[step].lat, sendError, req, res, 'lat')) return false;
        if (!longitude(steps[step].lng, sendError, req, res, 'lng')) return false;

        if (steps[step].id !== undefined && typeof steps[step].id !== 'number') return false;

        incr += 1;
    }
    return true;
}

/**
 * Check if a note field is valid
 * @param value Value to sanitize
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @returns true if the value is valid, false otherwise
 */
function note (value: any, sendError: boolean, req: express.Request, res: express.Response): boolean {
    if (!typeInteger(value, sendError, req, res, 'note')) return false;

    if (value < properties.note.min) {
        if (sendError) sendMsg(req, res, error.number.min, 'note', 0);
        return false;
    }
    if (value > properties.note.max) {
        if (sendError) sendMsg(req, res, error.number.max, 'note', 5);
        return false;
    }
    return true;
}

/**
 * Check if a date is in editable depending on the travel hours limit
 * @param date Date to check
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @returns whether the date is in the future
 */
function checkTravelHoursEditable (date: Date, sendError: boolean, req: express.Request, res: express.Response): boolean {
    if (!checkTravelHours(date)) {
        if (sendError) sendMsg(req, res, error.travel.notModifiable, properties.travel.hoursLimit);
        return false;
    }
    return true;
}

/**
 * Check if the language is valid
 * @param lang Language to check
 * @param sendError If true, send an error message to the client
 * @param req Express request
 * @param res Express response
 * @returns true if the language is valid, false otherwise
 */
function lang (lang: any, sendError: boolean, req: express.Request, res: express.Response): boolean {
    if (!typeString(lang, sendError, req, res, 'lang')) return false;
    if (!properties.languages.includes(lang)) {
        if (sendError) sendMsg(req, res, error.lang.unknown);
        return false;
    }
    return true;
}

/**
 * Check if a date is in the future ({@link properties.travel.hoursLimit} hours)
 * @param date Date to check
 * @returns whether the date is in the future
 */
function checkTravelHours (date: Date): boolean {
    return moment().add(properties.travel.hoursLimit, 'hours').toDate() <= date;
}

export default {
    typeBoolean,
    typeInteger,
    typeString,
    city,
    date,
    description,
    email,
    firstName,
    groupName,
    lang,
    lastName,
    latitude,
    level,
    longitude,
    maxPassengers,
    note,
    password,
    passwordOld,
    price,
    checkStepList,
    checkTravelAlready,
    checkTravelHours,
    checkTravelHoursEditable
};
