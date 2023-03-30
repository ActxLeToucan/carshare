<template>
    <div class="flex h-fit w-full justify-between md:space-x-8 items-center my-2">
        <label class="flex text-xl text-slate-500 dark:text-slate-400 font-bold whitespace-nowrap text-ellipsis w-fit">
            {{ label }}
        </label>
        <div class="flex grow h-fit justify-end items-center">
            <button
                ref="switch"
                class="flex rounded-md bg-slate-200 dark:bg-slate-700 w-12 h-fit cursor-pointer transition-all"
            >
                <div class="flex bg-white dark:bg-slate-500 rounded h-6 w-6 translate-x-0 transition-all border border-b-4 border-slate-300 dark:border-slate-600" />
            </button>
        </div>
        <input
            ref="checkbox"
            type="checkbox"
            :name="name"
            class="hidden"
        >
    </div>
</template>

<script>
export default {
    name: 'InputSwitch',
    props: {
        label: {
            type: String,
            default: '',
            required: false
        },
        value: {
            type: [String, Boolean, Number],
            default: false,
            required: false
        },
        name: {
            type: String,
            default: "",
            required: false
        },
        onchange: {
            type: Function,
            default: () => { },
            required: false
        }
    },
    data() {
        if (this.value != undefined) {
            switch (typeof this.value) {
            case "string": this.state = this.value === "true"; break;
            case "boolean": this.state = this.value; break;
            default: this.state = false; break;
            }
        }
        return {};
    },
    watch: {
        value: function (val) {
            this.applyValue(val, false);
        }
    },
    mounted() {
        this.$refs["switch"].addEventListener("click", ev => {
            this.applyValue(!this.state);
        });
        this.updateButton();
        this.applyValue(this.value, false);
    },
    methods: {
        updateButton() {
            const btn = this.$refs["switch"];
            const checkbox = this.$refs["checkbox"];
            const dot = btn.firstElementChild;

            if (!this.state) {
                dot.classList.remove("translate-x-6");
                dot.classList.add("translate-x-0");
                btn.classList.remove("bg-teal-500", "dark:bg-teal-500");
                btn.classList.add("bg-slate-200", "dark:bg-slate-700");
            } else {
                dot.classList.remove("translate-x-0");
                dot.classList.add("translate-x-6");
                btn.classList.remove("bg-slate-200", "dark:bg-slate-700");
                btn.classList.add("bg-teal-500", "dark:bg-teal-500");
            }

            checkbox.checked = this.state;
        },
        applyValue(val, sendEvent = true) {
            switch (typeof val) {
            case "string": this.state = val === "true"; break;
            case "number": this.state = val > 0; break;
            case "boolean": this.state = val; break;
            default: this.state = false; break;
            }
            this.updateButton();
            if (sendEvent) this.onchange?.(this.state);
        }
    }
}
</script>