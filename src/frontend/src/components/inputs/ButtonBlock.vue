<template>
    <div>
        <router-link
            v-if="href"
            ref="btn"
            :to="href ?? ''"
            class="flex items-center justify-center w-fit h-fit py-2 px-4 text-slate-500 dark:text-slate-300 text-xl font-bold bg-white dark:bg-slate-600 rounded-md bg-slate-100 border-b-4 border-slate-200 dark:border-slate-700
                outline-none hover:text-slate-50 hover:dark:text-slate-200 hover:shadow-md transition-all"
            :class="'hover:bg-'+color+'-500 hover:border-'+color+'-600  focus:border-'+color+'-500'"
        >
            <p class="whitespace-nowrap text-ellipsis max-w-full min-w-0 w-fit h-fit max-h-full min-h-0">
                <slot />
            </p>
        </router-link>
        <button
            v-if="!href"
            ref="btn-2"
            class="flex items-center justify-center w-fit h-fit py-2 px-4 text-slate-500 dark:text-slate-300 text-xl font-bold bg-white dark:bg-slate-600 rounded-md bg-slate-100 border-b-4 border-slate-200 dark:border-slate-700
                outline-none hover:text-slate-50 hover:dark:text-slate-200 hover:shadow-md transition-all"
            :class="'hover:bg-'+color+'-500 hover:border-'+color+'-600  focus:border-'+color+'-500'"
        >
            <p class="whitespace-nowrap text-ellipsis max-w-full min-w-0 w-fit h-fit max-h-full min-h-0">
                <slot />
            </p>
        </button>
        <!-- Just for tailwind to generate classes, not showing nor useful -->
        <span
            class="hidden
            hover:bg-teal-500 hover:bg-red-500 hover:bg-orange-500 hover:bg-blue-500 hover:bg-slate-500
            hover:border-teal-600 hover:border-red-600 hover:border-orange-600 hover:border-blue-600 hover:border-slate-600
            focus:border-teal-500 focus:border-red-500 focus:border-orange-500 focus:border-blue-500 focus:border-slate-500
            hover:dark:bg-teal-600 hover:dark:bg-red-600 hover:dark:bg-orange-600 hover:dark:bg-6lue-500 hover:dark:bg-slate-600
            hover:dark:border-teal-700 hover:dark:border-red-700 hover:dark:border-orange-700 hover:dark:border-blue-700 hover:dark:border-slate-700
            focus:dark:border-teal-600 focus:dark:border-red-600 focus:dark:border-orange-600 focus:dark:border-blue-600 focus:dark:border-slate-600"
        />
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
    watch: {
        disabled() {
            this.applyDisabled();
        }
    },
    mounted() {
        const el = this.href ? this.$refs["btn"].$el : this.$refs["btn-2"];
        this.applyDisabled();

        el.addEventListener("click", this.onClick);
    },
    methods: {
        onClick() {
            if (this.href || this.disabled) return;
            this.action?.(this);
        },
        applyDisabled() {
            const el = this.href ? this.$refs["btn"].$el : this.$refs["btn-2"];
            if (this.disabled) {
                el.classList.remove(
                    "text-slate-500", "hover:bg-"+this.color+"-500", "hover:text-slate-50", "hover:shadow-md",
                    "hover:border-"+this.color+"-600", "hover:dark:border-"+this.color+"-700", "focus:dark:border-"+this.color+"-600",
                    "hover:dark:bg-"+this.color+"-600", "hover:dark:text-slate-200"
                );
                el.classList.add("text-slate-400", "dark:text-slate-400", "cursor-default");
            } else {
                el.classList.remove("text-slate-400", "dark:text-slate-400", "cursor-default");
                el.classList.add(
                    "text-slate-500", "hover:bg-"+this.color+"-500", "hover:text-slate-50", "hover:shadow-md",
                    "hover:border-"+this.color+"-600", "hover:dark:border-"+this.color+"-700", "focus:dark:border-"+this.color+"-600",
                    "hover:dark:bg-"+this.color+"-600", "hover:dark:text-slate-200"
                );
            }
        }
    }
}
</script>