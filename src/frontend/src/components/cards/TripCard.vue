<template>
    <button
        class="flex flex-col w-fit h-fit py-1 px-2 m-4 border-2 border-slate-200 rounded-md bg-slate-50
                   hover:shadow-md hover:border-slate-300 hover:-translate-y-1 transition-all space-y-2"
    >
        <div class="flex w-full justify-center">
            <p class="text-slate-500 text-lg font-bold">
                {{ lang.TRAVEL_CARD_LABEL.replace('{DATE}', trip.date) }}
            </p>
        </div>
        <div class="flex grow w-full space-x-4">
            <div class="flex flex-col w-fit justify-center">
                <div class="flex w-14 h-14 p-2 mx-auto">
                    <user-icon class="w-full text-slate-500" />
                </div>
                <p class="text-slate-500 text-lg font-semibold">
                    {{ trip.author }}
                </p>
            </div>
            <span class="flex grow h-14 my-auto w-1 bg-slate-200 rounded-md" />
            <div class="flex flex-col grow">
                <div class="flex w-full justify-between space-x-8">
                    <p class="text-slate-500 text-lg font-semibold">
                        {{ trip.startCity }}
                    </p>
                    <p class="text-slate-400 text-lg font-semibold">
                        {{ trip.startTime }}
                    </p>
                </div>
                <div class="flex w-full justify-between space-x-8">
                    <p class="text-slate-500 text-lg font-semibold">
                        {{ trip.endCity }}
                    </p>
                    <p class="text-slate-400 text-lg font-semibold">
                        {{ trip.endTime }}
                    </p>
                </div>

                <div class="flex grow justify-end">
                    <div class="flex w-full justify-between">
                        <p class="text-slate-500 text-lg font-bold">
                            {{ trip.slots }} {{ trip.slots > 1 ? lang.SLOTS: lang.SLOT }}
                        </p>
                        <p class="text-slate-500 text-lg font-bold">
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
    UserIcon
} from '@heroicons/vue/24/outline';
import Lang from '../../scripts/Lang.js';

export default {
    name: "TripCard",
    components: {
        UserIcon
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
        console.log("trip: ", this.trip);
    },
    methods: {
        
    }
}
</script>