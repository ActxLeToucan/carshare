<template>
    <div class="flex md:flex-row flex-col grow max-h-full min-h-0 max-w-full min-w-0">
        <div ref="query-zone" class="flex flex-col items-center h-full max-h-full md:w-min w-full min-w-0 max-w-full p-4 md:border-r-8 border-teal-500 mx-auto overflow-hidden">
            <p class="text-2xl text-teal-500 py-2 font-bold mx-auto"> {{ lang.USERS }} </p>

            <p class="text-lg text-slate-500 pt-2 font-semibold mx-auto"> {{ lang.SEARCH_USER }} </p>
            <div class="flex max-w-full min-w-0 items-center space-x-2">
                <input-text class="w-full flex grow" placeholder="Rechercher"></input-text>
                <button-block :action="search" :disabled="!searchBar.buttonEnabled">
                    <magnifying-glass-icon class="w-7 h-7"></magnifying-glass-icon>
                </button-block>
            </div>
            <div
                ref="search-log-zone"
                class="flex flex-col w-full items-center h-fit overflow-hidden transition-all"
                style="max-height: 0;"
            ></div>
            <div class="flex grow w-full flex-col px-8 space-y-4 pt-4 max-w-full min-w-0 overflow-y-auto">
                <admin-user-card
                    class="min-w-0 w-full show-up max-w-[20em]" v-for="user in usersList"
                    :data="user" :key="user?.id" :onclick="onCardClicked">
                </admin-user-card>
            </div>
            <div class="flex w-full justify-evenly items-center mt-4">
                <button-block :action="() => pagination.previous()" :disabled="!pagination.hasPrevious"> <chevron-left-icon class="w-8 h-8"></chevron-left-icon> </button-block>
                <p class="text-xl font-bold text-slate-500"> {{ pagination.index }} / {{ pagination.maxIndex }} </p>
                <button-block :action="() => pagination.next()" :disabled="!pagination.hasNext"> <chevron-right-icon class="w-8 h-8"></chevron-right-icon> </button-block>
            </div>
        </div>
        <div ref="result-zone" class="flex flex-col grow px-4 p-4 overflow-auto">

            <button ref="backbtn" class="absolute md:hidden flex rounded-md border-2 border-slate-200 bg-white h-fit w-fit p-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>

            <div v-if="selectedUser != null" class="md:show-up flex flex-col justify-center">
                <p class="text-2xl text-teal-500 py-2 font-bold mx-auto w-fit"> {{ selectedUser.firstName }} {{ selectedUser.lastName }} </p>
                <card class="flex flex-col m-4 mx-auto">
                    <div class="flex flex-col">
                        <input-text   name="lastName"  :label="lang.LASTNAME"     :placeholder="lang.LASTNAME"  :value="selectedUser.lastName"></input-text>
                        <input-text   name="firstName" :label="lang.FIRSTNAME"    :placeholder="lang.FIRSTNAME" :value="selectedUser.firstName"></input-text>
                        <input-text   name="email"     :label="lang.EMAIL"        :placeholder="lang.EMAIL"     :value="selectedUser.email" class="mb-0"></input-text>
                        <input-text   name="phone"     :label="lang.PHONE"        :placeholder="lang.PHONE"     :value="selectedUser.phone"></input-text>
                        <input-choice name="gender"    :label="lang.GENDER"       :value="selectedUser.gender"  :list="genres"></input-choice>
                        <input-switch name="hasCar"    :label="lang.I_HAVE_A_CAR" :value="selectedUser.hasCar"  ></input-switch>
                        <input-choice name="level"     :label="lang.LEVEL"        :value="selectedUser.level"   :list="levels"></input-choice>
                    </div>
                    <div ref="user-log-zone" class="flex flex-col w-full items-center h-fit overflow-hidden transition-all" style="max-height: 0;"></div>
                    <div class="flex md:flex-row flex-col md:space-x-4 md:space-y-0 space-y-2 mt-4">
                        <button-block :action="showDeletePopup" color="red"> {{ lang.DELETE_ACCOUNT }} </button-block>
                        <div class="flex grow justify-end pl-20">
                            <button-block :action="updateAccount"> {{ lang.EDIT }} </button-block>
                        </div>
                    </div>
                </card>
            </div>

        </div>
        <popup
            color="red" :title="lang.DELETE + ' ' + selectedUser?.firstName + ' ' + selectedUser?.lastName"
            :content="lang.ACCOUNT_DELETE_VERIFY" :cancelLabel="lang.CANCEL" :validateLabel="lang.DELETE"
            :onload="setDeletePopup" :onvalidate="deleteAccount"
        >
            <input-text :label="lang.ACCOUNT_EMAIL" :placeholder="lang.EMAIL" name="email" type="email"></input-text>
        </popup>
    </div>
