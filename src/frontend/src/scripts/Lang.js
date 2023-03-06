import en from "../langs/en.js";
import fr from "../langs/fr.js";

class Lang {
    static Langs = [
        {label: "English", value: "en", data: en},
        {label: "Français", value: "fr", data: fr},
    ];

    static callbackIndex = 0;
    static callbacks = [];
    static current_lang = null;
    static current_code = null;
    static defaultCode = navigator.language || navigator.userLanguage;
    static defaultLanguage = Langs.find(l => l.value === defaultCode).data ?? Langs[0].data;

    static get CurrentLang() {
        if (this.current_lang == null)
            this.loadLang( localStorage.getItem("lang") || this.defaultCode );
        return this.current_lang;
    }

    static get CurrentCode() {
        if (this.current_code == null)
            this.loadLang( localStorage.getItem("lang") || this.defaultCode );
        return this.current_code;
    }


    static loadLang(code) {
        if (this.Langs.map(l => l.value).indexOf(code) === -1)
            return false;
        
        this.current_lang = this.Langs.find(l => l.value === code).data;
        for (const key in Lang.defaultLanguage) {
            if (!this.current_lang[key])
                this.current_lang[key] = Lang.defaultLanguage[key];
        }

        this.callbacks.forEach(c => {
            if (c.callback)
                c.callback(this.current_lang);
        });

        this.current_code = code;
        localStorage.setItem("lang", code);
        return true;
    }

    static addCallback(c) {
        const i = this.callbackIndex++;
        this.callbacks.push( {index: i, callback: c} );
        return i;
    }

    static remCallback(i) {
        const ind = this.callbacks.findIndex(e => e.index === i);
        if (ind === -1) return false;
        this.callbacks.splice(ind, 1);
        return true;
    }
}

window.Lang = Lang;
export default Lang;