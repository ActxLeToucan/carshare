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

    username = "";
    email = "";
    icon = "";
    token = "";
    id = 0;

    constructor(infos) {
        this.setInformations(infos);
        User.#currentUser = this;
    }

    setInformations(infos) {
        const props = ["username", "email", "token", "icon", "id"];
        for (const prop of props) {
            if (this[prop] != infos[prop] && infos[prop] !== undefined) {
                changes[prop] = infos[prop];
            }
        }
    }

    save() {
        localStorage.setItem("user", JSON.stringify(this));
        User.#currentUser = this;
    }
}

window.User = User; // for debug
export default User;