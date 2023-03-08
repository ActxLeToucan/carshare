<template>
    <div class="flex md:flex-row flex-col grow max-h-full min-h-0">
        <div ref="query-zone" class="flex flex-col items-center h-full md:w-min w-full px-8 py-4 space-y-4 md:border-r-8 border-teal-500 mx-auto overflow-hidden">
            <p class="text-2xl text-teal-500 py-2 font-bold mx-auto"> {{ lang.GROUPS }} </p>
        </div>
        <div ref="result-zone" class="flex flex-col grow overflow-scroll">

            <button ref="backtabs-btn" class="absolute md:hidden flex rounded-md border-2 border-slate-200 bg-white h-fit w-fit p-2 m-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </button>

            <div class="flex grow">
                
            </div>
        </div>
    </div>
</template>

<script>
import User from '../../scripts/User.js';
import API from '../../scripts/API.js';
import ButtonTab from '../inputs/ButtonTab.vue';
import TabWindow from '../cards/TabWindow.vue';
import TabDiv from '../cards/TabDiv.vue';
import Lang from '../../scripts/Lang.js';

export default {
    name: 'AdminGroups',
    components: {
        ButtonTab,
        TabWindow,
        TabDiv
    },
    methods: {
        
    },
    data() {
        return { User, lang: Lang.CurrentLang }
    },
    mounted() {
        Lang.AddCallback(lang => this.lang = lang);
    }
}
</script>