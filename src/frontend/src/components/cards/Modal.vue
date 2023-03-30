<template>
    <div class="show-up flex flex-col w-fit h-fit max-w-full min-w-0 rounded-lg shadow-lg bg-teal-500 overflow-hidden m-2">
        <div class="flex grow-0 h-fit justify-center items-center px-8 py-1">
            <h2 class="text-2xl text-slate-50 dark:text-slate-700 font-bold"> {{ title }} </h2>
        </div>
        <div class="flex flex-col justify-center items-center px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-md m-1">
            <div ref="inputs" class="flex flex-col">
                <slot></slot>
            </div>
            <div
                ref="log-zone"
                class="flex flex-col max-w-full min-w-0 w-full items-center h-fit overflow-hidden transition-all"
                style="max-height: 0px;"
            ></div>
            <span class="flex grow h-1 w-full bg-slate-200 dark:bg-slate-600 rounded-lg mb-4 mt-2"></span>
            <div style="animation-delay: 0.2s" class="show-down flex grow-0 h-fit w-full justify-between">
                <button-text ref="cancel" :action="cancel"> {{ lang.CANCEL }} </button-text>
                <button-block :disabled="this.disabled != false" ref="validate" :action="validate"> {{ lang.VALIDATE }} </button-block>
            </div>
        </div>
    </div>
</template>

<script>
import ButtonBlock from '../inputs/ButtonBlock.vue';
import ButtonText from '../inputs/ButtonText.vue';
import { goBack, goHome, goTo, goToLink } from '../../scripts/redirects.js';
import { Log, LogZone } from '../../scripts/Logs.js';
import { executeAfter } from '../../scripts/Promises.js';
import { retreiveFields } from '../../scripts/data.js';
import Lang from '../../scripts/Lang';

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
        disabled: {
            type: [Boolean, String],
            default: false,
            required: false
        },
        onload: {
            type: Function,
            default: modal => {},
            required: false
        }
    },
    data() { return { lang: Lang.CurrentLang } },
    methods: {
        validate() {
            retreiveFields(this);

            executeAfter(
                this.onvalidate?.(this),
                (res) => {
                    if (!res) return;
                    if (typeof res == "string")
                        return goTo(this, res);
                    if (!goToLink(this))
                        goHome(this);
                }
            );
        },
        cancel() {
            executeAfter(
                this.oncancel?.(this),
                (res) => {
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
        },
        getPayload() {
            const payload = {};
            for (let i = 0; i < this.inputs.length; i++) {
                const input = this.inputs[i];
                payload[input.name] = input.value;
            }
            return payload;
        }
    },
    mounted() {
        Lang.AddCallback(lang => this.lang = lang);

        this.$el.addEventListener("keydown", ev => {
            if (ev.key == "Enter")
                this.validate();
            else if (ev.key == "Escape")
                this.cancel();
        });

        this.logZone = new LogZone(this.$refs["log-zone"]);

        this.onload?.(this);

        // animate all inputs
        const inputs_div = this.$refs["inputs"];
        for (let i = 0; i < inputs_div.children.length; i++) {
            const div = inputs_div.children[i];
            if (div.children.length < 2) {
                div.classList.add("show-right");
            } else {
                div.children[0].classList.add("show-right");
                div.children[1].classList.add("show-left");
                div.children[0].style.animationDelay = `${i * 0.05}s`;
                div.children[1].style.animationDelay = `${i * 0.05}s`;
            }
        }
    }
}
</script>