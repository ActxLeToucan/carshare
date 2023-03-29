<template>
    <div class="flex flex-col w-full h-full">
        <div class="ml-auto my-2 mx-4">
            <input-choice
                name="language"
                :label="lang.LANGUAGE "
                :value="selectedLanguage"
                :list="languages"
                :onchange="onLanguageChanged"
            />
        </div>
        <div class="flex grow w-fit flex-col justify-evenly mx-auto">
            <div class="flex flex-col">
                <h1 class="show-up md:text-6xl text-4xl font-extrabold text-teal-500 text-center md:mb-10 mb-4">
                    {{ lang.CARSHARE }}
                </h1>
                <div
                    style="animation-delay: 0.1s"
                    class="show-up flex flex-col w-fit h-fit p-4 space-y-4 rounded-lg shadow-lg bg-white dark:bg-slate-600 border-b-4 border-slate-300 dark:border-slate-700 mx-auto"
                >
                    <img
                        src="../assets/img/car.svg"
                        class="max-w-full md:max-h-20 max-h-12 h-20 mx-auto"
                        alt=""
                    >
                </div>
            </div>
            <div class="flex flex-col">
                <div class="flex flex-col space-y-4">
                    <p
                        style="animation-delay: 0.1s"
                        class="show-down md:text-4xl text-2xl text-slate-500 dark:text-slate-400 text-center font-bold mx-auto"
                    >
                        {{ lang.WELCOME }}
                    </p>
                    <p
                        style="animation-delay: 0.2s"
                        class="show-down md:text-2xl text-xl text-slate-400 dark:text-slate-500 text-center font-bold mx-auto"
                    >
                        {{ lang.WELCOME_DESC }}
                    </p>
                </div>
                <div
                    style="animation-delay: 0.3s"
                    class="show-down flex md:flex-row flex-col justify-evenly md:mt-20 mt-10 md:space-x-24 md:space-y-0 space-y-4 mx-auto"
                >
                    <button-block
                        class="mx-auto w-fit"
                        href="/register"
                    >
                        {{ lang.REGISTER }}
                    </button-block>
                    <button-block
                        class="mx-auto w-fit"
                        href="/login"
                    >
                        {{ lang.LOGIN }}
                    </button-block>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import ButtonBlock from "../components/inputs/ButtonBlock.vue";
import Lang from '../scripts/Lang';
import InputChoice from "../components/inputs/InputChoice.vue";

export default {
    name: 'HomeView',
    components: {InputChoice, ButtonBlock },
    data() {
        return {
            lang: Lang.CurrentLang,
            selectedLanguage: Lang.CurrentCode,
            languages: Lang.Langs,
        }
    },
    mounted() {
        Lang.AddCallback(lang => this.lang = lang);
    },
    methods: {
        onLanguageChanged(val) {
            const oldLang = Lang.CurrentCode;
            const res = Lang.LoadLang(val);
            if (res) this.selectedLanguage = val;
            else this.selectedLanguage = oldLang;
        },
    }
}
</script>