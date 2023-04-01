<template>
    <div class="md:show-up flex flex-col grow max-w-full min-w-0">
        <p class="text-2xl text-teal-500 py-2 font-bold mx-auto">
            {{ lang.MY_TRIPS }}
        </p>

        <div class="flex grow h-fit flex-col space-y-4 md:mx-10 mx-2 min-w-0 max-w-full">
            <div class="flex flex-col w-full h-fit min-w-0">
<<<<<<< HEAD
                <p class="text-2xl text-slate-500 dark:text-slate-400 font-semibold"> {{ lang.FUTURE_TRIPS }} </p>
                <div class="flex grow h-fit md:p-4 py-4 px-2 min-w-0 max-w-full">
=======
<<<<<<< src/frontend/src/components/profile/UserTrips.vue
                <p class="text-2xl text-slate-500 font-semibold"> {{ lang.FUTURE_TRIPS }} </p>
=======
                <p class="text-2xl text-slate-500 dark:text-slate-400 font-semibold"> {{ lang.FUTURE_TRIPS }} </p>
>>>>>>> src/frontend/src/components/profile/UserTrips.vue
                <div class="flex grow h-fit p-4 min-w-0 max-w-full">
>>>>>>> e9a7b00f12f34838e1f7f3198c188c9e88cdfc79
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
                                :action="fetchNextFutureTrips"
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
<<<<<<< HEAD
                <p class="text-2xl text-slate-500 dark:text-slate-400 font-semibold"> {{ lang.PAST_TRIPS }} </p>
=======
<<<<<<< src/frontend/src/components/profile/UserTrips.vue
                <p class="text-2xl text-slate-500 font-semibold"> {{ lang.PAST_TRIPS }} </p>
=======
                <p class="text-2xl text-slate-500 dark:text-slate-400 font-semibold"> {{ lang.PAST_TRIPS }} </p>
>>>>>>> src/frontend/src/components/profile/UserTrips.vue
>>>>>>> e9a7b00f12f34838e1f7f3198c188c9e88cdfc79
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
                                :action="fetchNextPastTrips"
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
        <card-popup
            ref="trip-view"
            :title="lang.TRAVEL_CARD_LABEL.replace('{DATE}', new Date(selectedTrip?.departure?.date).toLocaleDateString())"
            :cancel-label="lang.BACK"
            :show-validate="false"
        >
            <trip-detail
<<<<<<< HEAD
                :trip-start="null"
                :trip-end="null"
=======
<<<<<<< src/frontend/src/components/profile/UserTrips.vue
                :trip-start="selectedTrip?.departure"
                :trip-end="selectedTrip?.arrival"
=======
                :trip-start="null"
                :trip-end="null"
>>>>>>> src/frontend/src/components/profile/UserTrips.vue
>>>>>>> e9a7b00f12f34838e1f7f3198c188c9e88cdfc79
                :trip-id="selectedTrip?.id ?? null"
                :edit-mode="true"
            />
        </card-popup>
    </div>
</template>

<script>
import Lang from '../../scripts/Lang';
import FutureTripCard from './FutureTripCard.vue';
import PastTripCard from './PastTripCard.vue';
import ButtonBlock from '../inputs/ButtonBlock.vue';
import CardPopup from '../cards/CardPopup.vue';
import TripDetail from '../cards/TripDetail.vue';

import {
    PlusIcon
} from '@heroicons/vue/24/outline';
import API from '../../scripts/API';
import User from '../../scripts/User';

export default {
    name: "UserTrips",
    components: {
        FutureTripCard,
        PastTripCard,
        ButtonBlock,
        PlusIcon,
        CardPopup,
        TripDetail
    },
    data() {
        return {
            lang: Lang.CurrentLang,
            futureTrips: [],
            pastTrips: [],
            showPagBtnFuture: false,
            showPagBtnPast: false,
            selectedTrip: null,
            futurePagination: API.createPagination(0, 10),
            pastPagination: API.createPagination(0, 10)
        }
    },
    mounted() {
        Lang.AddCallback(lang => this.lang = lang);

        this.tripPreview = this.$refs["trip-view"];

        this.fetchFutureTrips();
        this.fetchPastTrips();
    },
    methods: {
        selectTrip(trip) {
            this.selectedTrip = trip;
<<<<<<< HEAD
            this.tripPreview?.setTitle(Lang.CurrentLang.TRAVEL_CARD_LABEL.replace('{DATE}', new Date(this.selectedTrip?.departure?.date).toLocaleDateString()));
=======
<<<<<<< src/frontend/src/components/profile/UserTrips.vue
=======
            this.tripPreview?.setTitle(Lang.CurrentLang.TRAVEL_CARD_LABEL.replace('{DATE}', new Date(this.selectedTrip?.departure?.date).toLocaleDateString()));
>>>>>>> src/frontend/src/components/profile/UserTrips.vue
>>>>>>> e9a7b00f12f34838e1f7f3198c188c9e88cdfc79
            this.tripPreview?.show();
        },
        fetchFutureTrips() {
            API.execute_logged(
                API.ROUTE.TRAVELS.MY + this.futurePagination.toString() + "&type=future",
                API.METHOD.GET, User.CurrentUser.getCredentials()
            ).then(res => {
                const list = res.data;
                list.forEach(trip => {
                    if (!this.futureTrips.find(t => t.id === trip.id))
                        this.futureTrips.push(trip);
                });
                this.futurePagination.total = res.total ?? 0;
                if (res.next !== null)
                    this.showPagBtnFuture = true;
                else this.showPagBtnFuture = false;
            }).catch(err => {
                console.error(err);
            });
        },
        fetchPastTrips() {
            API.execute_logged(
                API.ROUTE.TRAVELS.MY + this.pastPagination.toString() + "&type=past",
                API.METHOD.GET, User.CurrentUser.getCredentials()
            ).then(res => {
                const list = res.data;
                list.forEach(trip => {
                    if (!this.pastTrips.find(t => t.id === trip.id))
                        this.pastTrips.push(trip);
                });
                this.pastPagination.total = res.total ?? 0;
                if (res.next !== null)
                    this.showPagBtnPast = true;
                else this.showPagBtnPast = false;
            }).catch(err => {
                console.error(err);
            });
        },
        fetchNextPastTrips() {
            this.pastPagination.next();
            this.fetchPastTrips();
        },
        fetchNextFutureTrips() {
            this.futurePagination.next();
            this.fetchFutureTrips();
        }
    }
}
</script>