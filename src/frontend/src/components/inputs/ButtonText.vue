<template>
    <router-link
        ref="btn"
        :to="href ?? ''"
        class="flex items-center justify-center w-fit h-fit py-2 px-4 text-slate-500 text-xl font-bold bg-slate-50 rounded-md
               border-b-4 border-transparent hover:bg-slate-100 hover:border-slate-200 hover:text-teal-500 transition-all">
        <p class="whitespace-nowrap text-ellipsis max-w-full min-w-0 w-fit h-fit max-h-full min-h-0"> <slot></slot> </p>
    </router-link>
</template>

<script>
export default {
    name: 'ButtonText',
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
        },
        disabled: {
            type: [Boolean, String],
            default: false,
            required: false
        }
    },
    methods: {
        onClick() {
            if (this.href) return;
            this.action?.(this);
        }
    },
    mounted() {
        const el = this.$refs["btn"].$el;
        if (this.disabled) {
            el.classList.remove("text-slate-500", "hover:bg-slate-100", "hover:text-teal-500", "hover:border-slate-200");
            el.classList.add("text-slate-400", "cursor-default");
        }

        if (this.href) return;
        this.$refs["btn"].$el.addEventListener("click", this.onClick);
    }
}
</script>