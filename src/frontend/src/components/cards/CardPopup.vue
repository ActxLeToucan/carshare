<template>
    <div class="fixed top-0 left-0 w-screen h-screen flex justify-center items-center bg-slate-900/[0.3] opacity-0 pointer-events-none transition-all p-4">
        <div
            ref="popup"
            class="flex flex-col rounded-lg shadow-lg border-4 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 p-4 space-y-4 max-w-full max-h-full"
        >
            <h1
                class="text-xl font-bold text-center"
                :class="'text-'+color+'-500'"
            >
                {{ m_title }}
            </h1>
            <div class="flex flex-col">
                <p
                    v-for="line in content.split(/\n|\\n/g)"
                    :key="line"
                    class="text-lg font-semibold text-slate-500 dark:text-slate-400"
                >
                    {{ line }}
                </p>
            </div>
            <div
                ref="log-zone"
                class="flex flex-col w-full justify-center items-center min-h-max h-max transition-all"
                style="max-height: 0px;"
            />
            <div
                ref="inputs"
                class="flex flex-col overflow-auto"
            >
                <slot />
            </div>
            <span class="flex grow h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-lg mb-4 mt-2" />
            <div class="flex justify-between">
                <button-text ref="btn-cancel">
                    {{ cancelLabel }}
                </button-text>
                <button-block
                    v-show="showValidate"
                    ref="btn-validate"
                    :color="color"
                >
                    {{ validateLabel }}
                </button-block>
            </div>
        </div>
    </div>
</template>

<script>
import { retreiveFields } from '../../scripts/data';
import { Log, LogZone } from '../../scripts/Logs';
import { executeAfter } from '../../scripts/Promises';
import ButtonBlock from '../inputs/ButtonBlock.vue';
import ButtonText from '../inputs/ButtonText.vue';

export default {
    name: 'CardPopup',
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
        color: {
            type: String,
            default: 'teal',
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
        showValidate: {
            type: [Boolean, String],
            default: true,
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
        return { m_title: "" }
    },
    mounted() {
        this.m_title = this.title;
        document.body.appendChild(this.$el);

        this.$refs["inputs"].addEventListener("keydown", ev => {
            if (ev.key == "Enter") this.$refs["btn-validate"].$el.click();
        });

        const el = this.$el;
        const child = el.firstElementChild;
        el.addEventListener("click", ev => {
            const rect = child.getBoundingClientRect();
            const pos = { x: ev.clientX, y: ev.clientY };
            if (pos.x < rect.left || pos.x > rect.right || pos.y < rect.top || pos.y > rect.bottom) {
                this.hide();
            }
        });

        window.addEventListener("keydown", ev => {
            if (ev.key == "Escape") {
                if (this.$el.classList.contains("opacity-1"))
                    this.hide();
            }
        });

        this.$refs["btn-cancel"].$el.addEventListener("click", () => {
            executeAfter(
                this.cancel?.(this),
                res => {
                    if (res) this.hide();
                }
            );
        });
        this.$refs["btn-validate"].$el.addEventListener("click", () => {
            executeAfter(
                this.validate?.(this),
                res => {
                    if (res) this.hide();
                }
            );
        });

        this.logZone = new LogZone(this.$refs["log-zone"]);

        this.hide();
        this.onload?.(this);
    },
    methods: {
        show() {
            return new Promise((resolve, reject) => {
                this.$el.classList.add("opacity-1");
                this.$el.classList.add("pointer-events-all");
                this.$el.classList.remove("pointer-events-none");
                this.$el.classList.remove("opacity-0");
                this.$refs["popup"]?.classList.add("show-up");
                this.$refs["popup"]?.classList.remove("hide-down");
                setTimeout(resolve, 250);
                
                const rect = this.$el.getBoundingClientRect();
                this.$el.style.left = -rect.left + "px";
                this.$el.style.top = -rect.top + "px";
            });
        },
        hide() {
            return new Promise((resolve, reject) => {
                this.$el.classList.add("opacity-0");
                this.$el.classList.add("pointer-events-none");
                this.$el.classList.remove("pointer-events-all");
                this.$el.classList.remove("opacity-1");
                this.$refs["popup"]?.classList.add("hide-down");
                this.$refs["popup"]?.classList.remove("show-up");
                setTimeout(resolve, 250);
            });
        },
        log(msg, type = Log.INFO) {
            if (!this.logZone) return null;
            const log = new Log(msg, type);
            log.attachTo(this.logZone);
            return log;
        },
        cancel() {
            return this.oncancel(this);
        },
        validate() {
            retreiveFields(this);
            return this.onvalidate(this);
        },
        getPayload() {
            const payload = {};
            for (let i = 0; i < this.inputs.length; i++) {
                const input = this.inputs[i];
                payload[input.name] = input.value;
            }
            return payload;
        },
        setTitle(title) {
            this.m_title = title;
        },
    }
}
</script>