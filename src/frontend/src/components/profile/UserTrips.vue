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
        return { trips: [], loading: false, lang: Lang.CurrentLang, startCity: {}, endCity: {}, selectedTripId: null}
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
    searchTrips() {
            const msg_log = this.log(Lang.CurrentLang.INPUT_VERIFICATION, Log.INFO);
            const input_date = document.querySelector("input[name=datetime]");
            const input_start = document.querySelector("input[name=startingpoint]");
            const input_end = document.querySelector("input[name=endingpoint]");

            const field_checks = [
                { field: input_start, msg: Lang.CurrentLang.STARTING_POINT_SPECIFY },
                { field: input_end, msg: Lang.CurrentLang.ENDING_POINT_SPECIFY },
                { field: input_date, msg: Lang.CurrentLang.DATE_SPECIFY }
            ];

            for (let i = 0; i < field_checks.length; i++) {
                const check = field_checks[i];
                if (check.field.value == "") {
                    msg_log.update(check.msg, Log.WARNING);
                    check.field.focus();
                    setTimeout(() => { msg_log.delete(); }, 6000);
                    return;
                }
            }

            msg_log.update(Lang.CurrentLang.SEARCHING + " ...", Log.INFO);
            API.execute_logged(API.ROUTE.TRAVELS.MY.PASSENGER + API.createParameters({
                date: new Date(input_date.value).toISOString(),
                startCity: this.startCity.value,
                endCity: this.endCity.value,
                startContext: this.startCity.desc,
                endContext: this.endCity.desc,
            }), API.METHOD.GET, User.CurrentUser.getCredentials()).then(res => {
                this.setTrips(res);
                msg_log.delete();
            }).catch(err => {
                console.error(err);
                this.setTrips(err);
                msg_log.update(Lang.CurrentLang.ERROR + " : " + err.message, Log.ERROR);
                setTimeout(() => { msg_log.delete(); }, 5000);
            });
        },
    setTrips(list) {
            this.trips = [];
            if (typeof list == "string")
            {
                this.$refs["err-fetch"].classList.remove("hidden");
                this.$refs["err-fetch-msg"].innerText = list;
                return;
            } else if (typeof list == "object" && list.message) {
                this.$refs["err-fetch"].classList.add("hidden");
                return;
            } else {
                this.$refs["err-fetch"].classList.add("hidden");
            }

            if (list.length == 0) {
                this.$refs["err-notfound"].classList.remove("hidden");
                return;
            } else {
                this.$refs["err-notfound"].classList.add("hidden");
            }

            console.log(list);

            for (const el of list) {
                this.trips.push({
                    id: el.id,
                    date: new Date(el.departure.date).toLocaleDateString(),
                    author: el.driver.firstName + " " + el.driver.lastName?.substring(0, 1) + ".",
                    startCity: el.departure.city,
                    startTime: new Date(el.departure.date).toLocaleTimeString().substring(0, 5),
                    endCity: el.arrival.city,
                    endTime: new Date(el.arrival.date).toLocaleTimeString().substring(0, 5),
                    slots: el.maxPassengers - (el.passengers === undefined ? 0 : el.passengers) + " / " + el.maxPassengers,
                    price: el.price,
                });
            }
        },
 
}
}
</script>


