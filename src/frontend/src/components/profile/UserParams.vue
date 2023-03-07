<template>
    <div class="show-up flex flex-col grow"  :class="{ 'dark': isDarkMode }">
        <p class="text-2xl text-teal-500 py-2 font-bold mx-auto"> Paramètres  </p>
         <div class="flex flex-col grow justify-evenly items-center">
            <div class="flex flex-col">
                <p class="font-bold   text-slate-500 text-xl"> --Email--</p>
                <input-switch name="NotifEmail"    label="Notification par Email : " v-model="emailNotifications"></input-switch><br><br>
                
                <p class="font-bold   text-slate-500 text-xl"> --Affichage--</p>
                <input-switch name="sombre"    label="Mode Sombre : " @click="toggleDarkMode" :checked="isDarkMode"></input-switch><br><br>
                
                <p class="font-bold   text-slate-500 text-xl"> --Langue--</p>
                <input-switch name="fr"    label="Français : "></input-switch>
                <input-switch name="eng"    label="Englais : "></input-switch><br><br><br><br>

            </div>
         </div>
    </div>
</template>

<script>
import InputSwitch from '../inputs/InputSwitch.vue';
export default {
    name: "UserParams",
    components: {
        InputSwitch
    },
    data() {
        return { 
           isDarkMode : false
            
        }
    },
    mounted() {
          // Check if the user has a dark mode preference
        this.isDarkMode = window.matchMedia('(prefers-color-scheme : dark)').matches
          // Update the class of the body tag
        document.body.classList.toggle('dark', this.isDarkMode)
    },
    methods: {
        toggleDarkMode() {
            this.isDarkMode = !this.isDarkMode
            // Update the class of the body tag
            document.body.classList.toggle('dark', this.isDarkMode)
        }
    }
}
</script>
<style>
.dark {
    /* Add your dark mode styles here */
    background-color: #1a202c;
    color: #fff;
}
</style>