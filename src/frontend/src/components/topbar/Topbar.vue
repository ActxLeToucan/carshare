<template>
    <div class="flex grow-0 h-fit w-full px-4 py-2 bg-slate-50 border-b-8 border-teal-500 items-center">
        <div class="flex w-[20%] h-fit">
            <h1 class="text-slate-500 text-3xl font-extrabold"> Car Share </h1>
        </div>
        <div class="flex grow justify-evenly">
            <button-text v-for="button in buttons" :key="button.name" :href="button.link">
                {{ button.name }}
            </button-text>
        </div>
        <div class="flex w-[20%] h-fit justify-end space-x-4">
            <button-text href="/register"> S'inscrire </button-text>
            <button-block href="/login"> Se connecter </button-block>
        </div>
    </div>
</template>

<script>
import ButtonText from "../buttons/ButtonText.vue"
import ButtonBlock from "../buttons/ButtonBlock.vue"

const buttons = [
    {
        name: 'Accueil',
        link: '/'
    },
    {
        name: 'Profil',
        link: '/profile'
    },
    {
        name: 'Groupes',
        link: '/groups'
    }
]

export default {
    components: {
        ButtonText,
        ButtonBlock
    },
    name: 'Topbar',
    data() {
        return { buttons }
    }
}
</script>