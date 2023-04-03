<template>
    <div class="relative flex flex-col justify-center p-4 rounded-lg bg-slate-100 dark:bg-slate-700">
        <slot />
        <p
            class="text-xl text-center text-slate-500 dark:text-slate-300 font-bold mx-auto max-w-full"
            :class="newline? '' : 'whitespace-nowrap text-ellipsis overflow-hidden'"
        >
            {{ title }}
        </p>
        <p
            class="text-lg text-center text-slate-500 dark:text-slate-400 mx-auto max-w-full"
            :class="newline? '' : 'whitespace-nowrap text-ellipsis overflow-hidden'"
        >
            {{ content }}
        </p>
    </div>
</template>

<script>
export default {
    name: 'CardBadge',
    props: {
        title: {
            type: String,
            default: ''
        },
        content: {
            type: String,
            default: ''
        },
        newline: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {}
    },
    methods: {
        
    }
}
</script>