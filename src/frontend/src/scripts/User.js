import API from "./API";

class User {
    /** @type {User} */
    static #currentUser = null;
    static get CurrentUser() {
        return User.#currentUser || User.fromLocalStorage();
    }

    static fromLocalStorage() {
        const data = localStorage.getItem("user");
        if (!data) return null;
        return new User(JSON.parse(data));
    }

    static forget() {
        localStorage.removeItem("user");
        User.#currentUser = null;
    }

    id = 1;
    email = "";
    firstName = "";
    lastName = "";
    phone = "";
    avatar = null;
    gender = -1;
    hasCar = false;
    mailNotif = false;
    level = 0;
    createdAt = null;
    token = null;
    emailVerifiedOn = null;

    constructor(infos) {
        this.setInformations(infos, true);
        User.#currentUser = this;
    }

    setInformations(infos, checkToken = false) {
        const props = ["id", "email", "firstName", "lastName", "phone", "avatar", "gender", "hasCar", "mailNotif", "level", "createdAt", "token", "emailVerifiedOn"];
        for (const prop of props) {
            if (this[prop] != infos[prop] && infos[prop] !== undefined) {
                this[prop] = infos[prop];
            }
        }
        if (this.token != null && checkToken) { // verify token
            API.execute_logged(API.ROUTE.USER, API.METHOD.GET, this.getCredentials()).then(res => {
                this.setInformations(res, false);
            }).catch(err => {
                if (err.status === 498) { // token expired, disconnect
                    User.forget();
                }
            })
        }
    }

    save() {
        localStorage.setItem("user", JSON.stringify(this));
        User.#currentUser = this;
    }

    getCredentials() {
        return new API.Credentials({token: "bearer " + this.token, type: API.Credentials.TYPE.TOKEN});
    }
}

window.User = User; // for debug
export default User;