</template>

<script>
import User from '../../scripts/User.js';
import API from '../../scripts/API.js';
import ButtonTab from '../inputs/ButtonTab.vue';
import TabWindow from '../cards/TabWindow.vue';
import TabDiv from '../cards/TabDiv.vue';
import InputText from '../inputs/InputText.vue';
import InputSwitch from '../inputs/InputSwitch.vue';
import InputChoice from '../inputs/InputChoice.vue';
import ButtonBlock from '../inputs/ButtonBlock.vue';
import AdminUserCard from './AdminUserCard.vue';
import Popup from '../cards/Popup.vue';
import Card from '../cards/Card.vue';
import { Log, LogZone } from '../../scripts/Logs.js';
import { genres, isPhoneNumber, levels } from '../../scripts/data';

import {
    MagnifyingGlassIcon,
    ChevronRightIcon,
    ChevronLeftIcon
} from '@heroicons/vue/24/outline';
import { getTypedValue } from '../../scripts/data.js';
import Lang from "../../scripts/Lang";
import re from "../../scripts/Regex";

const PAGE = { QUERY: 1, RESULTS: 2 };

function search(obj) {
    obj.searchBar.buttonEnabled = false;
    const log = obj.searchLog(Lang.CurrentLang.SEARCHING + "...", Log.INFO);

    const value = obj.$refs['query-zone'].querySelector('input').value;

    API.execute_logged(API.ROUTE.USERS + obj.pagination + "&query="+value, API.METHOD.GET, User.CurrentUser?.getCredentials()).then(data => {
        obj.usersList = data.data;
        obj.pagination.total = data.total;
        log.delete();
    }).catch((err) => {
        log.update(Lang.CurrentLang.ERROR + " : " + err.message, Log.ERROR);
        setTimeout(() => { log.delete(); }, 4000);
    }).finally(() => {
        obj.searchBar.buttonEnabled = true;
    });
}

