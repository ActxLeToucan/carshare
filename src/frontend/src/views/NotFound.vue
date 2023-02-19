<template>
    <div class="flex grow flex-col">
        <topbar v-if="User.CurrentUser != null"></topbar>
        <div class="flex grow flex-col justify-center w-fit space-y-6 mx-auto">
            <h1 class="md:text-6xl text-4xl font-extrabold text-teal-500 text-center"> Car Share - Application </h1>
            <img src="../assets/img/car.svg" class="max-w-full md:max-h-20 max-h-12 mx-auto" alt="">
            <p class="md:text-4xl text-xl font-bold text-slate-400 text-center"> Woops, la page que vous recherchez n'existe pas ! </p>
            <button-block class="mx-auto" :action="goBack"> Retour </button-block>
        </div>
    </div>
</template>

<script>
import ButtonBlock from '../components/inputs/ButtonBlock.vue';
import Topbar from "../components/topbar/Topbar.vue";
import { goBack } from '../scripts/redirects';
import User from "../scripts/User.js";

export default {
    name: 'Home',
    components: {
        Topbar,
        ButtonBlock
    },
    data() {
        return { User, goBack }
    }
}
</script>