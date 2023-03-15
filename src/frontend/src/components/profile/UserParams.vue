<template>
  
    <div class="show-up flex flex-col grow  bg-white dark:bg-black" >
        <p class="text-2xl text-teal-500 py-2 font-bold mx-auto"> {{ lang.PARAMS }}  </p> 
        <div class="flex flex-col grow justify-evenly items-center">
            <div class="flex flex-col">
                <p class="font-bold   text-slate-500 text-xl"> --Email--</p>
                <input-switch name="mailNotif"    :label="lang.GET_NOTIFIED" :onchange="$stat => beNotified($stat)"></input-switch><br><br>
                
                <p class="font-bold   text-slate-500 text-xl"> --Affichage--</p>
                <input-choice  name="sombre"   :label="lang.THEME"     :value="defaut"  :list="theme"  @change="onchangeTheme($event)" ></input-choice><br><br>        
                
                <p class="font-bold   text-slate-500 text-xl"> --Langue--</p>
                <input-choice  name="langue"   :label="lang.LANGUES "   v-model="selected"  :value="fr"  :list="langues" @change = "onchangeLang($event)"></input-choice><br><br><br><br>         
               
            </div>
        </div>
    </div>
   
    
</template>

<script>

import InputSwitch from '../inputs/InputSwitch.vue';
import InputChoice from '../inputs/InputChoice.vue'
import Lang from '../../scripts/Lang';
import { langues } from '../../scripts/data';
import { theme } from '../../scripts/data';
import User from '../../scripts/User';
import API from '../../scripts/API.js';



export default {
    
    name: "UserParams",
    components: {
        InputSwitch, InputChoice
    },
    data() {
        return {
            User,
            lang: Lang.CurrentLang,
            langues,
            theme,
            SelectedLang: '',
            SelectedTheme: '',
            selected: '', 

            formProperties: {
                properties: {
                    mailNotif: User.CurrentUser?.mailNotif,
                    id : User.CurrentUser?.id 
                },
            
            },
        }
    },
    mounted() {
        Lang.AddCallback(lang => this.lang = lang);
        if (User.CurrentUser == null) return;
        console.log("mail" , User.CurrentUser.mailNotif)
    },
    methods: {
     onchangeTheme(e) {
            console.log(e.target.value);
            this.SelectedTheme = e.target.value;
           
            if (this.SelectedTheme === 'dark') {
                document.documentElement.classList.add("dark");
            }
            else if (this.SelectedTheme === 'defaut') {
                const themeSombreActif = window.matchMedia("(prefers-color-scheme: dark)").matches;
                if (themeSombreActif) {
                    document.documentElement.classList.add("dark");
                } else {
                    document.documentElement.classList.remove("dark");
                }
            }
            else {
                document.documentElement.classList.remove("dark");
            }
        },
        onchangeLang(e) {
            console.log(e.target.value);
            this.SelectedLang = e.target.value;
            if (this.SelectedLang === 'fr') {
                // Charger la langue française
                const success = Lang.LoadLang("fr");
            } else if (this.SelectedLang === 'en') {
                // Charger la langue anglaise
                const success = Lang.LoadLang("en");
            }
        },
        beNotified(state) {
            this.User.CurrentUser.mailNotif = state;
            console.log("stat", state)
            const { id } = this;
             console.log("id", this.User.CurrentUser?.id)
            const data = {
                "value": state ,
            }
            API.execute_logged(API.ROUTE.SETTINGS , API.METHOD.PATCH, User.CurrentUser?.getCredentials() ).then((data) => {
               console.log("succes")
            }).catch(err => {
                console.error(err);
               // state = !state; 
                console.log("stat", state)
            });
        }, 
        
        
    
      
    }
}
</script>
