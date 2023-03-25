<template>
    <div class="md:show-up flex flex-col grow">
        <p class="text-2xl text-teal-500 py-2 font-bold mx-auto"> {{ lang.MY_TRIPS }} </p>
        <p class="ml-5 text-2xl text-slate-400"  style="margin-top: 3em">{{ lang.FUTURE_TRIPS }}</p>

    <!--
       <card class="flex flex-col md:m-4 my-4">
           <P>PAS DE TRAJETS DISPO</P>
          <div
                        v-if="trips.length > 0 && !loading"
                        class="flex space-x-4 overflow-x-scroll w-full"
                    >
                        <button
                            v-for="trip in trips"
                            :key="trip.id"
                            class="flex flex-col justify-center py-4 my-4 rounded-lg bg-slate-100 dark:bg-slate-700 px-4 w-fit max-w-[14em]
                                    border-2 border-transparent hover:border-slate-200 hover:border-slate-600 cursor-pointer transition-all"
                            @click="showTrip(trip)"
                        >
                            <p class="text-xl md:text-2xl text-slate-500 dark:text-slate-300 font-bold mx-auto whitespace-nowrap text-ellipsis overflow-x-hidden max-w-full">
                                {{ trip.name}}
                            </p>
                        </button>
                    </div>
        </card>
    --> 

    <div class="flex flex-col grow min-h-[50vh] w-full justify-center items-center">
                <div
                    ref="log-zone"
                    class="flex flex-col w-full justify-center items-center min-h-max h-max transition-all"
                    style="max-height: 0px;"
                />

                <div
                    ref="err-notfound"
                    class="flex hidden grow h-fit w-full py-8 justify-center items-center"
                >
                    <card-border class="flex flex-col justify-center items-center">
                        <p class="text-2xl text-slate-500 dark:text-slate-400 font-bold">
                            {{ lang.NO_TRIPS }}
                        </p>
                        <p class="text-xl text-slate-400 dark:text-slate-500 font-semibold">
                            {{ lang.NO_TRIPS_DESC }}
                        </p>
                    </card-border>
                </div>

                <div
                    ref="err-fetch"
                    class="flex hidden grow h-fit w-full fit py-8 justify-center items-center"
                >
                    <card-border class="flex flex-col justify-center items-center">
                        <p class="text-2xl text-slate-500 dark:text-slate-400 font-bold">
                            {{ lang.ERROR }}
                        </p>
                        <p
                            ref="err-fetch-msg"
                            class="text-xl text-slate-400 dark:text-slate-500 font-semibold"
                        />
                    </card-border>
                </div>

                <travel-card
                    v-for="trip in trips"
                    :key="trip.id"
                    :trip="trip"
                    class="mx-auto"
                />
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
import TravelCard from '../cards/TravelCard.vue';
import { Log, LogZone } from '../../scripts/Logs';


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
        CardPopup,
        TravelCard
    },
    data() {
        return { trips: [], loading: false, lang: Lang.CurrentLang, startCity: {}, endCity: {}}
    },
    mounted() {
        Lang.AddCallback(lang => this.lang = lang);
        this.updateTrips(); 
        this.logZone = new LogZone(this.$refs["log-zone"]);
      
        window.action = () => { this.selectTrip(9); }
    },
    methods: {
        showTripZone() {
            const zone = this.$refs["group-zone"];
            const child = zone.firstElementChild;
            zone.style.maxHeight = child.getBoundingClientRect().height + "px";
            setTimeout(() => { zone.style.maxHeight = "2000px"; }, 250);
    },
    updateTrips() {
            this.loading = true;
            this.trips.splice(0, this.trips.length);
            API.execute_logged(API.ROUTE.USERS , API.METHOD.GET, User.CurrentUser?.getCredentials()).then(res => {
                const data = res.data ?? res.trips;
                data.forEach(trip => this.trips.push(trip));
                this.loading = false;
            }).catch(err => {
                console.error(err);
            });
    },    
    log(msg, type = Log.INFO) {
            if (!this.logZone) return null;
            const log = new Log(msg, type);
            log.attachTo(this.logZone);
            return log;
        },
}
}
</script>


