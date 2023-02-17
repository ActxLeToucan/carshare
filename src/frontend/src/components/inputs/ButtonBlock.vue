<template>
    <router-link
        ref="btn"
        :to="href ?? ''"
        class="flex items-center justify-center w-fit h-fit py-2 px-4 text-slate-500 text-xl font-bold bg-slate-50 rounded-md bg-slate-100
               border-b-4 border-slate-200 hover:bg-teal-500 hover:text-slate-50 hover:shadow-md hover:border-teal-600 transition-all">
        <p class="whitespace-nowrap text-ellipsis max-w-full min-w-0 w-fit h-fit max-h-full min-h-0"> <slot></slot> </p>
    </router-link>
</template>

<script>
export default {
    name: 'ButtonBlock',
    props: {
        href: {
            type: String,
            default: '',
            required: false
        },
        action: {
            type: Function,
            default: () => {},
            required: false
        }
    },
    methods: {
        onClick() {
            if (this.href) return;
            this.action?.();
        }
    },
    mounted() {
        if (this.href) return;
        this.$refs["btn"].$el.addEventListener("click", this.onClick);
    }
}
</script>