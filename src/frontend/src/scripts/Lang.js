import en from "../langs/en.js";
import fr from "../langs/fr.js";

class Lang {
    static Langs = [
        {label: "English", value: "en", data: en},
        {label: "Français", value: "fr", data: fr},
    ];

    static #callbackIndex = 0;
    static #callbacks = [];
    static #current_lang = null;
    static #current_code = null;
    static #defaultCode = null;
    static #defaultLanguage = null;

    static get DefaultCode() {
        if (this.#defaultCode == null)
            this.#defaultCode = navigator.language || navigator.userLanguage;
        return this.#defaultCode;
    }

    static get DefaultLanguage() {
        if (this.#defaultLanguage == null)
            this.#defaultLanguage = this.Langs.find(l => l.value === this.DefaultCode).data;
        return this.#defaultLanguage;
    }

    static get CurrentLang() {
        if (this.#current_lang == null)
            this.LoadLang( localStorage.getItem("lang") || this.#defaultCode );
        return this.#current_lang;
    }

    static get CurrentCode() {
        let temp = this.CurrentLang;
        return this.#current_code;
    }


    static LoadLang(code) {
        if (this.Langs.map(l => l.value).indexOf(code) === -1)
            return false;
        
        this.#current_lang = this.Langs.find(l => l.value === code).data;
        for (const key in Lang.defaultLanguage) {
            if (!this.#current_lang[key])
                this.#current_lang[key] = Lang.defaultLanguage[key];
        }

        this.#callbacks.forEach(c => {
            if (c.callback)
                c.callback(this.#current_lang);
        });

        this.#current_code = code;
        localStorage.setItem("lang", code);
        return true;
    }

    static AddCallback(c) {
        const i = this.#callbackIndex++;
        this.#callbacks.push( {index: i, callback: c} );
        return i;
    }

    static RemCallback(i) {
        const ind = this.#callbacks.findIndex(e => e.index === i);
        if (ind === -1) return false;
        this.#callbacks.splice(ind, 1);
        return true;
    }
}

window.Lang = Lang;
export default Lang;