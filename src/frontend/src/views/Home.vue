<template>
    <div class="flex grow w-fit flex-col justify-evenly mx-auto">
        <div class="flex flex-col">
            <h1 class="md:text-6xl text-4xl font-extrabold text-teal-500 text-center md:mb-10 mb-4"> Car Share </h1>
            <div class="flex flex-col w-fit h-fit p-4 space-y-4 rounded-lg shadow-lg bg-white border-b-4 border-slate-300 mx-auto">
                <img src="../assets/img/car.svg" class="max-w-full md:max-h-20 max-h-12 h-20 mx-auto" alt="">
            </div>
        </div>
        <div class="flex flex-col">
            <div class="flex flex-col space-y-4">
                <p class="md:text-4xl text-2xl text-slate-500 text-center font-bold mx-auto"> Bienvenue sur Car Share ! </p>
                <p class="md:text-2xl text-xl text-slate-400 text-center font-bold mx-auto"> Pour commencer à utiliser l'application, veuillez vous inscrire ou vous connecter. </p>
            </div>
            <div class="flex md:flex-row flex-col justify-evenly md:mt-20 mt-10 md:space-x-24 md:space-y-0 space-y-4 mx-auto">
                <button-block class="mx-auto w-full" href="/register"> S'inscrire </button-block>
                <button-block class="mx-auto w-full" href="/login"> Se connecter </button-block>
            </div>
        </div>
    </div>
</template>

<script>
import Topbar from "../components/topbar/Topbar.vue"
import ButtonBlock from "../components/inputs/ButtonBlock.vue"

export default {
    components: { Topbar, ButtonBlock },
    name: 'Home',
    data() {
        return {}
    }
}
</script>