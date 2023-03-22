<template>
    <div class="md:show-up flex flex-col grow">
        <p class="text-2xl text-teal-500 py-2 font-bold mx-auto"> {{ lang.MY_TRIPS }} </p>
        <p class="ml-5 text-2xl text-slate-400"  style="margin-top: 3em">{{ lang.FUTURE_TRIPS }}</p>

        <card class="flex flex-col md:m-4 my-4">
           <P>PAS DE TRAJETS DISPO</P>
          <div
                        v-if="groups.length > 0 && !loading"
                        class="flex space-x-4 overflow-x-scroll w-full"
                    >
                        <button
                            v-for="group in groups"
                            :key="group.id"
                            class="flex flex-col justify-center py-4 my-4 rounded-lg bg-slate-100 dark:bg-slate-700 px-4 w-fit max-w-[14em]
                                    border-2 border-transparent hover:border-slate-200 hover:border-slate-600 cursor-pointer transition-all"
                            @click="showGroup(group)"
                        >
                            <p class="text-xl md:text-2xl text-slate-500 dark:text-slate-300 font-bold mx-auto whitespace-nowrap text-ellipsis overflow-x-hidden max-w-full">
                                {{ group.name }}
                            </p>
                            <p class="text-lg md:text-xl text-slate-500 dark:text-slate-400 mx-auto whitespace-nowrap text-ellipsis overflow-x-hidden max-w-full">
                                {{ group.users.length }} {{ lang.MEMBERS }}
                            </p>
                        </button>
                    </div>
        </card>



        


        <div class="flex flex-col justify-center py-4 my-4 rounded-lg bg-slate-100 px-4" >
            <p class="text-2xl text-slate-500 py-2 font-semibold">{{ lang.TRIP_OFF }}</p>
        <div class="flex justify-between">
            <p class="text-xl text-slate-500 py-2 font-semibold">villeDdddddddddd</p>
            <p class="text-xl text-slate-500 py-2 font-semibold">heureD</p>
        </div>
        <div class="flex justify-between">
            <p class="text-xl text-slate-500 py-2 font-semibold">villeA</p>
            <p class="text-xl text-slate-500 py-2 font-semibold">heureA</p>
        </div>
            <button-block v-on:click="actionOnClick" class="show-right flex flex-col items-right md:w-min w-full mx-auto overflow-hidden text-xl" style="position: absolute; bottom: 0; right: 0; margin-right: 0.5em ;margin-bottom: 0.5em">{{ lang.CANCEL }}</button-block>
            <p class="text-xl text-slate-500 py-2 font-semibold">{{ lang.PASSENGER }}</p>
        </div>
        <p class="ml-5 text-2xl text-slate-400" style="margin-top: 5em ;">{{ lang.PAST_TRIPS }}</p>
         
        <card-border class="flex flex-col md:m-4 my-4">
        <div class="flex justify-between py-4 my-4 rounded-lg bg-slate-100 px-4 justify-between">
            <p class="text-xl text-slate-500 py-2 font-semibold">date</p>
            <p class="text-xl text-slate-500 py-2 font-semibold">heureD</p>
            <p class="text-xl text-slate-500 py-2 font-semibold">villeD</p>
            <p class="text-xl text-slate-500 py-2 font-semibold">heureA</p>
            <p class="text-xl text-slate-500 py-2 font-semibold">villeA</p>
            <p class="text-xl text-slate-500 py-2 font-semibold" style="text-align: right">{{ lang.PASSENGER }}</p>
        </div>
       </card-border>


 
    </div>

    </template>

<script>
import Lang from '../../scripts/Lang'
import ButtonBlock from '../inputs/ButtonBlock.vue';
import InputText from '../inputs/InputText.vue';
import CardBorder from '../cards/CardBorder.vue';
import Card from '../cards/CardBorder.vue';
import CardBadge from '../cards/CardBadge.vue';
import CardPopup from '../cards/CardPopup.vue';


import {
    XMarkIcon
} from '@heroicons/vue/24/outline';
import API from '../../scripts/API';
import User from '../../scripts/User';


export default {
    name: "UserTrips",
    components: {
        ButtonBlock,
        XMarkIcon,
        InputText,
        CardBorder,
        Card,
        CardBadge,
        CardPopup
    },
    data() {
        return { groups: [], loading: false, lang: Lang.CurrentLang, selectedGroup: null, deletePopup: null, createPopup: null }

    },
    mounted() {
        Lang.AddCallback(lang => this.lang = lang);
        this.updateGroups();  },
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
    removeTrip() {
            this.selectedGroup
        },
        updateGroups() {
            this.loading = true;
            this.groups.splice(0, this.groups.length);
            API.execute_logged(API.ROUTE.TRAVELS.MY.PASSENGER, API.METHOD.GET, User.CurrentUser?.getCredentials()).then(res => {
                const data = res.data ?? res.groups;
                data.forEach(group => this.groups.push(group));
                this.loading = false;
            }).catch(err => {
                console.error(err);
            });
        }     
}
}
</script>

