<template>
    <div class="md:show-up flex flex-col grow">
        <p class="text-2xl text-teal-500 py-2 font-bold mx-auto"> {{ lang.MY_TRIPS }} </p>
        <p class="ml-5 text-2xl text-slate-400"  style="margin-top: 3em">{{ lang.Future_trips }}</p>
        
        <div class="flex flex-col justify-center py-4 my-4 rounded-lg bg-slate-100 px-4" style="margin-left: 1em; margin-right: 40em; position: relative;">
            <p class="text-2xl text-slate-500 py-2 font-semibold">{{ lang.Trip_off }}</p>
            <div class="flex justify-between">
            <p class="text-xl text-slate-500 py-2 font-semibold">villeD</p>
            <p class="text-xl text-slate-500 py-2 font-semibold">heureD</p>
            </div>
            <div class="flex justify-between">
            <p class="text-xl text-slate-500 py-2 font-semibold">villeA</p>
            <p class="text-xl text-slate-500 py-2 font-semibold">heureA</p>
        </div>
            <button-block v-on:click="actionOnClick" class="show-right flex flex-col items-right md:w-min w-full mx-auto overflow-hidden text-xl" style="position: absolute; bottom: 0; right: 0; margin-right: 0.5em ;margin-bottom: 0.5em">{{ lang.CANCEL }}</button-block>
            <p class="text-xl text-slate-500 py-2 font-semibold">{{ lang.Passenger }}</p>
        </div>
        
        <p class="ml-5 text-2xl text-slate-400" style="margin-top: 5em ;">{{ lang.Past_trips }}</p>
                   
        <div class="flex justify-between py-4 my-4 rounded-lg bg-slate-100 px-4 justify-between" style="margin-left: 1em; margin-right: 15em; position: relative;">
            <p class="text-xl text-slate-500 py-2 font-semibold">date</p>
            <p class="text-xl text-slate-500 py-2 font-semibold">heureD</p>
            <p class="text-xl text-slate-500 py-2 font-semibold">villeD</p>
            <p class="text-xl text-slate-500 py-2 font-semibold">heureA</p>
            <p class="text-xl text-slate-500 py-2 font-semibold">villeA</p>
            <p class="text-xl text-slate-500 py-2 font-semibold" style="text-align: right">{{ lang.Passenger }}</p>
        </div>


 
    </div>
    </template>

<script>
import Lang from '../../scripts/Lang';
import ButtonBlock from '../inputs/ButtonBlock.vue';
import InputText from '../inputs/InputText.vue';

import {
    XMarkIcon
} from '@heroicons/vue/24/outline';
import API from '../../scripts/API';
import User from '../../scripts/User';
import { Log } from '../../scripts/Logs';

export default {
    name: "UserTrips",
    components: {
        ButtonBlock,
        XMarkIcon,
        InputText,
    },
    data() {
        return { groups: [], loading: false, lang: Lang.CurrentLang, selectedGroup: null, deletePopup: null, createPopup: null }

    },
    mounted() {
        Lang.AddCallback(lang => this.lang = lang);
    }
}
</script>