<template>
    <div class="md:show-up flex flex-col grow max-w-full min-w-0">
        <p class="text-2xl text-teal-500 py-2 font-bold mx-auto">
            {{ lang.MY_TRIPS }}
        </p>

        <div class="flex grow h-fit flex-col space-y-4 mx-10 min-w-0 max-w-full">
            <div class="flex flex-col w-full h-fit min-w-0">
                <p class="text-2xl text-slate-500 font-semibold"> {{ lang.FUTURE_TRIPS }} </p>
                <div class="flex grow h-fit p-4 min-w-0 max-w-full">
                    <div class="flex h-fit w-full space-x-4 overflow-x-auto min-w-0 max-w-full">
                        <future-trip-card
                            v-for="trip in futureTrips"
                            :key="trip.id"
                            :trip="trip"
                            @click="selectTrip(trip)"
                        />
                        <div
                            ref="pag-btn-future"
                            class="flex justify-center items-center p-2"
                        >
                            <button-block
                                class="flex justify-center items-center"
                                :class="showPagBtnFuture? '': ' hidden '"
                            >
                                <div class="flex justify-center items-center space-x-2">
                                    <plus-icon class="w-6 h-6 inline" />
                                    <p class="inline"> {{ lang.LOAD_MORE }} </p>
                                </div>
                            </button-block>
                        </div>
                    </div>
                </div>
            </div>

            <div class="flex flex-col w-full h-fit">
                <p class="text-2xl text-slate-500 font-semibold"> {{ lang.PAST_TRIPS }} </p>
                <div class="flex grow h-fit p-4">
                    <div class="flex flex-col h-fit w-full space-y-4 justify-center items-center">
                        <past-trip-card
                            v-for="trip in pastTrips"
                            :key="trip.id"
                            :trip="trip"
                            @click="selectTrip(trip)"
                        />
                        <div
                            ref="pag-btn-past"
                            class="flex justify-center items-center p-2"
                        >
                            <button-block
                                class="flex justify-center items-center"
                                :class="showPagBtnPast? '': ' hidden '"
                            >
                                <div class="flex justify-center items-center space-x-2">
                                    <plus-icon class="w-6 h-6 inline" />
                                    <p class="inline"> {{ lang.LOAD_MORE }} </p>
                                </div>
                            </button-block>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <popup
            ref="trip-view"
            title="UwU Popup trajet"
            content="OwO contenu"
            :cancel-label="lang.BACK"
            :show-validate="false"
        >
            <p class="text-lg text-slate-500 font-bold"> Snuggles and wuggles uwu ~~ </p>
        </popup>
    </div>
</template>

<script>
import Lang from '../../scripts/Lang';
import FutureTripCard from './FutureTripCard.vue';
import PastTripCard from './PastTripCard.vue';
import ButtonBlock from '../inputs/ButtonBlock.vue';
import Popup from '../cards/Popup.vue';

import {
    PlusIcon
} from '@heroicons/vue/24/outline';

export default {
    name: "UserTrips",
    components: {
        FutureTripCard,
        PastTripCard,
        ButtonBlock,
        PlusIcon,
        Popup
    },
    data() {
        return { lang: Lang.CurrentLang, futureTrips: [], pastTrips: [], showPagBtnFuture: false, showPagBtnPast: false }
    },
    mounted() {
        Lang.AddCallback(lang => this.lang = lang);

        this.tripPreview = this.$refs["trip-view"];
    },
    methods: {
        selectTrip(trip) {
            console.log("Selected trip : ", trip);
            this.tripPreview?.show();
        }
    }
}
</script>