<template>
    <div class="flex md:flex-row flex-col grow max-h-full min-h-0 max-w-full min-w-0">
        <div ref="query-zone" class="flex flex-col items-center h-full md:w-min w-full min-w-0 max-w-full p-4 md:border-r-8 border-teal-500 mx-auto overflow-hidden">
            <p class="text-2xl text-teal-500 py-2 font-bold mx-auto"> {{ lang.USERS }} </p>

            <p class="text-lg text-slate-500 pt-2 font-semibold mx-auto"> {{ lang.SEARCH_USER }} </p>
            <div class="flex max-w-full min-w-0 items-center space-x-2">
                <input-text class="w-full flex grow" placeholder="Rechercher"></input-text>
                <button-block :action="search">
                    <magnifying-glass-icon class="w-7 h-7"></magnifying-glass-icon>
                </button-block>
            </div>
            <div class="flex w-full flex-col px-8 space-y-4 pt-4 max-w-full min-w-0">
                <admin-user-card
                    class="min-w-0 w-full show-up" v-for="user in usersList"
                    :data="user" :key="user.id" :onclick="onCardClicked">
                </admin-user-card>
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
                        <input-text   name="lastName"  :label="lang.LASTNAME"  :placeholder="lang.LASTNAME" :value="selectedUser.lastName"></input-text>
                        <input-text   name="firstName" :label="lang.FIRSTNAME" :placeholder="lang.FIRSTNAME" :value="selectedUser.firstName"></input-text>
                        <input-text   name="email"     :label="lang.EMAIL"     :placeholder="lang.EMAIL" :value="selectedUser.email" class="mb-0"></input-text>
                        <input-text   name="phone"     :label="lang.PHONE"          :placeholder="lang.PHONE" :value="selectedUser.phone"></input-text>
                        <input-choice name="gender"    :label="lang.GENDER"         :value="selectedUser.gender" :list="genres"></input-choice>
                        <input-switch name="hasCar"    :label="lang.I_HAVE_A_CAR"   :value="selectedUser.hasCar"></input-switch>
                    </div>
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
            color="red"
            :title="lang.DELETE + ' ' + selectedUser?.firstName + ' ' + selectedUser?.lastName"
            :content="lang.ACCOUNT_DELETE_VERIFY"
            :cancelLabel="lang.CANCEL"
            :validateLabel="lang.DELETE"
            :onload="setDeletePopup"
            :onvalidate="deleteAccount"
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
import { Log } from '../../scripts/Logs.js';
import { genres } from '../../scripts/data';

import {
    MagnifyingGlassIcon
} from '@heroicons/vue/24/outline';
import { getTypedValue } from '../../scripts/data.js';

const PAGE = { QUERY: 1, RESULTS: 2 };

function search(obj) {
    const value = obj.$refs['query-zone'].querySelector('input').value;

    API.execute_logged(API.ROUTE.USERS + obj.pagination, API.METHOD.GET, User.CurrentUser?.getCredentials(), { search: value }).then((data) => {
        obj.usersList = data;
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
        Popup
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
        updateAccount() {
            const props = ["lastName", "firstName", "email", "phone", "gender", "hasCar"];
            const newData = {};
            for (const prop of props) {
                const input = this.$el.querySelector(`input[name="${prop}"]`);
                newData[prop] = getTypedValue(input);
            }

            API.execute_logged(API.ROUTE.USERS + "/" + this.selectedUser.id + this.pagination, API.METHOD.PATCH, User.CurrentUser?.getCredentials(), newData).then((data) => {
                for (const prop of props) {
                    this.selectedUser[prop] = newData[prop];
                }
                this.displayPage(PAGE.RESULTS);
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
        return { User, usersList: [], selectedUser: null, isMobile: window.innerWidth < 768, genres, lang: Lang.CurrentLang, pagination: API.createPagination() }
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

        this.displayPage(PAGE.QUERY);
        window.addEventListener("resize", ev => {
            this.isMobile = window.innerWidth < 768;
            this.displayPage();
        })
    }
}
</script>