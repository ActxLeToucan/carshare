<template>
    <div class="flex grow h-fit w-full min-w-0 flex-col justify-between my-2">
        <label v-if="label != ''" class="flex text-xl font-bold whitespace-nowrap text-ellipsis w-fit" :class="dark ? ' text-white' : ' text-slate-500 dark:text-slate-400'">
            {{ label }}
        </label>
        <textarea
            class="flex h-fit bg-white dark:bg-slate-600 border-b-4 border-slate-200 dark:border-slate-700 rounded-md px-4 py-2 font-bold text-lg max-w-full
                   hover:border-slate-300 transition-all focus:outline outline-transparent"
            :class="dark ? ' text-slate-600 placeholder-slate-400 focus:border-slate-500 ' : ' text-slate-600 placeholder-slate-600/[0.5]  focus:border-teal-500 '"
            :placeholder="placeholder"
            :type="type"
            :name="name"
            :value="value"
            :rows="isMobile? '2': '3'"
        ></textarea>
    </div>
</template>

<script>
export default {
    name: '',
    props: {
        label: {
            type: String,
            default: '',
            required: false
        },
        placeholder: {
            type: String,
            default: '',
            required: false
        },
        value: {
            type: String,
            default: '',
            required: false
        },
        name: {
            type: String,
            default: '',
            required: false
        },
        type: {
            type: String,
            default: 'text',
            required: false
        },
        dark: {
            type: [Boolean, String],
            default: false,
            required: false
        },
    },
    data() {
        return {isMobile: window.innerWidth < 768}
    }
}
</script>