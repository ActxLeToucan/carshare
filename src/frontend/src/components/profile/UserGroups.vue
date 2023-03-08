<template>
    <div class="md:show-up flex flex-col grow">
        <p class="text-2xl text-teal-500 py-2 font-bold mx-auto"> {{ lang.MY_GROUPS }} </p>
        <div class="flex flex-col grow justify-evenly">

            <div class="flex flex-col w-fit md:mx-auto mx-4">
                <p class="text-xl text-slate-500 py-2 font-semibold"> {{ lang.MY_GROUPS }} </p>
                <card class="flex grow h-fit min-w-[60vw] md:max-w-[70vw]">
                    <div v-show="loading" class="flex flex-col justify-center mx-auto">

                        <div class="flex flex-col justify-center py-4 my-4 rounded-lg bg-slate-100 px-4">
                            <p class="text-xl text-center text-slate-500 font-bold mx-auto"> {{ lang.LOADING_GROUPS }} </p>
                            <p ref="loading-desc" class="text-xl text-center text-slate-500 mx-auto"> {{ lang.LOADING_GROUPS_DESC }} </p>
                        </div>
                        
                    </div>
                    <div v-if="groups.length == 0 && !loading" class="flex flex-col justify-center mx-auto">

                        <div class="flex flex-col justify-center py-4 my-4 rounded-lg bg-slate-100 px-4">
                            <p class="text-xl text-center text-slate-500 font-bold mx-auto"> {{ lang.NO_GROUPS }} </p>
                            <p class="text-xl text-center text-slate-500 mx-auto"> {{ lang.NO_GROUPS_DESC }} </p>
                        </div>
                        
                    </div>
                    <div v-if="groups.length > 0 && !loading" class="flex space-x-4 overflow-x-scroll w-full">
                        
                        <button v-for="group in groups" :key="group.name" v-on:click="showGroup(group)"
                            class="flex flex-col justify-center py-4 my-4 rounded-lg bg-slate-100 px-4 w-fit max-w-[14em] border-2 border-transparent
                                    hover:border-slate-200 cursor-pointer transition-all"
                        >
                            <p class="text-2xl text-slate-500 font-bold mx-auto whitespace-nowrap text-ellipsis overflow-x-hidden max-w-full"> {{ group.name }} </p>
                            <p class="text-2xl text-slate-500 mx-auto whitespace-nowrap text-ellipsis overflow-x-hidden max-w-full"> {{ group.users.length }} {{ lang.MEMBERS }} </p>
                        </button>

                    </div>
                </card>
                <div class="flex justify-center mt-4">
                    <button-block :action="createPopup?.show"> {{ lang.CREATE_GROUP }} </button-block>
                </div>
            </div>

            <div ref="group-zone" class="flex w-[60vw] h-fit mx-auto transition-all overflow-hidden" style="max-height: 0px;">
                <div class="flex flex-col h-fit grow rounded-lg border-2 border-slate-200 overflow-hidden">
                    <div class="flex grow bg-slate-100 h-fit items-center">
                        <div class="w-8 h-8"></div>
                        <div class="flex grow justify-center py-1">
                            <p class="text-2xl text-slate-500 font-bold mx-auto whitespace-nowrap text-ellipsis overflow-x-hidden max-w-full"> {{ selectedGroup?.name }} </p>
                        </div>
                        <x-mark-icon class="w-8 h-8 mr-1 text-slate-500 hover:text-slate-600 cursor-pointer transition-all" v-on:click="hideGroupZone()"/>
                    </div>
                    <div class="flex grow h-fit justify-center p-4">
                        
                        <div v-if="selectedGroup?.users.length == 0" class="flex flex-col justify-center mx-auto">

                            <div class="flex flex-col justify-center py-4 my-4 rounded-lg bg-slate-100 px-4">
                                <p class="text-2xl text-center text-slate-500 font-bold mx-auto"> {{ lang.NO_USERS }} </p>
                                <p class="text-2xl text-center text-slate-500 mx-auto"> {{ lang.NO_USERS_DESC }} </p>
                            </div>
                            
                        </div>
                        <div v-if="selectedGroup?.users.length > 0" class="flex justify-center overflow-x-auto space-x-4 w-full">
                            
                            <div v-for="member in selectedGroup?.users" :key="member.email"
                                class="flex flex-col justify-center py-4 my-4 rounded-lg bg-slate-100 px-4 w-fit max-w-[14em]"
                            >
                                <p class="text-xl text-slate-500 font-bold mx-auto whitespace-nowrap text-ellipsis overflow-x-hidden max-w-full"> {{ member.firstName + ' ' + member.lastName }} </p>
                                <p class="text-lg text-slate-500 mx-auto whitespace-nowrap text-ellipsis overflow-x-hidden max-w-full"> {{ member.email }} {{ lang.MEMBERS }} </p>
                            </div>

                        </div>

                    </div>
                    <div class="flex grow justify-end p-2">
                        <button-block color="red" :action="deletePopup?.show"> {{ lang.DELETE_GROUP }} </button-block>
                    </div>
                </div>
            </div>

        </div>
        <popup
            color="red"
            :title="lang.DELETE_GROUP"
            :content="lang.GROUP_DELETE_CONFIRMATION"
            :cancelLabel="lang.CANCEL"
            :validateLabel="lang.DELETE"
            :onload="setDeletePopup"
            :onvalidate="removeGroup"
        ></popup>
        <popup
            ref="create-popup"
            :title="lang.CREATE_GROUP"
            :content="lang.GROUP_CREATE_CONFIRMATION+'.'"
            :cancelLabel="lang.CANCEL"
            :validateLabel="lang.CREATE"
            :onvalidate="createGroup"
        >
            <input-text :label="lang.GROUP_NAME" :placeholder="lang.GROUP_NAME" name="name"></input-text>
        </popup>
    </div>
