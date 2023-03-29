<template>
    <div class="flex flex-col justify-center py-4 my-4 rounded-lg bg-slate-100 dark:bg-slate-700 px-4">
        <p class="text-xl text-center text-slate-500 dark:text-slate-300 font-bold mx-auto whitespace-nowrap text-ellipsis overflow-hidden max-w-full"> {{ title }} </p>
        <p ref="loading-desc" class="text-lg text-center text-slate-500 dark:text-slate-400 mx-auto whitespace-nowrap text-ellipsis overflow-hidden max-w-full"> {{ content }} </p>
    </div>
</template>

<script>
export default {
    name: 'Card',
    props: {
        title: {
            type: String,
            default: ''
        },
        content: {
            type: String,
            default: ''
        }
    },
    data() {
        return {}
    },
    methods: {
        
    }
}
</script>