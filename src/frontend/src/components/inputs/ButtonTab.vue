<template>
    <router-link
        ref="btn"
        :to="href ?? ''"
        class="flex items-center justify-center w-full h-fit py-2 px-4 text-slate-500 dark:text-slate-400 text-xl font-bold bg-white
               dark:bg-slate-700 rounded-md border-2 border-slate-200 dark:border-slate-600 transition-all">
        <p class="whitespace-nowrap text-ellipsis max-w-full min-w-0 w-fit h-fit max-h-full min-h-0"> <slot></slot> </p>
    </router-link>
</template>

<script>
export default {
    name: 'ButtonTab',
    props: {
        href: {
            type: String,
            default: '',
            required: false
        },
        default: {
            type: Boolean,
            default: false,
            required: false
        }
    },
    methods: {
        
    },
    mounted() {
        if (this.href == window.location.hash || (this.default && !window.location.hash)) {
            this.$refs["btn"].$el.classList.remove('bg-white', 'dark:bg-slate-700', 'text-slate-500', 'border-slate-200');
            this.$refs["btn"].$el.classList.add('bg-teal-500', 'dark:bg-teal-500', 'text-white', 'dark:text-slate-900', 'border-teal-600');
        }
    },
    watch: {
        '$route.hash': function (newVal, oldVal) {
            if (this.href == newVal || (this.default && !newVal)) {
                this.$refs["btn"].$el.classList.remove('bg-white', 'dark:bg-slate-700', 'text-slate-500', 'border-slate-200');
                this.$refs["btn"].$el.classList.add('bg-teal-500', 'dark:bg-teal-500', 'text-white', 'dark:text-slate-900', 'border-teal-600');
            } else {
                this.$refs["btn"].$el.classList.remove('bg-teal-500', 'dark:bg-teal-500', 'text-white', 'dark:text-slate-900', 'border-teal-600');
                this.$refs["btn"].$el.classList.add('bg-white', 'dark:bg-slate-700', 'text-slate-500', 'border-slate-200');
            }
        }
    }
}
</script>