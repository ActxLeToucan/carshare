<template>
    <div class="flex grow flex-col">
        <topbar v-if="User.CurrentUser != null" />
        <div class="flex grow flex-col justify-center w-fit mx-auto">
            <div class="flex flex-col">
                <h1 class="show-up md:text-6xl text-4xl font-extrabold text-teal-500 text-center md:mb-10 mb-4">
                    {{ lang.CARSHARE }}
                </h1>
                <div
                    style="animation-delay: 0.1s"
                    class="show-up flex flex-col w-fit h-fit p-4 space-y-4 rounded-lg shadow-lg bg-white border-b-4 border-slate-300 mx-auto"
                >
                    <img
                        src="../assets/img/car.svg"
                        class="max-w-full md:max-h-20 max-h-12 h-20 mx-auto"
                        alt=""
                    >
                </div>
            </div>
            <div class="flex flex-col md:mt-20 mt-10 mx-10">
                <div class="flex flex-col space-y-4">
                    <p
                        style="animation-delay: 0.1s"
                        class="show-down md:text-4xl text-2xl text-slate-500 text-center font-bold mx-auto"
                    >
                        {{ lang.WOOPS }}
                    </p>
                    <p
                        style="animation-delay: 0.2s"
                        class="show-down md:text-2xl text-xl text-slate-400 text-center font-bold mx-auto"
                    >
                        {{ lang.NOT_FOUND }}
                    </p>
                </div>
                <div
                    style="animation-delay: 0.3s"
                    class="show-down flex justify-center mx-auto mt-10"
                >
                    <button-block
                        class="mx-auto"
                        :action="goBack"
                    >
                        {{ lang.BACK }}
                    </button-block>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ButtonBlock from '../components/inputs/ButtonBlock.vue';
import Topbar from "../components/topbar/Topbar.vue";
import Lang from '../scripts/Lang';
import { goBack } from '../scripts/redirects';
import User from "../scripts/User.js";

export default {
    name: 'NotFoundView',
    components: {
        Topbar,
        ButtonBlock
    },
    data() {
        return { User, goBack, lang: Lang.CurrentLang }
    },
    mounted() {
        Lang.AddCallback(lang => this.lang = lang);
    }
}
</script>