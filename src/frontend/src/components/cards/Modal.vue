<template>
    <div class="show-up flex flex-col w-fit h-fit rounded-lg shadow-lg bg-teal-500 overflow-hidden">
        <div class="flex grow-0 h-fit justify-center items-center px-8 py-1">
            <h2 class="text-2xl text-teal-50 font-bold"> {{ title }} </h2>
        </div>
        <div class="flex flex-col justify-center items-center px-4 py-2 bg-slate-50 rounded-md m-1">
            <div ref="inputs" class="flex flex-col">
                <slot></slot>
            </div>
            <div
                ref="log-zone"
                class="flex flex-col w-full items-center h-fit overflow-hidden transition-all"
                style="max-height: 0px;"
            ></div>
            <span class="flex grow h-1 w-full bg-slate-200 rounded-lg mb-4 mt-2"></span>
            <div style="animation-delay: 0.2s" class="show-down flex grow-0 h-fit w-full justify-between">
                <button-text ref="cancel" :action="cancel"> Annuler </button-text>
                <button-block :disabled="this.disabled != false" ref="validate" :action="validate"> Valider </button-block>
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

function retreiveFields(modal) {
    /**@type {HTMLDivElement} */
    const inputs_div = modal.$refs["inputs"];
    const inputs = [];
    for (let i = 0; i < inputs_div.children.length; i++) {
        const div = inputs_div.children[i];
        const input = div.querySelector("input");
        if (!input) continue;

        if (input.type == "checkbox")
            input.value = input.checked ? true : false;

        inputs.push(input);
    }

    modal.inputs = inputs;
    modal.get = (name) => {
        const input = inputs.find(input => input.name == name);
        if (!input) return null;
        return input.value;
    };
    modal.focus = (name) => {
        const input = inputs.find(input => input.name == name);
        if (!input) return false;
        input.focus();
        return true;
    };
}

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
    data() { return {} },
    methods: {
        validate() {
            retreiveFields(this);

            executeAfter(
                this.onvalidate?.(this),
                (res) => {
                    if (!res) return;
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