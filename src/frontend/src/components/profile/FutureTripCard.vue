<template>
    <button
        class="flex flex-col w-fit h-fit py-1 px-2 m-4 border-2 border-slate-200 dark:border-slate-600 rounded-md
               bg-slate-50 dark:bg-slate-700 hover:shadow-sm hover:border-slate-300 hover:dark:border-slate-500 transition-all space-y-2"
    >
        <div class="flex w-full justify-center">
            <p class="text-slate-500 dark:text-slate-200 text-lg font-bold whitespace-nowrap text-ellipsis overflow-hidden">
                {{ lang.TRAVEL_CARD_LABEL.replace('{DATE}', new Date(trip.departure?.date).toLocaleDateString()) }}
            </p>
        </div>
        <div class="flex flex-col grow">
            <div class="flex w-full justify-between space-x-8">
                <p class="text-slate-500 dark:text-slate-300 text-lg font-semibold whitespace-nowrap text-ellipsis overflow-hidden">
                    {{ trip.departure?.city }}
                </p>
                <p class="text-slate-400 dark:text-slate-400 text-lg font-semibold">
                    {{ new Date(trip.departure?.date).toLocaleTimeString().substring(0, 5) }}
                </p>
            </div>
            <div class="flex w-full justify-between space-x-8">
                <p class="text-slate-500 dark:text-slate-300 text-lg font-semibold whitespace-nowrap text-ellipsis overflow-hidden">
                    {{ trip.arrival?.city }}
                </p>
                <p class="text-slate-400 dark:text-slate-400 text-lg font-semibold">
                    {{ new Date(trip.arrival?.date).toLocaleTimeString().substring(0, 5) }}
                </p>
            </div>

            <div class="flex grow justify-end">
                <div class="flex w-full justify-between items-center space-x-8">
                    <p class="text-slate-500 dark:text-slate-300 text-lg font-bold">
                        {{ trip.passengers ? (trip.maxPassengers - trip.passengers) + " /" : "" }} {{ trip.maxPassengers }} {{ Number(trip.maxPassengers) > 1 ? lang.SLOTS: lang.SLOT }}
                    </p>
                    <p
                        v-show="trip.status == -1"
                        class="text-slate-300 dark:text-slate-500 text-base font-semibold"
                    >
                        {{ lang.CANCELED }}
                    </p>
                    <p
                        v-show="trip.status == 1"
                        class="text-slate-300 dark:text-slate-500 text-base font-semibold"
                    >
                        {{ lang.FINISHED }}
                    </p>
                </div>
            </div>
        </div>
    </button>
</template>

<script>
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