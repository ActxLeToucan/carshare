<template>
    <div>
        <router-link v-if="href"
            ref="btn"
            :to="href ?? ''"
            class="flex items-center justify-center w-fit h-fit py-2 px-4 text-slate-500 text-xl font-bold bg-white rounded-md bg-slate-100 border-b-4 border-slate-200
                hover:bg-teal-500 hover:text-slate-50 hover:shadow-md hover:border-teal-600 transition-all">
            <p class="whitespace-nowrap text-ellipsis max-w-full min-w-0 w-fit h-fit max-h-full min-h-0"> <slot></slot> </p>
        </router-link>
        <button v-if="!href"
            ref="btn-2"
            class="flex items-center justify-center w-fit h-fit py-2 px-4 text-slate-500 text-xl font-bold bg-white rounded-md bg-slate-100 border-b-4 border-slate-200
                hover:bg-teal-500 hover:text-slate-50 hover:shadow-md hover:border-teal-600 transition-all">
            <p class="whitespace-nowrap text-ellipsis max-w-full min-w-0 w-fit h-fit max-h-full min-h-0"> <slot></slot> </p>
        </button>
    </div>
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
        },
        disabled: {
            type: [Boolean, String],
            default: false,
            required: false
        }
    },
    methods: {
        onClick() {
            if (this.href || this.disabled) return;
            this.action?.(this);
        }
    },
    mounted() {
        const el = this.href ? this.$refs["btn"].$el : this.$refs["btn-2"];
        if (this.disabled) {
            el.classList.remove("text-slate-500", "hover:bg-teal-500", "hover:text-slate-50", "hover:shadow-md", "hover:border-teal-600");
            el.classList.add("text-slate-400", "cursor-default");
        }

        el.addEventListener("click", this.onClick);
    }
}
</script>