export default {
    name: 'AdminUsers',
    components: {
        ButtonTab,
        TabWindow,
        TabDiv,
        InputText,
        ButtonBlock,
        AdminUserCard,
        InputSwitch,
        InputChoice,
        Card,
        MagnifyingGlassIcon,
        Popup,
        ChevronRightIcon,
        ChevronLeftIcon,
    },
    methods: {
        displayPage(page) {
            const queryZone = this.$refs['query-zone'];
            const resultZone = this.$refs['result-zone'];
            if (!queryZone || !resultZone) return;
            if (!page) page = this.displayedPage;

            if (this.isMobile) {
                switch (page) {
                    case PAGE.QUERY:
                        queryZone.classList.remove('hidden');
                        resultZone.classList.add('hidden');
                        break;
                    case PAGE.RESULTS:
                        queryZone.classList.add('hidden');
                        resultZone.classList.remove('hidden');
                        break;
                }
            } else {
                queryZone.classList.remove('hidden');
                resultZone.classList.remove('hidden');
            }
            this.displayedPage = page || this.displayedPage;
        },
        onCardClicked(user) {
            this.selectedUser = user;
            this.displayPage(PAGE.RESULTS);
        },
        searchLog(msg, type = Log.INFO) {
            if (!this.searchLogZone) return;
            const log = new Log(msg, type);
            log.attachTo(this.searchLogZone);
            return log;
        },
        search() {
            return search(this);
        },
        deleteAccount(popup) {
            const pop_log = popup.log(this.lang.EMAIL_VERIFICATION, Log.INFO);
            const email = popup.get("email");
            if (email == "") {
                pop_log.update(this.lang.EMAIL_SPECIFY, Log.WARNING);
                popup.focus("email");
                setTimeout(() => pop_log.delete(), 4000);
                return;
            }
            if (email != this.selectedUser.email) {
                pop_log.update(this.lang.EMAIL_UNMATCHING, Log.ERROR);
                setTimeout(() => pop_log.delete(), 4000);
                return;
            }
            pop_log.update(this.lang.ACCOUNT_DELETION, Log.INFO);

            // Setting popup title to static string to avoid seing (Delete undefined undefined)
            popup.setTitle(this.lang.DELETE + ' ' + this.selectedUser?.firstName + ' ' + this.selectedUser?.lastName);

            API.execute_logged(API.ROUTE.USERS + "/" + this.selectedUser.id + this.pagination, API.METHOD.DELETE, User.CurrentUser?.getCredentials()).then((data) => {
                this.displayPage(PAGE.QUERY);
                this.usersList.splice(this.usersList.indexOf(this.selectedUser), 1);
                this.selectedUser = null;
                pop_log.update(this.lang.ACCOUNT_DELETED, Log.SUCCESS);
                setTimeout(() => {
                    pop_log.delete();
                    popup.hide();
                }, 2000);
            }).catch(err => {
                pop_log.update(this.lang.ERROR + " : " + err.message, Log.ERROR);
                setTimeout(() => {
                    pop_log.delete();
                }, 4000);
            });
        },
        userLog(msg, type = Log.INFO) {
            if (!this.userLogZone) {
                this.userLogZone = new LogZone(this.$refs["user-log-zone"]);
                if (!this.userLogZone) return;
            }
            const log = new Log(msg, type);
            log.attachTo(this.userLogZone);
            return log;
        },
        updateAccount() {
            this.formUser.buttonEnabled = false;
            const log = this.userLog(Lang.CurrentLang.INPUT_VERIFICATION + " ...", Log.INFO);

            const field_checks = [
                { field: "firstName", check: (value) => value.length > 0, error: Lang.CurrentLang.FIRSTNAME_SPECIFY },
                { field: "lastName", check: (value) => value.length > 0, error: Lang.CurrentLang.LASTNAME_SPECIFY },
                { field: "email", check: (value) => value.length > 0, error: Lang.CurrentLang.EMAIL_SPECIFY },
                { field: "phone", check: (value) => value.length > 0, error: Lang.CurrentLang.PHONE_SPECIFY },

                { field: "firstName", check: (value) => value.length <= 50, error: Lang.CurrentLang.FIRSTNAME_TOOLONG },
                { field: "lastName", check: (value) => value.length <= 50, error: Lang.CurrentLang.LASTNAME_TOOLONG },
                { field: "email", check: (value) => value.length <= 64, error: Lang.CurrentLang.EMAIL_TOOLONG },
                { field: "email", check: (value) => value.match(re.REGEX_EMAIL) != null, error: Lang.CurrentLang.EMAIL_INVALID },
                { field: "phone", check: (value) => isPhoneNumber(value), error: Lang.CurrentLang.PHONE_INVALID },
            ];

            for (let i = 0; i < field_checks.length; i++) {
                const check = field_checks[i];
                const input = this.$el.querySelector(`input[name="${check.field}"]`);
                const result = check.check(getTypedValue(input));
                if (!result) {
                    log.update(check.error, Log.WARNING);
                    setTimeout(() => { log.delete(); }, 4000);
                    return;
                }
            }

            const props = ["lastName", "firstName", "email", "phone", "gender", "hasCar", "level"];
            const newData = {};
            for (const prop of props) {
                const input = this.$el.querySelector(`input[name="${prop}"]`);
                newData[prop] = getTypedValue(input);
            }

            log.update(Lang.CurrentLang.CHANGING_INFORMATIONS, Log.WARNING);
            API.execute_logged(API.ROUTE.USERS + "/" + this.selectedUser.id, API.METHOD.PATCH, User.CurrentUser?.getCredentials(), newData).then((data) => {
                for (const prop of props) {
                    this.selectedUser[prop] = newData[prop];
                }
                this.displayPage(PAGE.RESULTS);
                log.update(Lang.CurrentLang.INFORMATIONS_CHANGED, Log.SUCCESS);
                setTimeout(() => { log.delete(); }, 2000);
            }).catch(err => {
                log.update(Lang.CurrentLang.ERROR + " : " + err.message, Log.ERROR);
                setTimeout(() => { log.delete(); }, 4000);
            }).finally(() => {
                this.formUser.buttonEnabled = true;
            });
        },
        setDeletePopup(popup) {
            this.deletePopup = popup;
        },
        showDeletePopup() {
            this.deletePopup.setTitle(this.lang.DELETE + ' ' + this.selectedUser?.firstName + ' ' + this.selectedUser?.lastName);
            this.deletePopup.show();
        }
    },
    data() {
        return {
            User,
            usersList: [],
            selectedUser: null,
            isMobile: window.innerWidth < 768,
            genres,
            levels,
            lang: Lang.CurrentLang,
            pagination: API.createPagination(0, 5),
            formUser: {
                buttonEnabled: true,
            },
            searchBar: {
                buttonEnabled: true,
            },
        }
    },
    mounted() {
        Lang.AddCallback(lang => {
            this.lang = lang;
            this.deletePopup.setTitle(this.lang.DELETE + ' ' + this.selectedUser?.firstName + ' ' + this.selectedUser?.lastName);
        });
        const backbtn = this.$refs['backbtn'];
        backbtn.addEventListener('click', () => {
            this.displayPage(PAGE.QUERY);
        });

        this.searchLogZone = new LogZone(this.$refs["search-log-zone"]);

        this.displayPage(PAGE.QUERY);
        window.addEventListener("resize", _ => {
            this.isMobile = window.innerWidth < 768;
            this.displayPage();
        });

        this.pagination.onChanged(() => {
            this.search();
        });
    }
}
</script>