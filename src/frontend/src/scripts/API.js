import config from '../config.js';
import Lang from './Lang.js';
import User from './User.js';

class Credentials {
    static get TYPE() {
        return {
            UNKNOWN: 0,
            TOKEN: 1,
            CREDENTIALS: 2
        };
    }

    static fromToken(token) {
        return new Credentials({token: token, type: Credentials.TYPE.TOKEN});
    }

    static fromCredentials(username, password) {
        return new Credentials({username: username, password: password, type: Credentials.TYPE.CREDENTIALS});
    }

    token = "";
    username = "";
    password = "";
    type = Credentials.TYPE.UNKNOWN;

    constructor(infos) {
        this.token = infos.token ?? this.token;
        this.username = infos.username ?? this.username;
        this.password = infos.password ?? this.password;
        this.type = infos.type ?? this.type;
    }

    isValid() {
        return this.type != Credentials.TYPE.UNKNOWN;
    }

    getToken() {
        return this.token;
    }

    getUsername() {
        return this.username;
    }

    getPassword() {
        return this.password;
    }
}

class Pagination {
    constructor (offset = 0, limit = 10) {
        this._offset = 0;
        this._limit = 10;
        this._total = 0;

        this.offset = offset;
        this.limit = limit;

        this._onChanged = null;
    }

    set offset(offset) {
        this._offset = offset ?? 0;
        this._onChanged?.();
    }

    set limit(limit) {
        this._limit = limit ?? 10;
        this._onChanged?.();
    }

    set total(total) {
        this._total = total;
    }

    set index(index) {
        this.offset = index * this._limit;
    }

    next() {
        this._offset += this._limit;
        if (this._offset > this.maxIndex * this.limit) this._offset = this.maxIndex * this.limit;
        this._onChanged?.();
    }

    previous() {
        this._offset -= this._limit;
        if (this._offset < 0) this._offset = 0;
        this._onChanged?.();
    }

    get hasPrevious() {
        return this._offset > 0;
    }

    get hasNext() {
        return this._offset < this.maxIndex * this.limit;
    }

    get index() {
        return this._offset / this._limit;
    }

    get total() {
        return this._total;
    }

    get maxIndex() {
        return Math.floor(this._total / this._limit);
    }

    get offset() {
        return this._offset;
    }

    get limit() {
        return this._limit;
    }

    onChanged(callback) {
        this._onChanged = callback;
    }

    toString() {
        return API.createParameters({offset: this.offset, limit: this.limit});
    }
}

class API {
    static Credentials = Credentials;

    // API constants
    static API_URL = null;
    static get METHOD() {
        return {
            GET: "GET",
            PUT: "PUT",
            POST: "POST",
            PATCH: "PATCH",
            DELETE: "DELETE"
        };
    }
    static get TYPE() {
        return {
            FORM: "application/x-www-form-urlencoded",
            JSON: "application/json",
            FILE: "multipart/form-data",
            NONE: undefined
        }
    }
    static get AuthorizationHeader() { return "Authorization"; };

    static setURL(url) {
        if (!url) return;
        if (url.endsWith("/")) url = url.substring(0, url.length - 1);
        API.API_URL = url;
    }

    // API routes
    static ROUTE = {
        SIGNUP: "/users/signup",
        LOGIN: "/users/login",
        ME: "/users/me",
        MY_PWD: "/users/me/password",
        VERIFY: "/users/email-verification",
        RESETPWD: "/users/password-reset",
        USERS: "/users",
        GROUPS: "/groups/my",
        SETTINGS : "/settings/notifications",
        NOTIFS: "/notifications",
        MY_NOTIFS: "/notifications/my",
        ALL_NOITFS: "/notifications/all",
        TRAVELS: {
            CREATE: "/travels/create",
            MY: "/travels/my",
            SEARCH: "/travels/search",
        }
    };

