<template>
    <div class="md:show-up flex flex-col grow">
        <p class="text-2xl text-teal-500 font-bold mx-auto mt-4">
            {{ lang.MY_INFOS }}
        </p>
        <div class="flex flex-col grow justify-evenly items-center">
            <card class="flex flex-col md:m-4 my-4">
                <div
                    ref="user-inputs"
                    class="flex flex-col"
                >
                    <input-text
                        name="lastName"
                        :label="lang.LASTNAME"
                        :placeholder="lang.LASTNAME"
                        :value="formProperties.properties.lastName"
                        @input="formProperties.properties.lastName = $event.target.value"
                    />
                    <input-text
                        name="firstName"
                        :label="lang.FIRSTNAME"
                        :placeholder="lang.FIRSTNAME"
                        :value="formProperties.properties.firstName"
                        @input="formProperties.properties.firstName = $event.target.value"
                    />
                    <input-text
                        name="email"
                        :label="lang.EMAIL"
                        :placeholder="lang.EMAIL"
                        :value="formProperties.properties.email"
                        class="mb-0"
                        @input="formProperties.properties.email = $event.target.value"
                    />
                    <div class="flex space-x-4">
                        <p
                            v-if="emailVerified == 'false'"
                            class="ml-auto text-md text-slate-500 dark:text-slate-300"
                        >
                            {{ lang.ADDRESS_NOT_VERIFIED }}.
                        </p>
                        <p
                            v-if="emailVerified == 'true'"
                            class="ml-auto text-md text-slate-500 dark:text-slate-300"
                        >
                            {{ lang.ADDRESS_VERIFIED }}.
                        </p>
                        <p
                            v-if="emailVerified == 'pending'"
                            class="ml-auto text-md text-slate-500 dark:text-slate-300"
                        >
                            {{ lang.ADDRESS_VERIFICATION }}.
                        </p>
                        <p
                            v-if="emailVerified == '429'"
                            class="ml-auto text-md text-red-500 dark:text-red-300"
                        >
                            {{ lang.ADDRESS_ERROR_SPAM }}.
                        </p>
                        <p
                            v-if="emailVerified == 'error'"
                            class="ml-auto text-md text-red-500 dark:text-red-300"
                        >
                            {{ lang.ADDRESS_ERROR }}.
                        </p>
                        <p
                            v-if="emailVerified == 'loading'"
                            class="ml-auto text-md text-slate-500 dark:text-slate-300"
                        >
                            {{ lang.DATA_SENDING }}
                        </p>
                        <button
                            v-if="emailVerified !== 'true'"
                            class="ml-auto font-semibold text-md text-slate-500 hover:text-teal-500 cursor-pointer"
                            @click="verifyEmail"
                        >
                            {{ lang.VERIFY }}
                        </button>
                    </div>
                    <input-text
                        name="phone"
                        :label="lang.PHONE"
                        :placeholder="lang.PHONE"
                        :value="formProperties.properties.phone"
                        @input="formProperties.properties.phone = $event.target.value"
                    />
                    <input-choice
                        name="gender"
                        :label="lang.GENDER"
                        :value="formProperties.properties.gender"
                        :list="genres"
                        @input="formProperties.properties.gender = Number($event.target.value)"
                    />
                    <input-switch
                        name="hasCar"
                        :label="lang.I_HAVE_A_CAR"
                        :value="formProperties.properties.hasCar"
                        :onchange="(state) => formProperties.properties.hasCar = state"
                    />
                </div>
                <div
                    ref="user-log-zone"
                    class="flex flex-col w-full items-center h-fit overflow-hidden transition-all"
                    style="max-height: 0;"
                />
                <div class="flex md:flex-row flex-col md:space-x-4 md:space-y-0 space-y-2 mt-4">
                    <button-block
                        :action="deleteAccount"
                        color="red"
                    >
                        {{ lang.DELETE_ACCOUNT }}
                    </button-block>
                    <div class="flex grow justify-end pl-20">
                        <button-block
                            :action="updateAccount"
                            :disabled="!formProperties.buttonEnabled"
                        >
                            {{ lang.EDIT }}
                        </button-block>
                    </div>
                </div>
            </card>
            <card class="flex flex-col md:m-4 my-4">
                <div
                    ref="password-inputs"
                    class="flex flex-col"
                >
                    <input-text
                        name="password-old"
                        :label="lang.OLD_PASSWORD"
                        :placeholder="lang.OLD_PASSWORD"
                        :value="formPassword.old"
                        type="password"
                        @input="formPassword.old = $event.target.value"
                    />
                    <input-text
                        name="password-new"
                        :label="lang.NEW_PASSWORD"
                        :placeholder="lang.NEW_PASSWORD"
                        :value="formPassword.new"
                        type="password"
                        @input="formPassword.new = $event.target.value"
                    />
                    <input-text
                        name="password-confirm"
                        :label="lang.PWD_CONFIRM"
                        :placeholder="lang.PASSWORD_CONFIRM"
                        :value="formPassword.confirm"
                        type="password"
                        @input="formPassword.confirm = $event.target.value"
                    />
                </div>
                <div
                    ref="password-log-zone"
                    class="flex flex-col w-full items-center h-fit overflow-hidden transition-all"
                    style="max-height: 0;"
                />
                <div class="flex grow justify-end">
                    <button-block
                        :action="updatePassword"
                        :disabled="!formPassword.buttonEnabled"
                    >
                        {{ lang.EDIT }}
                    </button-block>
                </div>
            </card>
        </div>
        <card-popup
            color="red"
            :title="lang.DELETE_ACCOUNT"
            :content="lang.ACCOUNT_DELETE_CONFIRMATION"
            :cancel-label="lang.CANCEL"
            :validate-label="lang.DELETE"
            :onload="setDeletePopup"
            :onvalidate="removeAccount"
        >
            <input-text
                :label="lang.PASSWORD"
                :placeholder="lang.PASSWORD"
                name="password"
                type="password"
            />
        </card-popup>
    </div>