</template>

<script>
import Lang from '../../scripts/Lang';
import Card from '../cards/Card.vue';
import ButtonBlock from '../inputs/ButtonBlock.vue';
import InputText from '../inputs/InputText.vue';
import Popup from '../cards/Popup.vue';

import {
    XMarkIcon
} from '@heroicons/vue/24/outline';
import API from '../../scripts/API';
import User from '../../scripts/User';
import { Log } from '../../scripts/Logs';

export default {
    name: "UserGroups",
    components: {
        Card,
        ButtonBlock,
        XMarkIcon,
        Popup,
        InputText
    },
    data() {
        return { groups: [], loading: false, lang: Lang.CurrentLang, selectedGroup: null, deletePopup: null, createPopup: null }
    },
    methods: {
        showGroupZone() {
            const zone = this.$refs["group-zone"];
            const child = zone.firstElementChild;
            zone.style.maxHeight = child.getBoundingClientRect().height + "px";
            setTimeout(() => { zone.style.maxHeight = "2000px"; }, 250);
        },
        hideGroupZone() {
            const zone = this.$refs["group-zone"];
            zone.style.maxHeight = "0px";
        },
        showGroup(group) {
            this.selectedGroup = group;
            this.showGroupZone();
        },
        setDeletePopup(popup) {
            this.deletePopup = popup;
        },
        removeGroup() {
            this.selectedGroup
        },
        createGroup(popup) {
            const log = popup.log(Lang.CurrentLang.CREATING_GROUP + " ...", Log.INFO);
            const name = popup.get("name");
            API.execute_logged(API.ROUTE.GROUPS, API.METHOD.POST, User.CurrentUser?.getCredentials(), {name}).then(res => {
                log.update(Lang.CurrentLang.GROUP_CREATED, Log.SUCCESS);
                setTimeout(() => {
                    log.delete();
                    popup.hide();
                }, 2000);
                this.updateGroups();
            }).catch(err => {
                log.update(Lang.CurrentLang.ERROR + " : " + err, Log.ERROR);
                setTimeout(() => {
                    log.delete();
                }, 6000);
            });
        },
        updateGroups() {
            this.loading = true;
            this.$refs["loading-desc"].innerHTML = Lang.CurrentLang.LOADING_GROUPS_DESC;
            this.groups.splice(0, this.groups.length);
            API.execute_logged(API.ROUTE.GROUPS, API.METHOD.GET, User.CurrentUser?.getCredentials()).then(res => {
                res.forEach(group => this.groups.push(group));
                this.loading = false;
            }).catch(err => {
                console.error(err);
                this.$refs["loading-desc"].innerHTML = Lang.CurrentLang.ERROR + " : " + err.message;
            });
        }
    },
    mounted() {
        Lang.AddCallback(lang => this.lang = lang);
        this.updateGroups();

        this.createPopup = this.$refs["create-popup"];
    }
}
</script>