<template>
    <div>
        <div
            v-if="trip != null"
            class="flex md:flex-row flex-col grow min-w-[42em] max-w-[80vw] max-h-full min-h-0 space-y-4 items-center"
        >
            <div class="flex grow flex-col md:w-[50%] w-full justify-center items-center md:pr-4 space-y-4">
                <p class="text-xl text-slate-600 font-bold whitespace-nowrap text-ellipsis overflow-hidden py-2"> Chemin parcouru </p>
                <div class="flex flex-col grow h-fit w-fit space-y-2 w-full overflow-y-auto">
                    <div
                        v-for="step in trip.etapes"
                        :key="step.id"
                        class="flex h-fit w-full justify-between items-center space-x-10 rounded-md bg-white border-2 border-slate-200 py-1 px-2"
                    >
                        <p class="text-xl text-slate-500 font-bold whitespace-nowrap text-ellipsis overflow-hidden"> {{ step.city }} </p>
                        <p class="text-lg text-slate-400 font-semibold whitespace-nowrap"> {{ new Date(step.date).toLocaleTimeString().substring(0, 5) }} </p>
                    </div>
                </div>
                <div class="flex flex-col grow rounded-lg bg-slate-200 border-2 border-slate-200 w-full">
                    <p class="text-xl text-slate-600 font-bold mx-2 mb-1"> {{ lang.TRIP_INFO }} </p>
                    <div class="flex grow rounded-md bg-white p-2">
                        <p class="text-lg text-slate-500 font-semibold text-ellipsis overflow-hidden"> {{ trip.description }} </p>
                    </div>
                </div>
            </div>
            <span class="hidden md:flex grow h-40 w-1 bg-slate-200 rounded-md my-auto"></span>
            <div class="flex grow flex-col md:w-[50%] w-full justify-center items-center md:pl-4 space-y-4">
                
                <div class="flex flex-col h-50% w-full">

                    <p class="text-xl text-slate-600 font-bold mx-2 mb-1 mr-auto"> {{ lang.PASSENGERS }} </p>
                    <div class="bg-white rounded-md border-2 border-slate-200 p-2 w-full min-h-[8em]">


                    </div>

                </div>

                <div class="flex h-50% w-full">
                    <div class="flex w-[50%] justify-evenly items-center">
                        <div class="flex flex-col">
                            <p class="text-xl text-slate-600 font-bold mx-2 mb-1 mx-auto text-center"> Conducteur </p>
                            <div class="flex flex-col justify-center items-center m-2 h-20 w-20 items-center bg-white rounded-md mx-auto">
                                <div class="flex w-14 h-14 p-2 mx-auto">
                                    <user-icon class="w-full text-slate-500" />
                                </div>
                                <p class="text-slate-500 text-lg font-semibold">
                                    {{ trip.driver.firstName + " " + trip.driver.lastName.substring(0, 1) + "." }}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="flex w-[50%] justify-evenly items-center">
                        <div class="flex flex-col">
                            <p class="text-xl text-slate-600 font-bold mx-2 mb-1 mx-auto text-center"> Prix </p>
                            <div class="flex flex-col justify-center items-center m-2 h-20 w-20 items-center bg-white rounded-md mx-auto">
                                <p class="text-slate-500 text-2xl font-bold">
                                    {{ trip.price + " €" }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="flex w-full justify-center items-center mt-4">
            <button-block> Postuler </button-block>
        </div>
    </div>
</template>

<script>
import API from '../../scripts/API';
import Lang from "../../scripts/Lang";
import User from "../../scripts/User";
import ButtonBlock from "../inputs/ButtonBlock.vue";

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
        }
    },
    data() {
        return { User, lang: Lang.CurrentLang, trip: null };
    },
    watch: {
        tripId: function (newVal, oldVal) {
            console.log(newVal);
            this.loadTrip(newVal);
        },
    },
    mounted() {
        Lang.AddCallback((lang) => (this.lang = lang));
        this.loadTrip(this.id);
    },
    methods: {
        loadTrip(id) {
            if (id == null) return;

            API.execute_logged(API.ROUTE.TRAVELS.GET + id, API.METHOD.GET, User.CurrentUser.getCredentials()).then(res => {
                console.log(res);
                this.trip = res;
            }).catch(err => {
                console.error(err);
            });
        }
    },
};
</script>
