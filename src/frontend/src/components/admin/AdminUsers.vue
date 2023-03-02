<template>
    <div class="flex md:flex-row flex-col grow max-h-full min-h-0 max-w-full min-w-0">
        <div ref="query-zone" class="flex flex-col items-center h-full md:w-min w-full min-w-0 max-w-full p-4 md:border-r-8 border-teal-500 mx-auto overflow-hidden">
            <p class="text-2xl text-teal-500 py-2 font-bold mx-auto"> Utilisateurs </p>

            <p class="text-lg text-slate-500 pt-2 font-semibold mx-auto"> Rechercher un utilisateur </p>
            <div class="flex max-w-full min-w-0 items-center space-x-2">
                <input-text class="w-full flex grow" placeholder="Rechercher"></input-text>
                <button-block :action="search">
                    <magnifying-glass-icon class="w-7 h-7"></magnifying-glass-icon>
                </button-block>
            </div>
            <div class="flex w-full flex-col px-8 space-y-4 pt-4">
                <admin-user-card
                    class="w-full show-up" v-for="user in usersList"
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

            <div v-if="selectedUser != null" class="flex flex-col justify-center">
                <p class="text-2xl text-teal-500 py-2 font-bold mx-auto w-fit"> {{ selectedUser.firstName }} {{ selectedUser.lastName }} </p>
                <card class="flex flex-col m-4 mx-auto">
                    <div class="flex flex-col">
                        <input-text   name="lastName"  label="Nom" placeholder="Nom" :value="selectedUser.lastName"></input-text>
                        <input-text   name="firstName" label="Prénom" placeholder="Prénom" :value="selectedUser.firstName"></input-text>
                        <input-text   name="email"     label="Email" placeholder="Email" :value="selectedUser.email" class="mb-0"></input-text>
                        <input-text   name="phone"     label="Téléphone" placeholder="Téléphone" :value="selectedUser.phone"></input-text>
                        <input-choice name="gender"    label="Genre" :value="selectedUser.gender" :list="genres"></input-choice>
                        <input-switch name="hasCar"    label="J'ai une voiture" :value="selectedUser.hasCar"></input-switch>
                    </div>
                    <div class="flex md:flex-row flex-col md:space-x-4 md:space-y-0 space-y-2 mt-4">
                        <button-block :action="deleteAccount" color="red"> Supprimer le compte </button-block>
                        <div class="flex grow justify-end pl-20">
                            <button-block :action="updateAccount"> Modifier </button-block>
                        </div>
                    </div>
                </card>
            </div>

        </div>
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
import Card from '../cards/Card.vue';
import { genres } from '../../scripts/data';

import {
    MagnifyingGlassIcon
} from '@heroicons/vue/24/outline';
import { getTypedValue } from '../../scripts/data.js';

const PAGE = { QUERY: 1, RESULTS: 2 };

function search(obj) {
    const value = obj.$refs['query-zone'].querySelector('input').value;

    API.execute_logged(API.ROUTE.ADMIN.USERS, API.METHOD.GET, User.CurrentUser?.getCredentials(), { search: value }).then((data) => {
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
    },
    methods: {
        displayPage(page) {
            const queryZone = this.$refs['query-zone'];
            const resultZone = this.$refs['result-zone'];
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
        deleteAccount() {
            API.execute_logged(API.ROUTE.ADMIN.USER + "/" + this.selectedUser.id, API.METHOD.DELETE, User.CurrentUser?.getCredentials()).then((data) => {
                this.displayPage(PAGE.QUERY);
                this.usersList.splice(this.usersList.indexOf(this.selectedUser), 1);
                this.selectedUser = null;
            });
        },
        updateAccount() {
            const props = ["lastName", "firstName", "email", "phone", "gender", "hasCar"];
            const newData = {};
            for (const prop of props) {
                const input = this.$el.querySelector(`input[name="${prop}"]`);
                newData[prop] = getTypedValue(input);
            }

            API.execute_logged(API.ROUTE.ADMIN.USER + "/" + this.selectedUser.id, API.METHOD.PATCH, User.CurrentUser?.getCredentials(), newData).then((data) => {
                for (const prop of props) {
                    this.selectedUser[prop] = newData[prop];
                }
                this.displayPage(PAGE.RESULTS);
            });
        }
    },
    data() {
        return { User, usersList: [], selectedUser: null, isMobile: window.innerWidth < 768, genres }
    },
    mounted() {
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