</template>

<script>
import ButtonBlock from '../inputs/ButtonBlock.vue';
import InputText from '../inputs/InputText.vue';
import InputChoice from '../inputs/InputChoice.vue';
import InputSwitch from '../inputs/InputSwitch.vue';
import Card from '../cards/Card.vue';
import CardPopup from '../cards/CardPopup.vue';
import { Log, LogZone } from '../../scripts/Logs';
import { genres, isPhoneNumber } from '../../scripts/data';
import re from '../../scripts/Regex';
import Lang from '../../scripts/Lang';
import API from "../../scripts/API";
import User from "../../scripts/User";

export default {
    name: "UserInfos",
    components: {
        ButtonBlock,
        Card,
        InputText,
        CardPopup,
        InputChoice,
        InputSwitch
    },
    data() {
        return {
            User,
            genres,
            isMobile: window.innerWidth < 768,
            emailVerified: (User.CurrentUser?.emailVerifiedOn != null).toString(),
            lang: Lang.CurrentLang,
            formPassword: {
                old: "",
                new: "",
                confirm: "",
                buttonEnabled: true
            },
            formProperties: {
                properties: {
                    lastName: User.CurrentUser?.lastName,
                    firstName: User.CurrentUser?.firstName,
                    email: User.CurrentUser?.email,
                    phone: User.CurrentUser?.phone,
                    gender: User.CurrentUser?.gender,
                    hasCar: User.CurrentUser?.hasCar
                },
                buttonEnabled: true
            },
            mounted: false,
        }
    },
    mounted() {
        Lang.AddCallback(lang => {
            this.lang = lang;
            this.deletePopup.setTitle(lang.DELETE_ACCOUNT);
        });

        this.$refs["user-inputs"].addEventListener("keydown", ev => {
            if (ev.key == "Enter") {
                this.updateAccount();
                ev.preventDefault();
            }
        });
        this.$refs["password-inputs"].addEventListener("keydown", ev => {
            if (ev.key == "Enter") {
                this.updatePassword();
                ev.preventDefault();
            }
        });

        this.userLogZone = new LogZone(this.$refs["user-log-zone"]);
        this.passwordLogZone = new LogZone(this.$refs["password-log-zone"]);

        const setInputValue = (name, value) => {
            const input = this.$el.querySelector(`input[name="${name}"]`);
            if (input) input.value = value;
        }

        if (User.CurrentUser == null) return;
        API.execute_logged(API.ROUTE.ME, API.METHOD.GET, User.CurrentUser?.getCredentials()).then(res => {
            User.CurrentUser?.setInformations(res);
            User.CurrentUser?.save();

            const fields = ["lastName", "firstName", "email", "phone", "gender", "hasCar"];
            fields.forEach(field => setInputValue(field, User.CurrentUser[field]));

        }).catch(err => {
            console.error(err);
        });

        this.mounted = true;
    },
    methods: {
        userLog(msg, type = Log.INFO) {
            if (!this.userLogZone) return null;
            const log = new Log(msg, type);
            log.attachTo(this.userLogZone);
            return log;
        },
        passwordLog(msg, type = Log.INFO) {
            if (!this.passwordLogZone) return null;
            const log = new Log(msg, type);
            log.attachTo(this.passwordLogZone);
            return log;
        },
        setDeletePopup(popup) {
            this.deletePopup = popup;
        },
        deleteAccount() {
            if (!this.deletePopup) return;
            this.deletePopup.show();
        },
        removeAccount(popup) {
            return new Promise((resolve, reject) => {
                const log = popup.log(this.lang.DELETING_ACCOUNT, Log.INFO);
                API.execute_logged(API.ROUTE.ME, API.METHOD.DELETE, User.CurrentUser?.getCredentials(), {password: popup.get("password")}).then(_ => {
                    log.update(this.lang.ACCOUNT_DELETED, Log.SUCCESS);
                    setTimeout(() => {
                        log.delete();
                        this.disconnect();
                        resolve(true);
                    }, 1000);
                }).catch(err => {
                    log.update(this.lang.ERROR + err.message, Log.ERROR);
                    setTimeout(() => {
                        log.delete();
                        resolve(false);
                    }, 4000);
                });
            });
        },
        verifyEmail() {
            this.emailVerified = 'loading';
            API.execute_logged(API.ROUTE.VERIFY, API.METHOD.POST, User.CurrentUser?.getCredentials()).then(res => {
                this.emailVerified = 'pending';
            }).catch(err => {
                if (err.status == 429) // too many requests
                    this.emailVerified = '429';
                else
                    this.emailVerified = 'error';
            });
        },
        disconnect() {
            User.forget();
            this.$router.push('/');
        },
        updatePassword() {
            this.formPassword.buttonEnabled = false;
            const log = this.passwordLog(Lang.CurrentLang.INPUT_VERIFICATION + " ...", Log.INFO);
            
            const field_checks = [
                {field: "new",         check: (value) => value.length > 0, error: Lang.CurrentLang.PASSWORD_SPECIFY},
                {field: "confirm", check: (value) => value.length > 0, error: Lang.CurrentLang.PASSWORD_CONFIRM_SPECIFY},

                {field: "confirm", check: (value, inputs) => value === inputs["new"], error: Lang.CurrentLang.PASSWORD_UNMATCH},
                {field: "new",         check: (value) => value.length >= 10,                     error: Lang.CurrentLang.PASSWORD_ERRLEN},
                {field: "new",         check: (value) => value.match(/[A-Z]/g) != null,          error: Lang.CurrentLang.PASSWORD_ERRMAJ},
                {field: "new",         check: (value) => value.match(/[a-z]/g) != null,          error: Lang.CurrentLang.PASSWORD_ERRMIN},
                {field: "new",         check: (value) => value.match(/[0-9]/g) != null,          error: Lang.CurrentLang.PASSWORD_ERRNBR},
                {field: "new",         check: (value) => value.match(/[^A-Za-z0-9]/g) != null,   error: Lang.CurrentLang.PASSWORD_ERRSPE}
            ];

            for (let i = 0; i < field_checks.length; i++) {
                const check = field_checks[i];
                const result = check.check(this.formPassword[check.field], this.formPassword);
                if (!result) {
                    log.update(check.error, Log.WARNING);
                    setTimeout(() => { log.delete(); }, 4000);
                    return;
                }
            }

            log.update(Lang.CurrentLang.CHANGING_PASSWORD, Log.WARNING);
            const data = {
                oldPassword: this.formPassword.old,
                password: this.formPassword.new
            };
            API.execute_logged(API.ROUTE.MY_PWD, API.METHOD.PATCH, User.CurrentUser?.getCredentials(), data).then((_) => {
                this.formPassword.old = "";
                this.formPassword.new = "";
                this.formPassword.confirm = "";
                log.update(Lang.CurrentLang.PASSWORD_CHANGED, Log.SUCCESS);
                setTimeout(() => { log.delete(); }, 2000);
            }).catch(err => {
                log.update(Lang.CurrentLang.ERROR + " : " + err.message, Log.ERROR);
                setTimeout(() => { log.delete(); }, 4000);
            }).finally(() => {
                this.formPassword.buttonEnabled = true;
            });
        },
        updateAccount() {
            this.formProperties.buttonEnabled = false;
            const log = this.userLog(Lang.CurrentLang.INPUT_VERIFICATION + " ...", Log.INFO);
            
            const field_checks = [
                {field: "firstName",        check: (value) => value.length > 0, error: Lang.CurrentLang.FIRSTNAME_SPECIFY},
                {field: "lastName",         check: (value) => value.length > 0, error: Lang.CurrentLang.LASTNAME_SPECIFY},
                {field: "email",            check: (value) => value.length > 0, error: Lang.CurrentLang.EMAIL_SPECIFY},
                {field: "phone",            check: (value) => value.length > 0, error: Lang.CurrentLang.PHONE_SPECIFY},

                {field: "firstName",        check: (value) => value.length <= 50,                  error: Lang.CurrentLang.FIRSTNAME_TOOLONG},
                {field: "lastName",         check: (value) => value.length <= 50,                  error: Lang.CurrentLang.LASTNAME_TOOLONG},
                {field: "email",            check: (value) => value.length <= 64,                  error: Lang.CurrentLang.EMAIL_TOOLONG},
                {field: "email",            check: (value) => value.match(re.REGEX_EMAIL) != null, error: Lang.CurrentLang.EMAIL_INVALID},
                {field: "phone",            check: (value) => isPhoneNumber(value),                error: Lang.CurrentLang.PHONE_INVALID},
            ];

            for (let i = 0; i < field_checks.length; i++) {
                const check = field_checks[i];
                const result = check.check(this.formProperties.properties[check.field], this.formPassword.properties);
                if (!result) {
                    log.update(check.error, Log.WARNING);
                    setTimeout(() => { log.delete(); }, 4000);
                    return;
                }
            }

            log.update(Lang.CurrentLang.CHANGING_INFORMATIONS, Log.WARNING);
            
            const data = {};
            for (const prop of Object.keys(this.formProperties.properties)) {
                if (this.formProperties.properties[prop] != User.CurrentUser[prop])
                    data[prop] = this.formProperties.properties[prop];
            }

            API.execute_logged(API.ROUTE.ME, API.METHOD.PATCH, User.CurrentUser?.getCredentials(), data).then((data) => {
                for (const prop of Object.keys(this.formProperties.properties)) {
                    this.formProperties.properties[prop] = data.user[prop];
                    User.CurrentUser[prop] = data.user[prop];
                }
                User.CurrentUser.save();
                log.update(Lang.CurrentLang.INFORMATIONS_CHANGED, Log.SUCCESS);
                setTimeout(() => { log.delete(); }, 2000);
            }).catch(err => {
                log.update(Lang.CurrentLang.ERROR + " : " + err.message, Log.ERROR);
                setTimeout(() => { log.delete(); }, 4000);
            }).finally(() => {
                this.formProperties.buttonEnabled = true;
            });
        }
    }
}
</script>