<template>
    <div class="md:show-up flex flex-col grow">
        <p class="text-2xl text-teal-500 py-2 font-bold mx-auto">
            {{ lang.PARAMS }}
        </p> 
        <div class="flex flex-col grow justify-evenly items-center p-4 space-y-4">
            <card-border class="w-full flex-col max-w-[35em]">
                <p class="text-xl font-bold text-slate-500 dark:text-slate-300 text-center mx-auto">
                    {{ lang.DISPLAY_PARAMS }}
                </p>
                <input-choice
                    name="theme"
                    :label="lang.THEME"
                    :value="selectedTheme"
                    :list="themes"
                    :onchange="onThemeChanged"
                />
                <input-choice
                    name="language"
                    :label="lang.LANGUAGE "
                    :value="selectedLanguage"
                    :list="languages"
                    :onchange="onLanguageChanged"
                />
            </card-border>
            
            <card-border class="w-full flex-col max-w-[35em]">
                <p class="text-xl font-bold text-slate-500 dark:text-slate-300 text-center mx-auto">
                    {{ lang.NOTIF_PARAMS }}
                </p>
                <input-switch
                    name="mail-notif"
                    :label="lang.EMAIL_NOTIFICATIONS"
                    :value="User?.CurrentUser?.mailNotif"
                    :onchange="onEmailNotifChanged"
                />
                <input-choice
                    ref="lang-notif"
                    name="lang-notif"
                    :label="lang.LANGUAGE "
                    :value="selectedLangNotif"
                    :list="notifLanguages"
                    :onchange="onNotifLanguageChanged"
                />
                <div
                    ref="log-zone-notifs"
                    class="flex flex-col w-full justify-center items-center min-h-max h-max transition-all"
                    style="max-height: 0px;"
                />
            </card-border>

            <card-border class="w-full flex-col max-w-[35em]">
                <p class="text-xl font-bold text-slate-500 dark:text-slate-300 text-center mx-auto">
                    {{ lang.OTHER_PARAMS }}
                </p>
                <input-choice
                    ref="timezone"
                    name="timezone"
                    :label="lang.TIMEZONE"
                    :value="User?.CurrentUser?.timezone"
                    :list="Intl.supportedValuesOf('timeZone').map(tz => ({ value: tz, label: tz }))"
                    :onchange="onTimezoneChanged"
                />
                <div
                    ref="log-zone-other"
                    class="flex flex-col w-full justify-center items-center min-h-max h-max transition-all"
                    style="max-height: 0px;"
                />
            </card-border>
        </div>
    </div>
</template>

<script>

import InputSwitch from '../inputs/InputSwitch.vue';
import InputChoice from '../inputs/InputChoice.vue'
import CardBorder from '../cards/CardBorder.vue';
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
        CardBorder
    },
    data() {
        return {
            User,
            lang: Lang.CurrentLang,
            selectedTheme: this.getCurrentTheme(),
            selectedLanguage: Lang.CurrentCode,
            selectedLangNotif: User?.CurrentUser?.lang,
            themes,
            languages: Lang.Langs,
            notifLanguages: Lang.Langs.filter(lang => lang.value),
        }
    },
    mounted() {
        Lang.AddCallback(lang => this.lang = lang);
        if (User.CurrentUser == null) return;

        this.logZoneNotifs = new LogZone(this.$refs["log-zone-notifs"]);
        this.logZoneOther = new LogZone(this.$refs["log-zone-other"]);
    },
    methods: {
        logNotifs(msg, type = Log.INFO) {
            if (!this.logZoneNotifs) return null;
            const log = new Log(msg, type);
            log.attachTo(this.logZoneNotifs);
            return log;
        },
        logOther(msg, type = Log.INFO) {
            if (!this.logZoneOther) return null;
            const log = new Log(msg, type);
            log.attachTo(this.logZoneOther);
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
            const msg_log = this.logNotifs(Lang.CurrentLang.UPDATING_PARAMS + " ...");

            const data = { mailNotif: val };
            this.saveParams(data, msg_log, () => {
                const checkbox = document.querySelector("input[name='mail-notif']");
                checkbox.checked = User.CurrentUser.mailNotif;
            });
        },
        onNotifLanguageChanged(val) {
            const msg_log = this.logNotifs(Lang.CurrentLang.UPDATING_PARAMS + " ...");

            const data = { lang: val };
            this.saveParams(data, msg_log, () => {
                const select = this.$refs["lang-notif"].$el.querySelector("select");
                select.value = User.CurrentUser.lang;
            });
        },
        onTimezoneChanged(val) {
            const msg_log = this.logOther(Lang.CurrentLang.UPDATING_PARAMS + " ...");

            const data = { timezone: val };
            this.saveParams(data, msg_log, () => {
                const select = this.$refs["timezone"].$el.querySelector("select");
                select.value = User.CurrentUser.timezone;
            });
        },
        getCurrentTheme() {
            const themeStored = localStorage.getItem("theme");

            // 0 : Dark | 1 : Light | -1 Undefined (take OS preference)
            if (themeStored) return Number(themeStored) ?? -1;
            return -1;
        },
        saveParams(data, msg_log, resetFields) {
            API.execute_logged(API.ROUTE.SETTINGS, API.METHOD.PATCH, User.CurrentUser.getCredentials(), data).then(res => {
                for (const key in data) {
                    if (Object.hasOwnProperty.call(User.CurrentUser, key))
                        User.CurrentUser[key] = data[key];
                }
                User.CurrentUser.save();
                msg_log.update(res.message, Log.SUCCESS);
                setTimeout(() => { msg_log.delete(); }, 2000);
            }).catch(err => {
                msg_log.update(Lang.CurrentLang.ERROR + " : " + err.message, Log.ERROR);
                setTimeout(() => { msg_log.delete(); }, 4000);
                resetFields();
            });
        }
    }
}
</script>
