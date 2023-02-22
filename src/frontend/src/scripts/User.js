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

    constructor(infos) {
        this.setInformations(infos);
        User.#currentUser = this;
    }

    setInformations(infos) {
        const props = ["id", "email", "firstName", "lastName", "phone", "avatar", "gender", "hasCar", "mailNotif", "level", "createdAt", "token"];
        for (const prop of props) {
            if (this[prop] != infos[prop] && infos[prop] !== undefined) {
                this[prop] = infos[prop];
            }
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