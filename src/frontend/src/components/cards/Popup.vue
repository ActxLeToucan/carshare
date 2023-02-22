<template>
    <div class="absolute top-0 left-0 w-screen h-screen flex justify-center items-center bg-slate-900/[0.3] opacity-0 pointer-events-none transition-all">
        <div ref="popup" class="flex flex-col rounded-lg shadow-lg border-4 border-slate-200 bg-slate-50 p-4 space-y-4">
            <h1 class="text-xl font-bold text-teal-500 text-center"> {{ title }} </h1>
            <div class="flex flex-col">
                <p v-for="line in content.split('\\n')" :key="line" class="text-lg font-semibold text-slate-500"> {{ line }} </p>
            </div>
            <div
                ref="log-zone"
                class="flex flex-col w-full items-center h-fit overflow-hidden transition-all"
                style="max-height: 0px;"
            ></div>
            <span class="flex grow h-1 w-full bg-slate-200 rounded-lg mb-4 mt-2"></span>
            <div class="flex justify-between">
                <button-text ref="btn-cancel"> {{ cancelLabel }} </button-text>
                <button-block ref="btn-validate"> {{ validateLabel }} </button-block>
            </div>
        </div>
    </div>
</template>

<script>
import { Log, LogZone } from '../../scripts/Logs';
import { executeAfter } from '../../scripts/Promises';
import ButtonBlock from '../inputs/ButtonBlock.vue';
import ButtonText from '../inputs/ButtonText.vue';

export default {
    name: 'Popup',
    components: {
        ButtonBlock,
        ButtonText
    },
    props: {
        title: {
            type: String,
            default: '',
            required: false
        },
        content: {
            type: String,
            default: '',
            required: false
        },
        cancelLabel: {
            type: String,
            default: 'Annuler',
            required: false
        },
        validateLabel: {
            type: String,
            default: 'Valider',
            required: false
        },
        oncancel: {
            type: Function,
            default: () => true,
            required: false
        },
        onvalidate: {
            type: Function,
            default: () => true,
            required: false
        },
        onload: {
            type: Function,
            default: () => {},
            required: false
        }
    },
    data() {
        return {}
    },
    methods: {
        show() {
            return new Promise((resolve, reject) => {
                this.$el.classList.add("opacity-1");
                this.$el.classList.add("pointer-events-all");
                this.$el.classList.remove("pointer-events-none");
                this.$el.classList.remove("opacity-0");
                this.$refs["popup"].classList.add("show-up");
                this.$refs["popup"].classList.remove("hide-down");
                setTimeout(resolve, 250);
            });
        },
        hide() {
            return new Promise((resolve, reject) => {
                this.$el.classList.add("opacity-0");
                this.$el.classList.add("pointer-events-none");
                this.$el.classList.remove("pointer-events-all");
                this.$el.classList.remove("opacity-1");
                this.$refs["popup"].classList.add("hide-down");
                this.$refs["popup"].classList.remove("show-up");
                setTimeout(resolve, 250);
            });
        },
        log(msg, type = Log.INFO) {
            if (!this.logZone) return null;
            const log = new Log(msg, type);
            log.attachTo(this.logZone);
            return log;
        }
    },
    mounted() {
        this.$refs["btn-cancel"].$el.addEventListener("click", () => {
            executeAfter(
                this.oncancel?.(this),
                res => {
                    if (res) this.hide();
                }
            );
        });
        this.$refs["btn-validate"].$el.addEventListener("click", () => {
            executeAfter(
                this.onvalidate?.(this),
                res => {
                    if (res) this.hide();
                }
            );
        });

        this.logZone = new LogZone(this.$refs["log-zone"]);

        this.hide();
        this.onload?.(this);
    }
}
</script>