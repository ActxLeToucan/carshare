<template>
    <div
        class="flex flex-col justify-center rounded-md border-2 border-slate-500 dark:border-slate-500 shadow-md p-2 space-y-2
                   bg-slate-50 dark:bg-slate-600 hover:bg-white hover:border-teal-500 transition-all cursor-pointer"
            @click="() => { onclick(data); }"
    >
        <p class="text-xl font-semibold text-slate-700 dark:text-slate-200 text-left whitespace-nowrap text-ellipsis overflow-hidden">
            {{ data.name }}
        </p>
         <p class="text-xl font-semibold text-slate-500 dark:text-slate-400 text-left whitespace-nowrap text-ellipsis overflow-hidden">
                {{ data.users.length}}  {{ data.users.length >= 2 ?  lang.MEMBERS : lang.MEMBER }}
        </p>
    </div>
</template>

<script>
import Lang from '../../scripts/Lang';
export default {
    name: 'AdminGroupCard',
    props: {
        data: {
            type: Object,
            default: {},
            required: true
        },
        onclick: {
            type: Function,
            default: () => { },
            required: false
        }
    },
    data() {
        return {
            lang: Lang.CurrentLang,
        }
    },
    methods: {

    },
    mounted() {
         Lang.AddCallback(lang => this.lang = lang);
    }
}
</script>