<template>
    <div>
        <div
            v-if="trip != null"
            class="flex md:flex-row flex-col grow min-w-0 max-w-[80vw] max-h-full min-h-0 space-y-4 items-center"
        >
            <div class="flex grow flex-col md:w-[50%] w-full justify-center items-center md:pr-4 space-y-4">
                <p class="text-xl text-slate-600 dark:text-slate-300 font-bold whitespace-nowrap text-ellipsis overflow-hidden py-2">
                    {{ lang.TRIP_DESTINATIONS }}
                </p>
                <div class="flex flex-col grow h-fit w-fit space-y-2 w-full overflow-y-auto">
                    <div
                        v-for="(step, index) in trip.etapes"
                        :key="step.id"
                        class="flex h-fit w-full justify-between items-center space-x-10 rounded-md border-2 py-1 px-2"
                        :class="(index < startIndex || index > endIndex) ? ' bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600' : ' bg-white dark:bg-slate-600 border-slate-300 dark:border-slate-500'"
                    >
                        <p
                            class="text-xl font-bold whitespace-nowrap text-ellipsis overflow-hidden"
                            :class="(index < startIndex || index > endIndex) ? ' text-slate-400 dark:text-slate-500' : ' text-slate-500 dark:text-slate-200'"
                        >
                            {{ step.city }}
                        </p>
                        <p
                            class="text-lg font-semibold whitespace-nowrap"
                            :class="(index < startIndex || index > endIndex) ? ' text-slate-300 dark:text-slate-500' : ' text-slate-400 dark:text-slate-300'"
                        >
                            {{ new Date(step.date).toLocaleTimeString().substring(0, 5) }}
                        </p>
                    </div>
                </div>
                <div class="flex flex-col grow rounded-lg bg-slate-200 dark:bg-slate-600 border-2 border-slate-200 dark:border-slate-600 w-full">
                    <p class="text-xl text-slate-600 dark:text-slate-200 font-bold mx-2 mb-1">
                        {{ lang.TRIP_INFO }}
                    </p>
                    <div class="flex grow rounded-md bg-white dark:bg-slate-700 p-2">
                        <p class="text-lg text-slate-500 dark:text-slate-300 font-semibold text-ellipsis overflow-hidden">
                            {{ trip.description }}
                        </p>
                    </div>
                </div>
            </div>
            <span class="hidden md:flex grow h-40 w-1 bg-slate-200 dark:bg-slate-700 rounded-md my-auto" />
            <div class="flex grow flex-col md:w-[50%] w-full justify-center items-center md:pl-4 space-y-4">
                <div class="flex flex-col h-50% w-full">
                    <p class="text-xl text-slate-600 dark:text-slate-300 font-bold mx-2 mb-1 mr-auto">
                        {{ lang.PASSENGERS }}
                    </p>
                    <div class="flex bg-white dark:bg-slate-700 rounded-md border-2 border-slate-200 dark:border-slate-600 p-2 w-full min-h-[8em] items-center">
                        <p class="text-slate-500 dark:text-slate-400 text-lg font-semibold w-fit mx-auto">
                            {{ lang.NO_PASSENGERS }}.
                        </p>
                    </div>
                </div>

                <div class="flex h-50% w-full">
                    <div class="flex w-[50%] justify-evenly items-center">
                        <div class="flex flex-col">
                            <p class="text-xl text-slate-600 dark:text-slate-300 font-bold mx-2 mb-1 mx-auto text-center">
                                {{ lang.DRIVER }}
                            </p>
                            <div class="flex flex-col justify-center items-center m-2 h-20 w-20 items-center bg-white dark:bg-slate-700 rounded-md mx-auto">
                                <div class="flex w-14 h-14 p-2 mx-auto">
                                    <user-icon class="w-full text-slate-500 dark:text-slate-400" />
                                </div>
                                <p class="text-slate-500 dark:text-slate-300 text-lg font-semibold">
                                    {{ trip.driver.firstName + " " + trip.driver.lastName.substring(0, 1) + "." }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="flex w-[50%] justify-evenly items-center">
                        <div class="flex flex-col">
                            <p class="text-xl text-slate-600 dark:text-slate-300 font-bold mx-2 mb-1 mx-auto text-center">
                                {{ lang.PRICE }}
                            </p>
                            <div class="flex flex-col justify-center items-center m-2 h-20 w-20 items-center bg-white dark:bg-slate-700 rounded-md mx-auto">
                                <p class="text-slate-500 dark:text-slate-300 text-2xl font-bold">
                                    {{ trip.price + " €" }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex w-full justify-center items-center my-4">
            <button-block :action="bookTrip">
                {{ lang.BOOK_TRIP }}
            </button-block>
        </div>
        <div
            ref="log-zone"
            class="flex flex-col w-full justify-center items-center min-h-max h-max transition-all"
            style="max-height: 0px;"
        />
    </div>
</template>

<script>
import API from '../../scripts/API';
import Lang from "../../scripts/Lang";
import User from "../../scripts/User";
import ButtonBlock from "../inputs/ButtonBlock.vue";
import { Log, LogZone } from "../../scripts/Logs";

import {
    UserIcon
} from '@heroicons/vue/24/outline';

export default {
    name: "TripDetail",
    components: {
        ButtonBlock,
        UserIcon
    },
    props: {
        tripId: {
            type: [Number, String, null],
            required: true,
        },
        tripStart: {
            type: [Object, String, null],
            required: true,
        },
        tripEnd: {
            type: [Object, String, null],
            required: true,
        }
    },
    data() {
        return { User, lang: Lang.CurrentLang, trip: null, startIndex: null, endIndex: null };
    },
    watch: {
        tripId: function (newVal, oldVal) {
            this.loadTrip(newVal);
        },
    },
    mounted() {
        Lang.AddCallback((lang) => (this.lang = lang));
        this.loadTrip(this.id);

        this.logZone = new LogZone(this.$refs["log-zone"]);
    },
    methods: {
        loadTrip(id) {
            if (id == null) return;

            API.execute_logged(API.ROUTE.TRAVELS.GET + id, API.METHOD.GET, User.CurrentUser.getCredentials()).then(res => {
                this.trip = res;

                this.startIndex = this.trip?.etapes.findIndex(step => step.city == this.tripStart.value);
                this.endIndex = this.trip?.etapes.findIndex(step => step.city == this.tripEnd.value);
                console.log(this.startIndex, this.endIndex)
            }).catch(err => {
                console.error(err);
                this.popup?.hide();
            });
        },
        log(msg, type = Log.INFO) {
            if (!this.logZone) return null;
            const log = new Log(msg, type);
            log.attachTo(this.logZone);
            return log;
        },
        bookTrip() {
            const log = this.log("Envoi de la demande ...", Log.INFO);

            API.execute_logged(API.ROUTE.BOOKINGS.CREATE, API.METHOD.POST, User.CurrentUser.getCredentials(), {
                travelId: this.trip.id,
                departureId: this.trip.etapes[this.startIndex].id,
                arrivalId: this.trip.etapes[this.endIndex].id,
            }).then(res => {
                log.update(res.message, Log.SUCCESS);
                setTimeout(() => { log.delete(); this.popup?.hide(); }, 4000);
            }).catch(err => {
                log.update(Lang.CurrentLang.ERROR + " : " + err.message, Log.ERROR);
                setTimeout(() => { log.delete(); }, 6000);
                console.error(err);
            });
        },
        setPopup(popup) {
            this.popup = popup;
        }
    },
};
</script>
