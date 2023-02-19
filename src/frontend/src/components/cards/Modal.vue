<template>
    <div class="flex flex-col w-fit h-fit rounded-lg shadow-lg bg-teal-500 overflow-hidden">
        <div class="flex grow-0 h-fit justify-center items-center px-8 py-1">
            <h2 class="text-2xl text-teal-50 font-bold"> {{ title }} </h2>
        </div>
        <div class="flex flex-col justify-center items-center px-4 py-2 bg-slate-50 rounded-md m-1">
            <div class="flex flex-col">
                <slot></slot>
            </div>
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
import { goHome, goToLink } from '../../scripts/redirects.js';

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
    methods: {
        validate() {
            this.onvalidate?.(this);
            if (!goToLink(this)) goHome(this);
        },
        cancel() {
            this.oncancel?.(this);
            this.$router.go(-1);
        }
    },
    mounted() {
        this.$refs["validate"].$el.addEventListener("click", () => { this.validate(this); });
        this.$refs["cancel"].$el.addEventListener("click", () => { this.cancel(this); });
        this.onload?.(this);
    }
}
</script>