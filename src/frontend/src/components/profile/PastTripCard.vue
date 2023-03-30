<template>
    <button
        class="flex w-full h-fit py-1 px-2 border-2 border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 max-w-[80em]
               hover:shadow-sm hover:border-slate-300 hover:dark:border-slate-500 transition-all space-x-8"
    >
        <div class="flex w-[15%] min-w-0">
            <p class="text-slate-500 dark:text-slate-200 text-lg font-bold whitespace-nowrap text-ellipsis overflow-hidden">
                {{ new Date(trip.departure?.date).toLocaleDateString() }}
            </p>
        </div>
        <div class="flex grow w-full space-x-4 min-w-0">
            <div class="flex grow space-x-12 justify-evenly min-w-0">
                <div class="flex w-fit justify-between space-x-2 w-[30%] min-w-0">
                    <p class="text-slate-400 dark:text-slate-400 text-lg font-semibold">
                        {{ new Date(trip.departure?.date).toLocaleTimeString().substring(0, 5) }}
                    </p>
                    <span class="flex grow bg-slate-200 dark:bg-slate-600 rounded-lg h-1 m-auto" />
                    <p class="text-slate-500 dark:text-slate-300 text-lg font-semibold whitespace-nowrap text-ellipsis overflow-hidden">
                        {{ trip.departure?.city }}
                    </p>
                </div>
                <div class="flex w-fit justify-between space-x-2 w-[30%] min-w-0">
                    <p class="text-slate-400 dark:text-slate-400 text-lg font-semibold">
                        {{ new Date(trip.arrival?.date).toLocaleTimeString().substring(0, 5) }}
                    </p>
                    <span class="flex grow bg-slate-200 dark:bg-slate-600 rounded-lg h-1 m-auto" />
                    <p class="text-slate-500 dark:text-slate-300 text-lg font-semibold whitespace-nowrap text-ellipsis overflow-hidden">
                        {{ trip.arrival?.city }}
                    </p>
                </div>
            </div>
        </div>
        <div class="flex w-[15%] min-w-0 justify-end">
            <p class="text-slate-500 dark:text-slate-300 text-lg font-bold whitespace-nowrap text-ellipsis overflow-hidden">
                {{ trip.passengers ? (trip.maxPassengers - trip.passengers) + " /" : "" }} {{ trip.maxPassengers }} {{ Number(trip.maxPassengers) > 1 ? lang.SLOTS: lang.SLOT }}
            </p>
        </div>
    </button>
</template>

<script>

import {
    UserIcon
} from '@heroicons/vue/24/outline';
import Lang from '../../scripts/Lang.js';

export default {
    name: "TripCard",
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