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
            class="flex h-fit border-b-4 rounded-md px-4 py-2 border-slate-200 dark:border-slate-700 font-bold text-lg whitespace-nowrap max-w-full
                   min-w-0 text-ellipsis transition-all focus:border-teal-500 focus:dark:border-teal-500 focus:outline outline-transparent"
            :class="(dark ? ' text-slate-600 placeholder-slate-400 ' : ' text-slate-600 placeholder-slate-600/[0.5] ') + (isDisabled? ' bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-300 ' : ' bg-white dark:bg-slate-600 text-slate-400 dark:text-slate-200 hover:border-slate-300 hover:dark:border-slate-500 ')"
            :placeholder="placeholder"
            :type="type"
            :name="name"
            :value="value"
            :min="min"
            :max="max"
            :disabled="isDisabled"
        >
    </div>
</template>

<script>
export default {
    name: 'InputText',
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
        disabled: {
            type: [Boolean, String],
            default: false,
            required: false
        }
    },
    data() {
        return {isDisabled: true}
    },
    mounted() {
        this.isDisabled = (this.disabled == 'true' || this.disabled == true)
    }
}
</script>