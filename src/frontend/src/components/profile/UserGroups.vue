<template>
    <div class="show-up flex flex-col grow">
        <p class="text-2xl text-teal-500 py-2 font-bold mx-auto"> {{ lang.MY_GROUPS }} </p>
        <div class="flex flex-col grow justify-evenly">

            <div class="flex flex-col w-fit mx-auto">
                <p class="text-2xl text-slate-500 py-2 font-semibold"> {{ lang.MY_GROUPS }} </p>
                <card class="min-w-[60vw] max-w-[60vw]">
                    <div v-if="groups.length == 0" class="flex flex-col justify-center mx-auto">

                        <div class="flex flex-col justify-center py-4 my-4 rounded-lg bg-slate-100 px-4">
                            <p class="text-2xl text-slate-500 font-bold mx-auto"> {{ lang.NO_GROUPS }} </p>
                            <p class="text-2xl text-slate-500 mx-auto"> {{ lang.NO_GROUPS_DESC }} </p>
                        </div>
                        
                    </div>
                    <div v-if="groups.length > 0" class="flex justify-center overflow-x-auto space-x-4 w-full">
                        
                        <button v-for="group in groups" :key="group.name" v-on:click="showGroup(group)"
                            class="flex flex-col justify-center py-4 my-4 rounded-lg bg-slate-100 px-4 w-fit max-w-[14em] border-2 border-transparent
                                   hover:border-slate-200 cursor-pointer transition-all"
                        >
                            <p class="text-2xl text-slate-500 font-bold mx-auto whitespace-nowrap text-ellipsis overflow-x-hidden max-w-full"> {{ group.name }} </p>
                            <p class="text-2xl text-slate-500 mx-auto whitespace-nowrap text-ellipsis overflow-x-hidden max-w-full"> {{ group.members.length }} {{ lang.MEMBERS }} </p>
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
                        
                        <div v-if="selectedGroup?.members.length == 0" class="flex flex-col justify-center mx-auto">

                            <div class="flex flex-col justify-center py-4 my-4 rounded-lg bg-slate-100 px-4">
                                <p class="text-2xl text-slate-500 font-bold mx-auto"> {{ lang.NO_GROUPS }} </p>
                                <p class="text-2xl text-slate-500 mx-auto"> {{ lang.NO_GROUPS_DESC }} </p>
                            </div>
                            
                        </div>
                        <div v-if="selectedGroup?.members.length > 0" class="flex justify-center overflow-x-auto space-x-4 w-full">
                            
                            <div v-for="member in selectedGroup?.members" :key="member.email"
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
        >
            <input-text :label="lang.PASSWORD" :placeholder="lang.PASSWORD" name="password" type="password"></input-text>
        </popup>
        <popup
            ref="create-popup"
            :title="lang.DELETE_GROUP"
            :content="lang.GROUP_DELETE_CONFIRMATION"
            :cancelLabel="lang.CANCEL"
            :validateLabel="lang.DELETE"
            :onvalidate="createGroup"
        >
            <input-text :label="lang.PASSWORD" :placeholder="lang.PASSWORD" name="password" type="password"></input-text>
        </popup>
    </div>
</template>

<script>
import Lang from '../../scripts/Lang';
import Card from '../cards/Card.vue';
import ButtonBlock from '../inputs/ButtonBlock.vue';
import Popup from '../cards/Popup.vue';

import {
    XMarkIcon
} from '@heroicons/vue/24/outline';

const groups = [
    {name: "Groupe des super zamis", members: [
        {email: "jean.dupont@gmail.com", firstName: "Jean", lastName: "Dupont"},
        {email: "jean.dupond@gmail.com", firstName: "Jean", lastName: "Dupond"},
    ]}
];

export default {
    name: "UserGroups",
    components: {
        Card,
        ButtonBlock,
        XMarkIcon,
        Popup
    },
    data() {
        return { groups, lang: Lang.CurrentLang, selectedGroup: null, deletePopup: null, createPopup: null }
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
        }
    },
    mounted() {
        Lang.addCallback(lang => this.lang = lang);

        this.createPopup = this.$refs["create-popup"];
    }
}
</script>