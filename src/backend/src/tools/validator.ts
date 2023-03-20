import type express from 'express';
import { error, sendMsg } from './translator';
import IsEmail from 'isemail';
import properties from '../properties';

/**
 * Check if the email is in a valid format
 * If the email is not valid, send an error message to the client
 * @param email Email to check
 * @param req Express request
 * @param res Express response
 * @param checkFormat If true, check if the email is valid
 * @returns true if the email is valid, false otherwise
 */
function checkEmailField (email: any, req: express.Request, res: express.Response, checkFormat: boolean = true): boolean {
    if (email === undefined || email === '') {
        sendMsg(req, res, error.email.required);
        return false;
    }
    if (typeof email !== 'string') {
        sendMsg(req, res, error.email.type);
        return false;
    }
    if (checkFormat) {
        if (!IsEmail.validate(email)) {
            sendMsg(req, res, error.email.invalid);
            return false;
        }
        if (email.length > properties.email.max) {
            sendMsg(req, res, error.email.max, properties.email.max);
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
function checkPasswordField (password: any, req: express.Request, res: express.Response, checkFormat = true): boolean {
    if (password === undefined || password === '') {
        sendMsg(req, res, error.password.required);
        return false;
    }
    if (typeof password !== 'string') {
        sendMsg(req, res, error.password.type);
        return false;
    }
    if (checkFormat) {
        if (password.length < properties.password.min) {
            sendMsg(req, res, error.password.min, properties.password.min);
            return false;
        }
        const upper = password.match(/[A-Z]/g);
        if (upper === null || upper.length < properties.password.upper) {
            sendMsg(req, res, error.password.upper, properties.password.upper);
            return false;
        }
        const lower = password.match(/[a-z]/g);
        if (lower === null || lower.length < properties.password.lower) {
            sendMsg(req, res, error.password.lower, properties.password.lower);
            return false;
        }
        const number = password.match(/[0-9]/g);
        if (number === null || number.length < properties.password.number) {
            sendMsg(req, res, error.password.number, properties.password.number);
            return false;
        }
        const special = password.match(/[^A-Za-z0-9]/g);
        if (special === null || special.length < properties.password.special) {
            sendMsg(req, res, error.password.special, properties.password.special);
            return false;
        }
    }
    return true;
}

/**
 * Check if the old password is in a valid format
 * If the old password is not valid, send an error message to the client
 * @param oldPassword Old password to check
 * @param req Express request
 * @param res Express response
 * @returns true if the old password is valid, false otherwise
 */
function checkOldPasswordField (oldPassword: any, req: express.Request, res: express.Response): boolean {
    if (oldPassword === undefined || oldPassword === '') {
        sendMsg(req, res, error.oldPassword.required);
        return false;
    }
    if (typeof oldPassword !== 'string') {
        sendMsg(req, res, error.oldPassword.type);
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
function checkLastNameField (lastname: any, req: express.Request, res: express.Response): boolean {
    if (lastname === undefined || lastname === '') {
        sendMsg(req, res, error.lastname.required);
        return false;
    }
    if (typeof lastname !== 'string') {
        sendMsg(req, res, error.lastname.type);
        return false;
    }
    if (lastname.length > properties.lastname.max) {
        sendMsg(req, res, error.lastname.max, properties.lastname.max);
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
function checkFirstNameField (firstname: any, req: express.Request, res: express.Response): boolean {
    if (firstname === undefined || firstname === '') {
        sendMsg(req, res, error.firstname.required);
        return false;
    }
    if (typeof firstname !== 'string') {
        sendMsg(req, res, error.firstname.type);
        return false;
    }
    if (firstname.length > properties.firstname.max) {
        sendMsg(req, res, error.firstname.max, properties.firstname.max);
        return false;
    }
    if (firstname.match(/[0-9]/g) !== null) {
        sendMsg(req, res, error.firstname.number);
        return false;
    }
    return true;
}

/**
 * Check if the level is in a valid format
 * If the level is not valid, send an error message to the client
 * @param level Level to sanitize
 * @param req Express request
 * @param res Express response
 * @returns true if the level is valid, false otherwise
 */
function checkLevelField (level: any, req: express.Request, res: express.Response): boolean {
    if (level === undefined || level === '') {
        sendMsg(req, res, error.level.required);
        return false;
    }
    if (typeof level !== 'number') {
        sendMsg(req, res, error.level.type);
        return false;
    }
    if (res.locals.user.level <= level) {
        sendMsg(req, res, error.level.tooHigh);
        return false;
    }
    return true;
}

/**
 * Check if a boolean field is valid
 * If the boolean is not valid, send an error message to the client
 * @param value Value to sanitize
 * @param req Express request
 * @param res Express response
 * @param fieldName Name of the field
 * @returns true if the value is valid, false otherwise
 */
function checkBooleanField (value: any, req: express.Request, res: express.Response, fieldName: string): boolean {
    if (value === undefined || value === '') {
        sendMsg(req, res, error.boolean.required, fieldName);
        return false;
    }
    if (typeof value !== 'boolean') {
        sendMsg(req, res, error.boolean.type, fieldName);
        return false;
    }
    return true;
}

/**
 * Check if the group name is in a valid format
 * If the group name is not valid, send an error message to the client
 * @param name Group name to check
 * @param req Express request
 * @param res Express response
 * @returns true if the group name is valid, false otherwise
 */
function checkGroupNameField (name: any, req: express.Request, res: express.Response): boolean {
    if (name === undefined || name === '') {
        sendMsg(req, res, error.groupName.required);
        return false;
    }
    if (typeof name !== 'string') {
        sendMsg(req, res, error.groupName.type);
        return false;
    }
    return true;
}

/**
 * Check if a date is in a valid format
 * If the date is not valid, send an error message to the client
 * @param date Date to check
 * @param dateDays add a check, if the date must not be within the next 24 hours.
 * @param req Express request
 * @param res Express response
 * @returns true if the date is valid, false otherwise
 */
function checkDateField (date: any, dateDays: boolean, req: express.Request, res: express.Response): boolean {
    if (date === undefined || date === '') {
        sendMsg(req, res, error.date.required);
        return false;
    }
    if (isNaN(new Date(date).getTime())) {
        sendMsg(req, res, error.date.invalid);
        return false;
    }
    if (new Date(date).getTime() < new Date().getTime()) {
        sendMsg(req, res, error.date.tooSoon, new Date());
        return false;
    }

    if (dateDays) {
        if (dateAddHours(new Date(), properties.travel.hoursLimit) > new Date(date)) {
            sendMsg(req, res, error.date.tooSoon, dateAddHours(new Date(), properties.travel.hoursLimit));
            return false;
        }
    }
    return true;
}

/**
 * Check if a city is in a valid format
 * If the city is not valid, send an error message to the client
 * @param name City to check
 * @param req Express request
 * @param res Express response
 * @param fieldName Name of the field
 * @returns true if the city is valid, false otherwise
 */
function checkCityField (name: any, req: express.Request, res: express.Response, fieldName: string): boolean {
    if (name === undefined || name === '') {
        sendMsg(req, res, error.city.required, fieldName);
        return false;
    }
    if (typeof name !== 'string') {
        sendMsg(req, res, error.city.type, fieldName);
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
function sanitizePhone (phone: any, req: express.Request, res: express.Response): string | null {
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
function sanitizeGender (gender: any): number | undefined {
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
function sanitizeId (id: any, req: express.Request, res: express.Response): number | null {
    if (id === '' || Number.isNaN(Number(id))) {
        sendMsg(req, res, error.id.invalid);
        return null;
    }

    return Number(id);
}

/**
 * Check if a price field is valid
 * If the price is not valid, send an error message to the client
 * @param value Value to sanitize
 * @param req Express request
 * @param res Express response
 * @returns true if the value is valid and a positive number, false otherwise
 */
function checkPriceField (value: any, req: express.Request, res: express.Response): boolean {
    if (typeof value !== 'number' && value !== undefined && value !== null) {
        sendMsg(req, res, error.number.type, 'price');
        return false;
    }

    if (value < 0) {
        sendMsg(req, res, error.number.min, 'price', 0);
        return false;
    }
    return true;
}

/**
 * Check if a price field is valid
 * If the price is not valid, send an error message to the client
 * @param value Value to sanitize
 * @param req Express request
 * @param res Express response
 * @returns true if the value is valid, false otherwise
 */
function checkMaxPassengersField (value: any, req: express.Request, res: express.Response): boolean {
    if (typeof value !== 'number' && value !== undefined && value !== null) {
        sendMsg(req, res, error.number.type, 'maxPassengers');
        return false;
    }

    if (value < 1) {
        sendMsg(req, res, error.number.min, 'maxPassengers', 1);
        return false;
    }
    return true;
}

/**
 * Check if a lng field is valid
 * If the lng is not valid, send an error message to the client
 * @param value Value to sanitize
 * @param req Express request
 * @param res Express response
 * @returns true if the value is valid and if the value is between -180 and 180, false otherwise
 */
function checkLngField (value: any, req: express.Request, res: express.Response): boolean {
    if (value === undefined || value === '') {
        sendMsg(req, res, error.number.required, 'lng');
        return false;
    }
    if (typeof value !== 'number') {
        sendMsg(req, res, error.number.type, 'lng');
        return false;
    }

    if (value < -180 || value > 180) {
        sendMsg(req, res, error.longitude.minMax, properties.longitude.min, properties.longitude.max);
        return false;
    }
    return true;
}

/**
 * Check if a lat field is valid
 * If the lat is not valid, send an error message to the client
 * @param value Value to sanitize
 * @param req Express request
 * @param res Express response
 * @returns true if the value is valid and if the value is between -90 and 90, false otherwise
 */
function checkLatField (value: any, req: express.Request, res: express.Response): boolean {
    if (value === undefined || value === '') {
        sendMsg(req, res, error.number.required, 'lng');
        return false;
    }
    if (typeof value !== 'number') {
        sendMsg(req, res, error.number.type, 'lng');
        return false;
    }

    if (value < -90 || value > 90) {
        sendMsg(req, res, error.latitude.minMax, properties.latitude.min, properties.latitude.max);
        return false;
    }
    return true;
}

/**
 * Check if a description field is valid
 * If the descirption is not valid, send an error message to the client
 * @param value Value to sanitize
 * @param req Express request
 * @param res Express response
 * @param fieldName Name of the field
 * @returns true if the value is valid, false otherwise
 */
function checkDescriptionField (value: any, req: express.Request, res: express.Response, fieldName: string): boolean {
    if (typeof value !== 'string' && value !== undefined && value !== null) {
        sendMsg(req, res, error.string.type, fieldName);
        return false;
    }
    return true;
}

/**
 * Check if a string field is valid
 * If the string is not valid, send an error message to the client
 * @param value Value to sanitize
 * @param req Express request
 * @param res Express response
 * @param fieldName Name of the field
 * @returns true if the value is valid, false otherwise
 */
function checkStringField (value: any, req: express.Request, res: express.Response, fieldName: string): boolean {
    if (value === undefined || value === '') {
        sendMsg(req, res, error.string.required, fieldName);
        return false;
    }
    if (typeof value !== 'string') {
        sendMsg(req, res, error.string.type, fieldName);
        return false;
    }
    return true;
}

/**
 * Check if the dates is in a good order
 * If the date is not valid, send an error message to the client
 * @param date1 Date to check
 * @param date2 Date to check
 * @param req Express request
 * @param res Express response
 * @returns true if the date is in a good order, false otherwise
 */
function checkDatesOrder (date1: any, date2: any, req: express.Request, res: express.Response): boolean {
    if (!checkDateField(date2, true, req, res)) return false;

    if (new Date(date1).getTime() === new Date(date2).getTime()) {
        sendMsg(req, res, error.date.identical);
        return false;
    }

    if (new Date(date1) > new Date(date2)) {
        sendMsg(req, res, error.etapes.badOrder);
        return false;
    }
    return true;
}

/**
 * Check if the user doesn't have a trip yet
 * If the user has already a travel, send an error message to the client
 * @param dateMin Date to check
 * @param dateMax Date to check
 * @param etapes
 * @param req Express request
 * @param res Express response
 * @returns true if the user doesn't have a trip , false otherwise
 */
function checkTravelAlready (dateMin: any, dateMax: any, etapes: any, req: express.Request, res: express.Response): boolean {
    if (etapes.length === 0) return true;
    if (new Date(dateMin) >= new Date(etapes[0].date) && new Date(dateMin) <= new Date(etapes[etapes.length - 1].date)) {
        sendMsg(req, res, error.etapes.alreadyTravel, new Date(etapes[0].date), new Date(etapes[etapes.length - 1].date));
        return false;
    }

    if (new Date(dateMax) >= new Date(etapes[0].date) && new Date(dateMax) <= new Date(etapes[etapes.length - 1].date)) {
        sendMsg(req, res, error.etapes.alreadyTravel, new Date(etapes[0].date), new Date(etapes[etapes.length - 1].date));
        return false;
    }
    if ((new Date(dateMin) <= new Date(etapes[0].date) && new Date(dateMax) >= new Date(etapes[0].date)) && (new Date(dateMin) <= new Date(etapes[etapes.length - 1].date) && new Date(dateMax) >= new Date(etapes[etapes.length - 1].date))) {
        sendMsg(req, res, error.etapes.alreadyTravel, new Date(etapes[0].date), new Date(etapes[etapes.length - 1].date));
        return false;
    }

    return true;
}

/**
 * Check if a listOfEtape field is valid
 * If the string is not valid, send an error message to the client
 * @param etapes Value to sanitize
 * @param req Express request
 * @param res Express response
 * @returns true if the value is valid, false otherwise
 */
function checkListOfEtapeField (etapes: any, req: express.Request, res: express.Response): boolean {
    if (etapes === undefined || etapes === '') {
        sendMsg(req, res, error.etapes.required);
        return false;
    }
    if (typeof etapes !== 'object') {
        sendMsg(req, res, error.etapes.type);
        return false;
    }
    if (etapes.length < 2) {
        sendMsg(req, res, error.etapes.etapeMin, properties.listOfEtape.minLength);
        return false;
    }

    let incr: number = 1;
    for (const etape in etapes) {
        if (!checkDateField(etapes[etape].date, true, req, res)) return false;

        if (etape !== String(etapes.length - 1)) {
            if (!checkDatesOrder(etapes[etape].date, etapes[incr].date, req, res)) return false;
        }

        if (!checkStringField(etapes[etape].label, req, res, 'label')) return false;
        if (!checkStringField(etapes[etape].city, req, res, 'city')) return false;
        if (!checkStringField(etapes[etape].context, req, res, 'context')) return false;
        if (!checkLatField(etapes[etape].lat, req, res)) return false;
        if (!checkLngField(etapes[etape].lng, req, res)) return false;

        incr += 1;
    }
    return true;
}

/**
 * Check if a date is in the future ({@link properties.travel.hoursLimit} hours)
 * If the date is not valid, send an error message to the client
 * @param date Date to check
 * @param req Express request
 * @param res Express response
 * @returns whether the date is in the future
 */
function checkTravelHoursLimit (date: Date, req: express.Request, res: express.Response): boolean {
    const now = new Date();
    if (dateAddHours(now, properties.travel.hoursLimit) > date) {
        sendMsg(req, res, error.travel.notModifiable, properties.travel.hoursLimit);
        return false;
    }
    return true;
}

/**
 * Add hours to a date
 * @param date Date to add hours
 * @param hours Hours to add
 * @returns the new date
 */
function dateAddHours (date: Date, hours: number): Date {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

export {
    checkEmailField,
    checkPasswordField,
    checkOldPasswordField,
    checkLastNameField,
    checkFirstNameField,
    checkLevelField,
    checkGroupNameField,
    checkBooleanField,
    checkDateField,
    checkCityField,
    sanitizePhone,
    sanitizeGender,
    sanitizeId,
    checkMaxPassengersField,
    checkPriceField,
    checkStringField,
    checkListOfEtapeField,
    checkDescriptionField,
    checkTravelAlready,
    checkTravelHoursLimit
};
