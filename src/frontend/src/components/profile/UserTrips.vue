<template>
    <div class="md:show-up flex flex-col grow max-w-full min-w-0">
        <p class="text-2xl text-teal-500 py-2 font-bold mx-auto">
            {{ lang.MY_TRIPS }}
        </p>

        <div class="flex grow h-fit flex-col space-y-4 md:mx-10 mx-2 min-w-0 max-w-full">
            <div class="flex flex-col w-full h-fit min-w-0">
                <p class="text-2xl text-slate-500 dark:text-slate-400 font-semibold"> {{ lang.FUTURE_TRIPS }} </p>
                <div class="flex grow h-fit md:p-4 py-4 px-2 min-w-0 max-w-full">
                    <div class="flex h-fit w-full space-x-4 overflow-x-auto min-w-0 max-w-full">
                        <future-trip-card
                            v-for="trip in futureTrips"
                            :key="trip.id"
                            :trip="trip"
                            @click="selectTrip(trip)"
                        />
                        <card-badge
                            v-show="futureState == 'loading'"
                            class="flex-grow"
                            :title="lang.LOADING_TRIPS"
                            :content="lang.LOADING_TRIPS_DESC"
                        />
                        <div
                            ref="pag-btn-future"
                            class="flex justify-center items-center p-2"
                        >
                            <button-block
                                class="flex justify-center items-center"
                                :class="showPagBtnFuture? '': ' hidden '"
                                :action="fetchNextFutureTrips"
                                :disabled="futureState == 'loading'"
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
                <p class="text-2xl text-slate-500 dark:text-slate-400 font-semibold"> {{ lang.PAST_TRIPS }} </p>
                <div class="flex grow h-fit p-4">
                    <div class="flex flex-col h-fit w-full space-y-4 justify-center items-center">
                        <past-trip-card
                            v-for="trip in pastTrips"
                            :key="trip.id"
                            :trip="trip"
                            @click="selectTrip(trip)"
                        />
                        <card-badge
                            v-show="pastState == 'loading'"
                            class="flex-grow"
                            :title="lang.LOADING_TRIPS"
                            :content="lang.LOADING_TRIPS_DESC"
                        />
                        <div
                            ref="pag-btn-past"
                            class="flex justify-center items-center p-2"
                        >
                            <button-block
                                class="flex justify-center items-center"
                                :class="showPagBtnPast? '': ' hidden '"
                                :action="fetchNextPastTrips"
                                :disabled="pastState == 'loading'"
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
            :cancel-label="lang.BACK"
            :show-validate="false"
        >
            <trip-detail
                :trip-start="null"
                :trip-end="null"
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
import CardBadge from '../cards/CardBadge.vue';

export default {
    name: "UserTrips",
    components: {
        FutureTripCard,
        PastTripCard,
        ButtonBlock,
        PlusIcon,
        CardPopup,
        TripDetail,
        CardBadge
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
            pastPagination: API.createPagination(0, 10),
            futureState: null,
            pastState: null,
        }
    },
    mounted() {
        Lang.AddCallback(lang => this.lang = lang);

        this.tripPreview = this.$refs["trip-view"];

        window.action = () => {
            this.futureTrips = [];
            this.pastTrips = [];
            this.futurePagination.offset = 0;
            this.pastPagination.offset = 0;
            this.fetchFutureTrips();
            this.fetchPastTrips();
        }
    },
    methods: {
        selectTrip(trip) {
            this.selectedTrip = trip;
            this.tripPreview?.show();
        },
        fetchTrips(type, array, pagination, showBtn) {
            return new Promise((resolve, reject) => {
                API.execute_logged(
                    API.ROUTE.TRAVELS.MY + pagination.toString() + "&type="+type,
                    API.METHOD.GET, User.CurrentUser.getCredentials()
                ).then(res => {
                    const list = res.data;
                    list.forEach(trip => {
                        if (!array.find(t => t.id === trip.id))
                            array.push(trip);
                    });
                    pagination.total = res.total ?? 0;
                    if (res.next !== null)
                        showBtn(true);
                    else showBtn(false);
                    resolve(res);
                }).catch(err => {
                    console.error(err);
                    reject(err);
                });
            });
        },
        fetchFutureTrips() {
            this.futureState = 'loading';
            this.fetchTrips("future", this.futureTrips, this.futurePagination, val => this.showPagBtnFuture = val)
                .then(res => this.futureState = 'done')
                .catch(err => this.futureState = 'error');
        },
        fetchPastTrips() {
            this.pastState = 'loading';
            this.fetchTrips("past", this.pastTrips, this.pastPagination, val => this.showPagBtnPast = val)
                .then(res => this.pastState = 'done')
                .catch(err => this.pastState = 'error');
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