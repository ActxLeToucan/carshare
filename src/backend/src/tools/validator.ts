import type express from 'express';
import { error, sendMsg } from './translator';
import IsEmail from 'isemail';
import properties from '../properties';
import moment from 'moment-timezone';

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

    if (dateDays) {
        if (!checkTravelHours(new Date(date))) {
            sendMsg(req, res, error.date.tooSoon, moment().add(properties.travel.hoursLimit, 'hours').toDate(), res.locals.user.timezone);
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
 * Sanitize the type
 * @param type id to sanitize
 * @param req Express request
 * @param res Express response
 * @returns The type string if it is valid, null otherwise
 */
function sanitizeType (type: any, req: express.Request, res: express.Response): string | undefined | null {
    if (type !== 'past' && type !== 'future' && typeof type !== 'undefined') {
        sendMsg(req, res, error.id.invalid);
        return null;
    }

    return type;
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
function checkDescriptionField (value: any, req: express.Request, res: express.Response): boolean {
    if (typeof value !== 'string' && value !== undefined && value !== null) {
        sendMsg(req, res, error.string.type, 'description');
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
        sendMsg(req, res, error.steps.badOrder);
        return false;
    }
    return true;
}

/**
 * Check if the user doesn't have a trip yet
 * If the user has already a travel, send an error message to the client
 * @param dateMin Date to check
 * @param dateMax Date to check
 * @param steps Steps of an existing travel
 * @param req Express request
 * @param res Express response
 * @returns true if the user doesn't have a trip , false otherwise
 */
function checkTravelAlready (dateMin: any, dateMax: any, steps: any, req: express.Request, res: express.Response): boolean {
    if (steps.length === 0) return true;
    if (new Date(dateMin) >= new Date(steps[0].date) && new Date(dateMin) <= new Date(steps[steps.length - 1].date)) {
        sendMsg(req, res, error.steps.alreadyTravel, new Date(steps[0].date), new Date(steps[steps.length - 1].date), res.locals.user.timezone);
        return false;
    }

    if (new Date(dateMax) >= new Date(steps[0].date) && new Date(dateMax) <= new Date(steps[steps.length - 1].date)) {
        sendMsg(req, res, error.steps.alreadyTravel, new Date(steps[0].date), new Date(steps[steps.length - 1].date), res.locals.user.timezone);
        return false;
    }
    if ((new Date(dateMin) <= new Date(steps[0].date) && new Date(dateMax) >= new Date(steps[0].date)) && (new Date(dateMin) <= new Date(steps[steps.length - 1].date) && new Date(dateMax) >= new Date(steps[steps.length - 1].date))) {
        sendMsg(req, res, error.steps.alreadyTravel, new Date(steps[0].date), new Date(steps[steps.length - 1].date), res.locals.user.timezone);
        return false;
    }

    return true;
}

/**
 * Check if a list of steps is valid
 * If one step is not valid, send an error message to the client
 * @param steps List of steps to check
 * @param req Express request
 * @param res Express response
 * @returns true if the list of steps is valid, false otherwise
 */
function checkStepList (steps: any, req: express.Request, res: express.Response): boolean {
    if (steps === undefined || steps === '') {
        sendMsg(req, res, error.steps.required);
        return false;
    }
    if (typeof steps !== 'object') {
        sendMsg(req, res, error.steps.type);
        return false;
    }
    if (steps.length < 2) {
        sendMsg(req, res, error.steps.min, properties.stepList.minLength);
        return false;
    }

    let incr: number = 1;
    for (const step in steps) {
        if (!checkDateField(steps[step].date, true, req, res)) return false;

        if (step !== String(steps.length - 1)) {
            if (!checkDatesOrder(steps[step].date, steps[incr].date, req, res)) return false;
        }

        if (!checkStringField(steps[step].label, req, res, 'label')) return false;
        if (!checkStringField(steps[step].city, req, res, 'city')) return false;
        if (!checkStringField(steps[step].context, req, res, 'context')) return false;
        if (!checkLatField(steps[step].lat, req, res)) return false;
        if (!checkLngField(steps[step].lng, req, res)) return false;

        if (steps[step].id !== undefined && typeof steps[step].id !== 'number') return false;

        incr += 1;
    }
    return true;
}

/**
 * Check if a note field is valid
 * If the note is not valid, send an error message to the client
 * @param value Value to sanitize
 * @param req Express request
 * @param res Express response
 * @returns true if the value is valid, false otherwise
 */
function checkNoteField (value: any, req: express.Request, res: express.Response): boolean {
    if (value === undefined || value === '') {
        sendMsg(req, res, error.number.required, 'note');
        return false;
    }
    if (typeof value !== 'number') {
        sendMsg(req, res, error.number.type, 'note');
        return false;
    }

    if (value < 0) {
        sendMsg(req, res, error.number.min, 'note', 0);
        return false;
    }
    if (value > 5) {
        sendMsg(req, res, error.number.min, 'note', 5);
        return false;
    }
    return true;
}

/**
 * Check if a number field is valid
 * If the number is not valid, send an error message to the client
 * @param value Value to sanitize
 * @param req Express request
 * @param res Express response
 * @param fieldName Name of the field
 * @returns true if the value is valid, false otherwise
 */
function checkNumberField (value: any, req: express.Request, res: express.Response, fieldName: string): boolean {
    if (value === undefined || value === '') {
        sendMsg(req, res, error.number.required, fieldName);
        return false;
    }
    if (typeof value !== 'number') {
        sendMsg(req, res, error.number.type, fieldName);
        return false;
    }
    return true;
}

/**
 * Check if a date is in editable depending on the travel hours limit
 * If the date is not valid, send an error message to the client
 * @param date Date to check
 * @param req Express request
 * @param res Express response
 * @returns whether the date is in the future
 */
function checkTravelHoursEditable (date: Date, req: express.Request, res: express.Response): boolean {
    if (!checkTravelHours(date)) {
        sendMsg(req, res, error.travel.notModifiable, properties.travel.hoursLimit);
        return false;
    }
    return true;
}

/**
 * Sanitize the timezone
 * @param timezone Timezone to sanitize
 * @returns the timezone if it is valid, undefined otherwise
 */
function sanitizeTimezone (timezone: any): string | undefined {
    if (timezone === undefined || typeof timezone !== 'string' || timezone === '') return undefined;
    if (moment.tz.names().includes(timezone)) return timezone;
    return undefined;
}

/**
 * Check if the language is valid
 * If the language is not valid, send an error message to the client
 * @param lang Language to check
 * @param req Express request
 * @param res Express response
 * @returns true if the language is valid, false otherwise
 */
function checkLang (lang: any, req: express.Request, res: express.Response): boolean {
    if (lang === undefined || typeof lang !== 'string' || lang === '') {
        sendMsg(req, res, error.lang.required);
        return false;
    }
    if (!properties.languages.includes(lang)) {
        sendMsg(req, res, error.lang.unknown);
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
    checkStepList,
    checkDescriptionField,
    checkTravelAlready,
    checkNoteField,
    checkNumberField,
    checkTravelHoursEditable,
    sanitizeTimezone,
    checkLang,
    sanitizeType,
    checkTravelHours
};
