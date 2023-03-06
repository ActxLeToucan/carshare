<template>
    <div class="flex grow flex-col">
        <topbar v-if="User.CurrentUser != null"></topbar>
        <button-block class="show-right flex flex-col items-center md:w-min w-full  mx-auto overflow-hidden text-xl" style="margin-top: 1em ; margin-bottom: -3em"> Nouveau trajet </button-block>
        <div class="flex items-center">
        <p class="show-down text-xl text-xl text-slate-400 text-left font-bold position: left  ml-4" style="margin-top: 5em"> Type de trajet </p>
        <button-block class="text-xl text-slate-400 font-bold ml-10" style="margin-top: 4.6em"> Public </button-block>
        <button-block class="text-xl text-slate-400 font-bold" style="margin-top: 4.6em"> Privé </button-block>
        </div>


        <div class="flex items-center">
            <p class="text-xl text-slate-400 font-bold  ml-4 " style="margin-top: 5em"> Nombre de places </p>
            <button class="bg-gray-300  text-white font-bold py-2 px-4 rounded ml-4" style="margin-top: 6em" @click="incrementCounter">{{ compteur }}</button>
        </div>
       

        <div  class="show-down text-xl text-xl text-slate-400 text-left font-bold position: left  ml-auto">
            <div class="flex items-center" style="margin-top: -8em">
                <p class="show-down text-xl text-xl  text-slate-400 text-left font-bold position: left  ml-4"> Départ </p>
                <selector ref="startSelector" :oncompletion="searchCities" :onclick="onstartselected" x="1" y="4"></selector>
                <input-text name="startpoint" class="w-50 mx-10 max-w-fit" placeholder="Nancy" dark="true" style="margin-right: 8em"></input-text>
            </div>
       <!-- <button-block class="w-fit" color="slate" :action="reverseInputs"> 
            <arrows-right-left-icon class="md:block hidden h-7 w-7"></arrows-right-left-icon>
            <arrows-up-down-icon class="md:hidden block h-7 w-7"></arrows-up-down-icon>
        </button-block> -->
            <div class="flex items-center">
                <p class="show-down text-xl text-xl text-slate-400 text-left font-bold position: left  ml-4"> Arrivée </p>
                <selector ref="endSelector" :oncompletion="searchCities" :onclick="onendselected" x="1" y="4"></selector>
                <input-text name="endpoint" class="w-45 mx-10 max-w-fit" placeholder="Paris" dark="true"></input-text>
            </div>   
        </div>
        <div class="flex items-center  bg-gray-200 " style="margin-left: 45em ; margin-right: 1em ; margin-top: 8em ">
            <div class="show-down text-xl text-xl text-slate-400 text-left font-bold position: left  ml-auto">
                <p class="text-xl text-slate-400 font-bold  ml-1 " style="margin-top: 2em"> Nombre de kilomètres </p>
                <input-text  name="startpoint" class="w-50 mx-1 max-w-fit" placeholder="100" dark="true" style="margin-right: 5em" ></input-text>
            </div>
            <div class="show-down text-xl text-xl text-slate-400 text-left font-bold position: left  ml-1">
                <p class="text-xl text-slate-400 font-bold  ml-1 " style="margin-top: 2em"> Prix conseillé </p>
                <p class="text-sm text-slate-400 font-bold  ml-1  "> Par personne </p>
                <input-text name="startpoint" class="w-50 mx-1 max-w-fit" placeholder="8 €" dark="true" style="margin-right: 5em"></input-text>
            </div>
        </div>



        <p class="show-down text-xl text-xl text-slate-400 text-left font-bold position: left  ml-4" style="margin-top: -7em"> Groupe de trajet </p>
        <div class="flex items-center">
        <button-block class="show-right flex flex-col items-center md:w-min w-full  mx-auto overflow-hidden text-xl" style="margin-top: 8em"> Annuler </button-block>
        <button-block class="show-right flex flex-col items-center md:w-min w-full  mx-auto overflow-hidden text-xl" style="margin-top: 8em" > Créer le trajet </button-block>
        </div>
    </div>
    
</template>


<script>
import ButtonBlock from '../components/inputs/ButtonBlock.vue';
import ButtonText from '../components/inputs/ButtonText.vue';
import InputText from '../components/inputs/InputText.vue';
import Topbar from "../components/topbar/Topbar.vue";
import { goBack } from '../scripts/redirects';
import User from "../scripts/User.js";

export default {
    name: 'Home',
    components: {
    Topbar,
    ButtonBlock,
    InputText,
    ButtonText
},
    data() {
        return { User, goBack ,
            compteur: 0 }
    },
    searchCities(selector, search) {
        BAN.searchCities(search).then(cities => {
            let index = 0;
            startCities = cities.map(city => ({ id: index++, value: city.city }));
            selector.setData(startCities);
        }).catch(err => {
            startCities = [];
            selector.setData(startCities);
        });
    },
    reverseInputs() {
            const start = this.startInput.value;
            const end = this.endInput.value;
            this.startInput.value = end;
            this.endInput.value = start;
        },
    methods: {
    incrementCounter() {
      this.compteur++
    }
  }
}

</script>