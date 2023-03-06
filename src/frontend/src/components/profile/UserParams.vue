<template>
    <div class="show-up flex flex-col grow" :class='mode'>
        <p class="text-2xl text-teal-500 py-2 font-bold mx-auto"> Paramètres  </p>
         <div class="flex flex-col grow justify-evenly items-center">
            <div class="flex flex-col">
                <p class="font-bold   text-slate-500 text-xl"> --Email--</p>
                <input-switch name="NotifEmail"    label="Notification par Email : " v-model="emailNotifications"></input-switch><br><br>
                
                <p class="font-bold   text-slate-500 text-xl"> --Affichage--</p>
                <input-switch name="animation"    label="Mode Animation : "></input-switch>
                <input-switch name="sombre"    label="Mode Sombre : "></input-switch><br><br>
                
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
            mode: 'dark',
            
        }
    },
    mounted() {

    }
}
</script>

<style>
.dark {
 background: #192734;
}
</style>