<template>
    <div class="flex flex-col w-fit h-fit rounded-lg shadow-lg bg-teal-500 overflow-hidden">
        <div class="flex grow-0 h-fit justify-center items-center px-8 py-1">
            <h2 class="text-2xl text-teal-50 font-bold"> {{ title }} </h2>
        </div>
        <div class="flex flex-col justify-center items-center px-4 py-2 bg-slate-50 rounded-md m-1">
            <div class="flex flex-col">
                <slot></slot>
            </div>
            <div
                ref="log-zone"
                class="flex flex-col w-full items-center h-fit overflow-hidden transition-all"
                style="max-height: 0px;"
            ></div>
            <span class="flex grow h-1 w-full bg-slate-200 rounded-lg mb-4 mt-2"></span>
            <div class="flex grow-0 h-fit w-full justify-between">
                <button-text ref="cancel"> Annuler </button-text>
                <button-block ref="validate"> Valider </button-block>
            </div>
        </div>
    </div>
</template>

<script>
import ButtonBlock from '../inputs/ButtonBlock.vue';
import ButtonText from '../inputs/ButtonText.vue';
import { goBack, goHome, goToLink } from '../../scripts/redirects.js';
import { Log, LogZone } from '../../scripts/Logs.js';
import { executeAfter } from '../../scripts/Promises.js';

export default {
    components: {
        ButtonText,
        ButtonBlock
    },
    name: 'Modal',
    props: {
        title: {
            type: String,
            default: '',
            required: false
        },
        onvalidate: {
            type: Function,
            default: modal => {},
            required: false
        },
        oncancel: {
            type: Function,
            default: modal => {},
            required: false
        },
        onload: {
            type: Function,
            default: modal => {},
            required: false
        }
    },
    data() { return { validate_launched: false, cancel_launched: false } },
    methods: {
        validate() {
            if (this.cancel_launched || this.validate_launched) return;
            this.validate_launched = true;
            executeAfter(
                this.onvalidate?.(this),
                (res) => {
                    this.validate_launched = false;
                    if (!res) return;
                    if (!goToLink(this))
                        goHome(this);
                }
            );
        },
        cancel() {
            if (this.cancel_launched || this.validate_launched) return;
            this.cancel_launched = true;
            executeAfter(
                this.oncancel?.(this),
                (res) => {
                    this.cancel_launched = false;
                    if (!res) return;
                    goBack(this);
                }
            );
        },
        log(msg, type) {
            if (!this.logZone) return null;
            const log = new Log(msg, type);
            log.attachTo(this.logZone);
            return log;
        }
    },
    mounted() {
        this.$refs["validate"].$el.addEventListener("click", () => { this.validate(this); });
        this.$refs["cancel"].$el.addEventListener("click", () => { this.cancel(this); });

        this.logZone = new LogZone(this.$refs["log-zone"]);

        this.onload?.(this);
    }
}
</script>