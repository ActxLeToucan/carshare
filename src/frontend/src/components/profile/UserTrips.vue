<template>
    <div class="md:show-up flex flex-col grow">
        <p class="text-2xl text-teal-500 py-2 font-bold mx-auto"> {{ lang.MY_TRIPS }} </p>
        <p class="ml-5 text-2xl text-slate-400"  style="margin-top: 3em">{{ lang.FUTURE_TRIPS }}</p>
        
        <div class="flex w-full flex-col px-8 space-y-4 pt-4 max-w-full min-w-0">
               <user-trips-card
                    class="min-w-0 w-full show-up" v-for="group in groups"
                    :data="group" :key="group?.id" :onclick="onCardClicked">
                </user-trips-card>
            </div>

        
        <p class="ml-5 text-2xl text-slate-400" style="margin-top: 5em ;">{{ lang.PAST_TRIPS }}</p>


 
    </div>
    </template>

<script>
import Lang from '../../scripts/Lang';
import ButtonBlock from '../inputs/ButtonBlock.vue';
import InputText from '../inputs/InputText.vue';
import UserTripsCard from './UserTripsCard.vue';


import {
    XMarkIcon
} from '@heroicons/vue/24/outline';
import API from '../../scripts/API';
import User from '../../scripts/User';
import { Log } from '../../scripts/Logs';


function search(obj) {
    obj.searchBar.buttonEnabled = false;
    const log = obj.searchLog(Lang.CurrentLang.SEARCHING + "...", Log.INFO);

    const value = obj.$refs['query-zone'].querySelector('input').value;

    API.execute_logged(API.ROUTE.GROUPS, API.METHOD.GET, User.CurrentUser?.getCredentials() ,{ search : value}).then((data) => {
        obj.groups = data.data ?? data.group;
        log.delete();
        console.log("succes");
    }).catch((err) => {
        log.update(Lang.CurrentLang.ERROR + " : " + err.message, Log.ERROR);
        setTimeout(() => { log.delete(); }, 4000);
    }).finally(() => {
        obj.searchBar.buttonEnabled = true;
    });
    console.log("searshing ");
}


export default {
    name: "UserTrips",
    components: {
        ButtonBlock,
        XMarkIcon,
        InputText,
        userTripsCard,
    },
    data() {
        return { 
            groups: [],
            lang: Lang.CurrentLang,
                formProperties: {
                properties: {
                    departureDate: User.CurrentUser?.lastName,
                },
                buttonEnabled: true
            },
        }

    },
    mounted() {
        Lang.AddCallback(lang => this.lang = lang);
    }
}
</script>
