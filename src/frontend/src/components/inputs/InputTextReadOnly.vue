<template>
    <div class="flex grow h-fit w-full md:flex-row min-w-0 flex-col justify-between md:space-x-8 md:items-center my-2">
        <label
            v-if="label != ''"
            class="flex text-xl dark:text-slate-400 font-bold whitespace-nowrap text-ellipsis w-fit"
            :class="dark ? ' text-white' : ' text-slate-500'"
        >
            {{ label }}
        </label>
        <input
            class="flex h-fit bg-white dark:bg-slate-600 border-b-4 border-slate-200 dark:border-slate-700 rounded-md px-4 py-2 font-bold text-lg whitespace-nowrap max-w-full min-w-0
                   text-slate-500 dark:text-slate-200 text-ellipsis hover:border-slate-300 transition-all focus:outline outline-transparent"
            :class="dark ? ' text-slate-600 placeholder-slate-400 focus:border-slate-500 ' : ' text-slate-600 placeholder-slate-600/[0.5]  focus:border-teal-500 '"
            :placeholder="placeholder"
            :type="type"
            :name="name"
            :value="value"
            :min="min"
            :max="max"
            readonly
        >
    </div>
</template>

<script>
export default {
    name: 'InputTextReadOnly',
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
        min: {
            type: [Number, String],
            default: "",
            required: false
        },
        max: {
            type: [Number, String],
            default: "",
            required: false
        },
    },
    data() {
        return {}
    }
}
</script>