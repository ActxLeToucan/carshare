<template>
    <div>
        <router-link v-if="href"
            ref="btn"
            :to="href ?? ''"
            class="flex items-center justify-center w-fit h-fit py-2 px-4 text-slate-500 text-xl font-bold bg-white rounded-md bg-slate-100 border-b-4 border-slate-200
                hover:text-slate-50 hover:shadow-md transition-all"
            :class="'hover:bg-'+color+'-500 hover:border-'+color+'-600'">
            <p class="whitespace-nowrap text-ellipsis max-w-full min-w-0 w-fit h-fit max-h-full min-h-0"> <slot></slot> </p>
        </router-link>
        <button v-if="!href"
            ref="btn-2"
            class="flex items-center justify-center w-fit h-fit py-2 px-4 text-slate-500 text-xl font-bold bg-white rounded-md bg-slate-100 border-b-4 border-slate-200
                hover:text-slate-50 hover:shadow-md transition-all"
            :class="'hover:bg-'+color+'-500 hover:border-'+color+'-600'">
            <p class="whitespace-nowrap text-ellipsis max-w-full min-w-0 w-fit h-fit max-h-full min-h-0"> <slot></slot> </p>
        </button>
        <!-- Just for tailwind to generate classes, not showing nor useful -->
        <span class="hidden hover:bg-teal-500 hover:bg-red-500 hover:bg-orange-500 hover:bg-blue-500 hover:bg-slate-500 hover:border-teal-600 hover:border-red-600 hover:border-orange-600 hover:border-blue-600 hover:border-slate-600"></span>
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
        },
        color: {
            type: String,
            default: 'teal',
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