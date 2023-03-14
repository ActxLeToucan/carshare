import type express from 'express';
import { error, sendMsg, type Variants } from './tools/translator';
import IsEmail from 'isemail';

const p = {
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
        emailVerification: `${String(process.env.FRONTEND_URL)}/validate?token=`
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
    listOfEtape: {
        minLength: 2
    },
    query: {
        minLimit: 1, // in database queries, the minimum value allowed for LIMIT statements
        maxLimit: 50 // the max value allowed for LIMIT statements
    }
} satisfies Record<string, Record<string, any>>;

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
function checkFirstNameField (firstname: any, req: express.Request, res: express.Response): boolean {
    if (firstname === undefined || firstname === '') {
        sendMsg(req, res, error.firstname.required);
        return false;
    }
    if (typeof firstname !== 'string') {
        sendMsg(req, res, error.firstname.type);
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
    if (res.locals.user.level < level) {
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
        const dateC = new Date();
        dateC.setDate(dateC.getDate() + 1);

        if (new Date(date) < dateC) {
            sendMsg(req, res, error.date.tooSoon, dateC);
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
    if (!p.gender.values.includes(gender)) {
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
function sanitizeUserId (id: any, req: express.Request, res: express.Response): number | null {
    if (id === '' || Number.isNaN(Number(id))) {
        sendMsg(req, res, error.user.invalidId);
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
 * @returns true if the value is valid and it's a positive number, false otherwise
 */
function checkPriceField (value: any, req: express.Request, res: express.Response): boolean {
    if (typeof value !== 'number' && value !== undefined && value !== null) {
        sendMsg(req, res, error.number.type, 'Price');
        return false;
    }

    if (value < 0) {
        sendMsg(req, res, error.number.positive, 'Price');
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
 * @returns true if the value is valid and it's a positive number, false otherwise
 */
function checkMaxPassengersField (value: any, req: express.Request, res: express.Response): boolean {
    if (typeof value !== 'number' && value !== undefined && value !== null) {
        sendMsg(req, res, error.number.type, 'MaxPassengers');
        return false;
    }

    if (value < 1) {
        sendMsg(req, res, error.number.positive, 'MaxPassengers');
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
 * @param fieldName Name of the field
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
        sendMsg(req, res, error.longitude.minMax, p.longitude.min, p.longitude.max);
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
 * @param fieldName Name of the field
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
        sendMsg(req, res, error.latitude.minMax, p.latitude.min, p.latitude.max);
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
        sendMsg(req, res, error.date.isSame);
        return false;
    }

    if(new Date(date1)> new Date(date2)){
        sendMsg(req, res, error.date.badOrder);
        return false;
    }
    return true;
}

/**
 * Check if a listOfEtape field is valid
 * If the string is not valid, send an error message to the client
 * @param value Value to sanitize
 * @param req Express request
 * @param res Express response
 * @returns true if the value is valid, false otherwise
 */
function checkListOfEtapeField (value: any, req: express.Request, res: express.Response): boolean {
    if (value === undefined || value === '') {
        sendMsg(req, res, error.etapes.required);
        return false;
    }
    if (typeof value !== 'object') {
        sendMsg(req, res, error.etapes.type);
        return false;
    }
    if (value.length < 2) {
        sendMsg(req, res, error.etapes.etapeMin, p.listOfEtape.minLength);
        return false;
    }

    const tabUniqueDate = new Set(...value.map((e: any) => e.date));

    if (tabUniqueDate.size === value.length){
        sendMsg(req, res, error.etapes.required);
        return false;
    }
    let i2: number = 1;
    for (const i in value) {
        if (!checkDateField(value[i].date, true, req, res)) return false;

        if( i != String(value.length-1)){
            if (!checkDatesOrder(value[i].date, value[i2].date, req, res)) return false;
        }

        if (!checkStringField(value[i].label, req, res, 'label')) return false;
        if (!checkStringField(value[i].city, req, res, 'city')) return false;
        if (!checkStringField(value[i].context, req, res, 'context')) return false;
        if (!checkLatField(value[i].lat, req, res)) return false;
        if (!checkLngField(value[i].lng, req, res)) return false;

        i2+=1;
    }
    return true;
}
/**
* Sanitize the id of notification
* @param id id to sanitize
* @param req Express request
* @param res Express response
* @returns The id number if it is valid, null otherwise
*/
function sanitizeNotificationId (id: any, req: express.Request, res: express.Response): number | null {
    if (id === ' ' || Number.isNaN(Number(id))) {
        sendMsg(req, res, error.notification.invalidId);
        return null;
    }

    return Number(id);
}

export {
    p,
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
    sanitizeUserId,
    checkMaxPassengersField,
    checkPriceField,
    checkStringField,
    checkListOfEtapeField,
    checkDescriptionField,
    sanitizeNotificationId
};
