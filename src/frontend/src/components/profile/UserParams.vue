<template>
  
    <div class="md:show-up flex flex-col grow" >
        <p class="text-2xl text-teal-500 py-2 font-bold mx-auto"> {{ lang.PARAMS }} </p> 
        <div class="flex flex-col grow justify-evenly items-center p-4 space-y-4">
            <card class="w-full flex-col max-w-[35em]">
                <p class="text-xl font-bold text-slate-500 dark:text-slate-300 text-center mx-auto"> {{ lang.NOTIF_PARAMS }} </p>
                <input-switch name="mail-notif" :label="lang.EMAIL_NOTIFICATIONS" :value="User?.CurrentUser?.mailNotif" :onchange="onEmailNotifChanged"></input-switch>
                <div
                    ref="log-zone"
                    class="flex flex-col w-full justify-center items-center min-h-max h-max transition-all"
                    style="max-height: 0px;"
                ></div>
            </card>

            <card class="w-full flex-col max-w-[35em]">
                <p class="text-xl font-bold text-slate-500 dark:text-slate-300 text-center mx-auto"> {{ lang.DISPLAY_PARAMS }} </p>
                <input-choice name="theme"    :label="lang.THEME"    :value="selectedTheme"    :list="themes"   :onchange="onThemeChanged"></input-choice>
                <input-choice name="language" :label="lang.LANGUAGE " :value="selectedLanguage" :list="languages" :onchange="onLanguageChanged"></input-choice>
            </card>
        </div>
    </div>
    
</template>

<script>

import InputSwitch from '../inputs/InputSwitch.vue';
import InputChoice from '../inputs/InputChoice.vue'
import Card from '../cards/Card.vue';
import Lang from '../../scripts/Lang';
import { themes } from '../../scripts/data';
import User from '../../scripts/User';
import { Log, LogZone } from '../../scripts/Logs';
import API from '../../scripts/API.js';

export default {
    name: "UserParams",
    components: {
        InputSwitch,
        InputChoice,
        Card
    },
    data() {
        return {
            User,
            lang: Lang.CurrentLang,
            selectedTheme: this.getCurrentTheme(),
            selectedLanguage: Lang.CurrentCode,
            themes,
            languages: Lang.Langs,
        }
    },
    methods: {
        log(msg, type = Log.INFO) {
            if (!this.logZone) return null;
            const log = new Log(msg, type);
            log.attachTo(this.logZone);
            return log;
        },
        onThemeChanged(val) {
            const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
            const enableDarkMode = (val == 0) || (val == -1 && isDarkMode);

            if (enableDarkMode) document.documentElement.classList.add("dark");
            else document.documentElement.classList.remove("dark");

            if (val != -1) { // forcing theme
                localStorage.setItem("theme", val.toString());
            } else { // removing forced theme
                localStorage.removeItem("theme");
            }
        },
        onLanguageChanged(val) {
            const oldLang = Lang.CurrentCode;
            const res = Lang.LoadLang(val);
            if (res) this.selectedLanguage = val;
            else this.selectedLanguage = oldLang;
        },
        onEmailNotifChanged(val) {
            console.log("onEmailNotifChanged: ", val);
            const msg_log = this.log( Lang.CurrentLang.UPDATING_PARAMS + " ...");

            const data = { mailNotif: val };
            API.execute_logged(API.ROUTE.ME, API.METHOD.PATCH, User.CurrentUser.getCredentials(), data).then(res => {
                User.CurrentUser.setInformations(res.user);
                User.CurrentUser.save();
                msg_log.update(Lang.CurrentLang.PARAMS_UPDATED, Log.SUCCESS);
                setTimeout(() => { msg_log.delete(); }, 2000);
            }).catch(err => {
                const checkbox = document.querySelector("input[name='mail-notif']");
                checkbox.checked = User.CurrentUser.mailNotif;
                msg_log.update(Lang.CurrentLang.ERROR + " : " + err.message, Log.ERROR);
                setTimeout(() => { msg_log.delete(); }, 4000);
            });
        },
        getCurrentTheme() {
            const themeStored = localStorage.getItem("theme");

            // 0 : Dark | 1 : Light | -1 Undefined (take OS preference)
            if (themeStored) return Number(themeStored) ?? -1;
            return -1;
        }
    },
    mounted() {
        Lang.AddCallback(lang => this.lang = lang);
        if (User.CurrentUser == null) return;

        this.logZone = new LogZone(this.$refs["log-zone"]);
    }
}
</script>
