<template>
    <router-link
        ref="btn"
        :to="href ?? ''"
        class="flex items-center justify-center w-full h-fit py-2 px-4 text-slate-500 text-xl font-bold bg-white rounded-md bg-white
               border-2 border-slate-200 transition-all">
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
            this.$refs["btn"].$el.classList.remove('bg-white', 'text-slate-500', 'border-slate-200');
            this.$refs["btn"].$el.classList.add('bg-teal-500', 'text-white', 'border-teal-600');
        }
    },
    watch: {
        '$route.hash': function (newVal, oldVal) {
            if (this.href == newVal || (this.default && !newVal)) {
                this.$refs["btn"].$el.classList.remove('bg-white', 'text-slate-500', 'border-slate-200');
                this.$refs["btn"].$el.classList.add('bg-teal-500', 'text-white', 'border-teal-600');
            } else {
                this.$refs["btn"].$el.classList.remove('bg-teal-500', 'text-white', 'border-teal-600');
                this.$refs["btn"].$el.classList.add('bg-white', 'text-slate-500', 'border-slate-200');
            }
        }
    }
}
</script>