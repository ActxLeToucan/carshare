<template>
    <div class="flex md:flex-row flex-col grow max-h-full min-h-0">
        <div
            ref="query-zone"
            class="flex flex-col items-center h-full md:w-min w-full px-8 py-4 space-y-4 md:border-r-8 border-teal-500 mx-auto overflow-hidden"
        >
            <p class="text-2xl text-teal-500 py-2 font-bold mx-auto">
                {{ lang.GROUPS }}
            </p>
            <p class="text-lg text-slate-500 pt-2 font-semibold mx-auto">
                {{ lang.SEARCH_GROUP }}
            </p>
            <div class="flex max-w-full min-w-0 items-center space-x-2">
                <input-text
                    class="w-full flex grow"
                    placeholder="Rechercher"
                />
                <button-block
                    :action="search"
                    :disabled="!searchBar.buttonEnabled"
                >
                    <magnifying-glass-icon class="w-7 h-7" />
                </button-block>
            </div>
            <div
                ref="search-log-zone"
                class="flex flex-col w-full items-center h-fit overflow-hidden transition-all"
                style="max-height: 0;"
            />
            <div class="flex w-full flex-col px-8 space-y-4 pt-4 max-w-full min-w-0">
                <admin-group-card
                    v-for="group in groups"
                    :key="group?.id"
                    class="min-w-0 w-full show-up"
                    :data="group"
                    :onclick="onCardClicked"
                />
            </div>
        </div>
        <div
            ref="result-zone"
            class="flex flex-col grow px-4 p-4 overflow-auto"
        >
            <button
                ref="backtabs-btn"
                class="absolute md:hidden flex rounded-md border-2 border-slate-200 bg-white h-fit w-fit p-2 m-4"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-8 h-8"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                </svg>
            </button>

            <div
                v-if="selectedGroup != null"
                class="md:show-up flex flex-col justify-center"
            >
                <p class="text-2xl text-teal-500 py-2 font-bold mx-auto w-fit">
                    {{ selectedGroup.name }}
                </p>
                <card class="flex flex-col m-4 mx-auto">
                    <div class="flex flex-col">
                        <input-text
                            name="name"
                            :label="lang.GROUP_NAME"
                            :placeholder="lang.GROUP_NAME"
                            :value="selectedGroup.name"
                        />
                        <input-text
                            name="creatorId"
                            :label="lang.GROUP_CREATOR"
                            :placeholder="lang.GROUP_CREATOR"
                            :value="selectedGroup.creatorId"
                            class="mb-0"
                        />
                        <input-text
                                name="createdAt"
                                :type="Date"
                                :label="lang.GROUP_CREATEDAT"
                                :placeholder="lang.GROUP_CREATOR"
                                :value="selectedGroup.createdAt"
                                class="mb-0"
                        />
                        <div class="flex grow h-fit justify-center p-4">
                            <label
                                v-if="label != ''"
                                class="flex text-xl dark:text-slate-400 font-bold whitespace-nowrap text-ellipsis w-fit"
                                :class="dark ? ' text-white' : ' text-slate-500'"
                            >
                            {{ lang.USERS }}
                            </label>
                            <div
                                v-if="selectedGroup?.users.length == 0"
                                class="flex flex-col justify-center mx-auto max-w-full"
                            >
                                <card-badge
                                    :newline="true"
                                    class="max-w-full"
                                    :title="lang.NO_USERS"
                                    :content="lang.NO_USERS_DESC"
                                />
                            </div>
                            <div
                                v-if="selectedGroup?.users.length > 0"
                                class="flex overflow-x-auto space-x-4 w-full"
                            >
                                <card-badge
                                    v-for="member in selectedGroup?.users"
                                    :key="member.email"
                                    class="md:max-w-[18em] max-w-[14em]"
                                    :title="member.firstName + ' ' + member.lastName"
                                    :content="member.email"
                                />
                            </div>
                        </div>
                     
                    </div>
                    <div
                        ref="user-log-zone"
                        class="flex flex-col w-full items-center h-fit overflow-hidden transition-all"
                        style="max-height: 0;"
                    />
                    <div class="flex md:flex-row flex-col md:space-x-4 md:space-y-0 space-y-2 mt-4">
                        <button-block
                            :action="showDeletePopup"
                            color="red"
                        >
                            {{ lang.DELETE_GROUP }}
                        </button-block>
                        <div class="flex grow justify-end pl-20">
                            <button-block :action="updateAccount">
                                {{ lang.EDIT }}
                            </button-block>
                        </div>
                    </div>
                </card>
            </div>
        </div>
            <card-popup
                color="red"
                :title="lang.DELETE + ' ' + selectedGroup?.name"
                :content="lang.ACCOUNT_DELETE_VERIFY"
                :cancel-label="lang.CANCEL"
                :validate-label="lang.DELETE"
                :onload="setDeletePopup"
                :onvalidate="deleteGroup"
            >
            </card-popup>
    </div>
</template>

