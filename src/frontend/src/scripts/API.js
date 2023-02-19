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
    static get AuthorizationHeader() { return "x-furwaz-auth"; };

    static setHost(host) {
        API.API_URL = "https://" + host;
    }

    // API routes
    static ROUTE = {
        // TODO : add api routes here
    };

    /**
     * Makes an API call with the specified parameters
     * @param {string} path API call url path (see API.ROUTES for possible routes)
     * @param {string} method API call method (see API.METHOD for possible values)
     * @param {object|string} body API call body (data to send, ignored if METHOD.GET is used)
     * @param {string} type API call data type (see API.TYPE for possible values))  
     * @param {object[]}} headers API call additionnal headers
     * @returns a promise resolving when the API call is done
     */
    static execute(path, method = this.METHOD.GET, body = {}, type = this.TYPE.JSON, headers = []) {
        return new Promise((resolve, reject) => {
            path = path.replace("/?", "?").replaceAll("//", "/");
            let urlparts = path.split("?");
            let base = urlparts.splice(0, 1);
            let params = (urlparts.length > 0)? ("?" + urlparts.join("&")) : "";
            path = base + params;

            let reqHeaders = {
                "User-Agent": navigator.userAgent,
                "Accept": "application/json",
                "Accept-Language": "fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3"
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
            
            // try with / at the request end
            fetch(API.API_URL + path, {
                credentials: "omit",
                method: method,
                body: method == this.METHOD.GET ? undefined : reqBody,
                headers: reqHeaders,
                referrer: window.location.origin,
                mode: "cors"
            }).then(response => {
                if (response.status != 200)
                    reject(response);
                else {
                    response.json().then(data => {
                        resolve(data);
                    }).catch(err => reject(err));
                }
            }).catch(err => {
                // is the request fails, test the same request but without "/" at the end (in case the error it just a 307 shitty redirection)
                fetch(API.API_URL + path.replace("?", "/?"), {
                    credentials: "omit",
                    method: method,
                    body: method == this.METHOD.GET ? undefined : reqBody,
                    headers: reqHeaders,
                    referrer: window.location.origin,
                    mode: "cors"
                }).then(response => {
                    if (response.status != 200)
                        reject(response);
                    else {
                        response.json().then(data => {
                            resolve(data);
                        }).catch(reject);
                    }
                }).catch(err => reject(err)).finally(() => {
                });
            });
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
     * @param {number} page index of the pagination's page
     * @param {number} per_page number of elements in one page
     * @returns a string corresponding to the pagination's parameters part of the url
     */
    static createPagination(page, per_page) {
        return this.createParameters({ page: page, per_page: per_page });
    }
}

window.API = API; // for debug purposes
export default API;