    /**
     * Makes an API call with the specified parameters
     * @param {string} path API call url path (see API.ROUTES for possible routes)
     * @param {string} method API call method (see API.METHOD for possible values)
     * @param {object|string} body API call body (data to send, ignored if METHOD.GET is used)
     * @param {string} type API call data type (see API.TYPE for possible values))  
     * @param {object[]} headers API call additional headers
     * @returns a promise resolving when the API call is done
     */
    static execute(path, method = this.METHOD.GET, body = {}, type = this.TYPE.JSON, headers = []) {
        return new Promise((resolve, reject) => {
            if (API.API_URL == null) { API.setURL(config.api.url); }
            if (API.API_URL == null) reject("Error : API host not set");
            path = path.replace("/?", "?").replace(/\/\//g, "/");
            let urlparts = path.split("?");
            let base = urlparts.splice(0, 1);
            let params = (urlparts.length > 0)? ("?" + urlparts.join("&")) : "";
            path = base + params;

            let reqHeaders = {
                "Accept": "application/json",
                "Accept-Language": Lang.CurrentCode
            };
            if (type != this.TYPE_NONE && type != this.TYPE_FILE) reqHeaders["Content-Type"] = type;

            if (headers)
                for (let key in headers)
                    reqHeaders[key] = headers[key];

            let reqBody = type == this.TYPE.FORM ? "" : {};
            if (body && type != this.TYPE.FILE) {
                switch (typeof (body)) {
                case "string":
                    if (body.startsWith("{") && body.endsWith("}"))
                        body = JSON.parse(body);
                    // pas de break, pour faire le traitement "object" suivant
                case "object":
                    if (type == this.TYPE_FORM)
                        reqBody = new URLSearchParams(body).toString();
                    else reqBody = JSON.stringify(body);
                    break;
                default: break;
                }
            }

            if (type == this.TYPE.FILE) { // create a form data from the body
                reqBody = new FormData();
                reqBody.append("model", body);
            }

            const sendError = (err) => {
                if (err.json) {
                    err.json().then(data => {
                        reject({
                            status: err.status,
                            message: data.message ?? Lang.CurrentLang.UNKNOWN_ERROR
                        });
                    }).catch(err => reject(err));
                } else {
                    reject(err);
                }
            };

            fetch(API.API_URL + path, {
                credentials: "omit",
                method: method,
                body: method == this.METHOD.GET ? undefined : reqBody,
                headers: reqHeaders,
                referrer: window.location.origin,
                mode: "cors"
            }).then(response => {
                if (!response.status.toString().startsWith("2")) {
                    if (response.status === 498) { // token expired
                        User.forget();
                        window.location.reload();
                    }
                    sendError(response);
                } else {
                    response.json().then(data => {
                        resolve(data);
                    }).catch(err => sendError(err));
                }
            }).catch(err => sendError(err));
        });
    }

    /**
     * Makes a logged API call with the specified parameters, using the specified credentials (token + token type / username + password)
     * @param {string} path API call url path (see API.ROUTES for possible routes)
     * @param {string} method API call method (see API.METHOD for possible values)
     * @param {Credentials} credentials API call credentials to use (use User.currentUser.getCredentials() to get the current user's credentials)
     * @param {object|string} body API call body (data to send, ignored if METHOD.GET is used)
     * @param {string} type API call data type (see API.TYPE for possible values))
     * @param {object[]} headers API call additionnal headers
     * @returns A promise resolving when the API call is done
     */
    static execute_logged(path, method = API.METHOD.GET, credentials, body = {}, type = this.TYPE.JSON, headers = []) {
        return new Promise((resolve, reject) => {
            if (!credentials) {
                reject({status: -1, message: "Please provide credentials (token/type or username/password)"});
                return;
            }
            const token_mode = (credentials.token != undefined)
            const login_mode = (credentials.password != undefined && credentials.username != undefined)

            if (!login_mode && !token_mode) {
                reject({status: -1, message: "Error: Invalid credentials"});
                return;
            }

            let reqHeaders = {};
            if (headers)
                for (let key in headers)
                    reqHeaders[key] = headers[key];

            if (token_mode) {
                reqHeaders[API.AuthorizationHeader] = credentials.token;
                this.execute(path, method, body, type, reqHeaders).then(resolve).catch(reject);
            } else {
                this.execute(API.ROUTE.LOGIN, this.METHOD_POST, { username: credentials.username, password: credentials.password }, this.TYPE_FORM).then(data => {
                    reqHeaders[API.AuthorizationHeader] = data;
                    this.execute(path, method, body, type, reqHeaders).then(resolve).catch(reject);
                }).catch(err => reject(err));
            }
        });
    }

    /**
     * Creates API parameters from an object
     * @param {object} params key-value pairs of parameters to add to the url
     * @returns string corresponding to the query parameters part of the url
     */
    static createParameters(params) {
        switch (typeof (params)) {
        case "string":
            if (params.startsWith("?")) return params;
            if (params.startsWith("{") && params.endsWith("}"))
                params = JSON.parse(params);
        case "object":
            return "?" + new URLSearchParams(params).toString();
        default:
            console.error("API Error: Error while creating parameters with argument: ", params);
            return "";
        }
    }

    /**
     * Creates pagination parameters from a page index and page number of elements
     * @param {number} offset number of elements to skip
     * @param {number} limit number of elements in one page
     * @returns a string corresponding to the pagination's parameters part of the url
     */
    static createPagination(offset = 0, limit = 10) {
        return new Pagination(offset, limit);
    }
}

window.API = API; // for debug purposes
export default API;