<script>
import User from '../../scripts/User.js';
import API from '../../scripts/API.js';
import InputText from '../inputs/InputText.vue';
import ButtonBlock from '../inputs/ButtonBlock.vue';
import AdminGroupCard from './AdminGroupCard.vue';
import CardPopup from '../cards/CardPopup.vue';
import CardBadge from '../cards/CardBadge.vue';
import Card from '../cards/CardBorder.vue';
import { Log, LogZone } from '../../scripts/Logs.js';
import { genres, isPhoneNumber, levels } from '../../scripts/data';

import {
    MagnifyingGlassIcon
} from '@heroicons/vue/24/outline';
import { getTypedValue } from '../../scripts/data.js';
import Lang from "../../scripts/Lang";
import re from "../../scripts/Regex";

const PAGE = { QUERY: 1, RESULTS: 2 };

function search(obj) {
    obj.searchBar.buttonEnabled = false;
    const log = obj.searchLog(Lang.CurrentLang.SEARCHING + "...", Log.INFO);

    const value = obj.$refs['query-zone'].querySelector('input').value;

    API.execute_logged(API.ROUTE.GROUPS, API.METHOD.GET, User.CurrentUser?.getCredentials() ,{ search : value}).then((data) => {
        obj.groups = data.data ?? data.group;
        log.delete();
        console.log(groups)
    }).catch((err) => {
        log.update(Lang.CurrentLang.ERROR + " : " + err.message, Log.ERROR);
        setTimeout(() => { log.delete(); }, 4000);
    }).finally(() => {
        obj.searchBar.buttonEnabled = true;
    });
    console.log("search")
}
export default {
    name: 'AdminGroups',
    components: {
        
        InputText,
        ButtonBlock,
        AdminGroupCard,
        CardPopup,
        Card,
        CardBadge,
        MagnifyingGlassIcon,
      
        
    },
    data() {
        return {
           
            User,
            groups: [],
            selectedGroup: null,
            isMobile: window.innerWidth < 768,
            genres,
            levels,
            lang: Lang.CurrentLang,
            pagination: API.createPagination(),
            formUser: {
                buttonEnabled: true,
            },
            searchBar: {
                buttonEnabled: true,
            },
        }
    },
    mounted() {
        Lang.AddCallback(lang => this.lang = lang);
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
        onCardClicked(group) {
            this.selectedGroup = group;
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
        updateAccount() {
            this.formUser.buttonEnabled = false;
            const log = this.userLog(Lang.CurrentLang.INPUT_VERIFICATION + " ...", Log.INFO);

            const field_checks = [
                { field: "name", check: (value) => value.length > 0, error: Lang.CurrentLang.GROUPNAME_SPECIFY },
                { field: "creatorId", check: (value) => value.length > 0, error: Lang.CurrentLang.CREATOR_SPECIFY },
                { field: "createdAt", check: (value) => value.length > 0, error: Lang.CurrentLang.CREATOR_SPECIFY },

                { field: "name", check: (value) => value.length <= 50, error: Lang.CurrentLang.GROUPNAME_SPECIFY },
                { field: "creatorId", check: (value) => value.length <= 50, error: Lang.CurrentLang.CREATOR_SPECIFY },
                { field: "createdAt", check: (value) => value.length <= 50, error: Lang.CurrentLang.CREATOR_SPECIFY },
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
            const props = ["name", "creatorId", "createdAt"];
            const newData = {};
            for (const prop of props) {
                const input = this.$el.querySelector(`input[name="${prop}"]`);
                newData[prop] = getTypedValue(input);
                console.log("e")
            }
            //todo
            log.update(Lang.CurrentLang.CHANGING_INFORMATIONS, Log.WARNING);
            API.execute_logged(API.ROUTE.GROUPS + "/" + this.selectedGroup.id, API.METHOD.PATCH, User.CurrentUser?.getCredentials(), newData).then((data) => {
                for (const prop of props) {
                    this.selectedGroup[prop] = newData[prop];
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
          userLog(msg, type = Log.INFO) {
            if (!this.userLogZone) {
                this.userLogZone = new LogZone(this.$refs["user-log-zone"]);
                if (!this.userLogZone) return;
            }
            const log = new Log(msg, type);
            log.attachTo(this.userLogZone);
            return log;
        },
        setDeletePopup(popup) {
            this.deletePopup = popup;
        },
        showDeletePopup() {
            this.deletePopup.setTitle(this.lang.DELETE + ' ' + this.selectedUser?.firstName + ' ' + this.selectedUser?.lastName);
            this.deletePopup.show();
        }, 
        deleteGroup(popup) {
        //todo
            popup.setTitle(this.lang.DELETE + ' ' + this.selectedGroup?.name);
            API.execute_logged(API.ROUTE.GROUPS + "/" + this.selectedGroup.id + this.pagination, API.METHOD.DELETE, User.CurrentUser?.getCredentials()).then((data) => {
                this.displayPage(PAGE.QUERY);
                this.groups.splice(this.groups.indexOf(this.selectedGroup), 1);
                this.selectedGroup = null;
                setTimeout(() => {
                    popup.hide();
                }, 2000);
            }).catch(err => {
                setTimeout(() => {
                   
                }, 4000);
            });
        },
        
    }
}
</script>