<template>
    <div class="flex md:flex-row flex-col grow max-h-full min-h-0">
        <div
            ref="query-zone"
            class="flex flex-col items-center h-full md:w-min w-full px-8 py-4 space-y-4 md:border-r-8 border-teal-500 mx-auto overflow-hidden"
        >
            <p class="text-2xl text-teal-500 py-2 font-bold mx-auto">
                {{ lang.TRIPS }}
            </p>
             <p class="text-lg text-slate-500 pt-2 font-semibold mx-auto">
                    {{ lang.SEARCH_TRIP }}
            </p>
               <div class="flex max-w-full min-w-0 items-center space-x-2">
                <input-text
                    class="w-full flex grow"
                    placeholder="Rechercher"
                />
                <button-block
                    :action="search"
                    :disabled="!searchBar.buttonEnabled"
                >
                    <magnifying-glass-icon class="w-7 h-7" />
                </button-block>
            </div>
            <div
                    ref="search-log-zone"
                    class="flex flex-col w-full items-center h-fit overflow-hidden transition-all"
                    style="max-height: 0;"
            />
            <div class="flex grow w-full flex-col px-8 space-y-4 pt-4 max-w-full min-w-0">
                    <admin-trip-card
                        v-for="trip in trips"
                        :key="trip?.id"
                        class="min-w-0 w-full show-up"
                        :data="trip"
                        @click="selectTrip(trip)"
                        :onclick="onCardClicked"
                    />
            </div>
            <div class="flex w-full justify-evenly items-center mt-4">
                <button-block
                    :action="() => pagination.previous()"
                    :disabled="!pagination.hasPrevious"
                >
                    <chevron-left-icon class="w-8 h-8" />
                </button-block>
                <p class="text-xl font-bold text-slate-500">
                    {{ pagination.index + 1 }} / {{ pagination.maxIndex + 1 }}
                </p>
                <button-block
                    :action="() => pagination.next()"
                    :disabled="!pagination.hasNext"
                >
                    <chevron-right-icon class="w-8 h-8" />
                </button-block>
            </div>
        </div>
        <div
            ref="result-zone"
            class="flex flex-col grow overflow-scroll"
        >
            <button
                ref="backtabs-btn"
                class="absolute md:hidden flex rounded-md border-2 border-slate-200 bg-white h-fit w-fit p-2 m-4"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-8 h-8"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                </svg>
            </button>

            <div class="flex grow" />
        </div>
    </div>
</template>

<script>
import User from '../../scripts/User.js';
import API from '../../scripts/API.js';
import InputText from '../inputs/InputText.vue';
import ButtonBlock from '../inputs/ButtonBlock.vue';
import AdminTripCard from './AdminTripCard.vue';
import CardPopup from '../cards/CardPopup.vue';
import CardBadge from '../cards/CardBadge.vue';
import Card from '../cards/CardBorder.vue';
import { Log, LogZone } from '../../scripts/Logs.js';
import { genres, isPhoneNumber, levels } from '../../scripts/data';

import {
    MagnifyingGlassIcon,
     ChevronRightIcon,
    ChevronLeftIcon
} from '@heroicons/vue/24/outline';
import { getTypedValue } from '../../scripts/data.js';
import Lang from "../../scripts/Lang";
import re from "../../scripts/Regex";

export default {
    name: 'AdminTrips',
    components: {
       InputText,
        ButtonBlock,
        AdminTripCard,
        CardPopup,
        Card,
        CardBadge,
        MagnifyingGlassIcon,
        ChevronRightIcon,
        ChevronLeftIcon,
        selectedTrip: null,
    },
    data() {
        return {
            User, lang: Lang.CurrentLang,
            pagination: API.createPagination(0, 5),
            searchBar: {
                buttonEnabled: true,
            },
              trips: [],
        }
    },
    mounted() {
        Lang.AddCallback(lang => this.lang = lang);
    },
    methods: {
          selectTrip(trip) {
            this.selectedTrip = trip;
        },
        onCardClicked() {
            this.futurePagination.next();
            this.fetchFutureTrips();
        },


    }
}
</script>