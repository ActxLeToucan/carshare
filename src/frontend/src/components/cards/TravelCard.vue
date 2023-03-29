<template>
    <button
        class="flex flex-col w-fit h-fit py-1 px-2 m-4 border-2 border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700
                   hover:shadow-md hover:border-slate-300 hover:dark:border-slate-500 hover:-translate-y-1 transition-all space-y-2"
    >
        <div class="flex w-full justify-center">
            <p class="text-slate-500 dark:text-slate-200 text-lg font-bold">
                {{ lang.TRAVEL_CARD_LABEL.replace('{DATE}', trip.date) }}
            </p>
        </div>
        <div class="flex grow w-full space-x-4">
            <div class="flex flex-col grow">
                <div class="flex w-full justify-between space-x-8">
                    <p class="text-slate-500 dark:text-slate-300 text-lg font-semibold">
                        {{ lang.STARTING_POINT.replace(trip.startCity) }}
                    </p>
                    <p class="text-slate-500 dark:text-slate-300 text-lg font-semibold">
                        {{ lang.HOUR.replace(trip.startTime) }}
                    </p>
                </div>
                <div class="flex w-full justify-between space-x-8">
                    <p class="text-slate-500 dark:text-slate-300 text-lg font-semibold">
                        {{ lang.ENDING_POINT.replace(trip.endCity) }}
                    </p>
                    <p class="text-slate-500 dark:text-slate-300 text-lg font-semibold">
                        {{ lang.HOUR.replace(trip.endTime) }}
                    </p>
                </div>
                <div class="flex w-full justify-between space-x-8">
                    <p class="text-slate-500 dark:text-slate-300 text-lg font-semibold">
                        {{ lang.PASSENGER }}
                    </p>
                </div>

                <div class="flex grow justify-end">
                    <div class="flex w-full justify-between">
                        <p class="text-slate-500 dark:text-slate-300 text-lg font-bold">
                            {{ trip.price }} €
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </button>
</template>

<script>

import {
    
} from '@heroicons/vue/24/outline';
import Lang from '../../scripts/Lang.js';

export default {
    name: "TravelCard",
    components: {
       
    },
    props: {
        trip: {
            type: Object,
            required: true
        }
    },
    data() {
        return { lang: Lang.CurrentLang }
    },
    mounted() {
        
    },
    methods: {
        
    }
}
</script>