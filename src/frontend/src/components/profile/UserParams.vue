<template>
    <div class="show-up flex flex-col grow"  :class="{ 'dark': isDarkMode }">
        <p class="text-2xl text-teal-500 py-2 font-bold mx-auto"> {{ lang.PARAMS }}  </p> 
         <div class="flex flex-col grow justify-evenly items-center">
            <div class="flex flex-col">
                <p class="font-bold   text-slate-500 text-xl"> --Email--</p>
                <input-switch name="NotifEmail"    :label="lang.GET_NOTIFIED " v-model="emailNotifications" ></input-switch><br><br>
                
                <p class="font-bold   text-slate-500 text-xl"> --Affichage--</p>
                <input-switch name="sombre"    :label="lang.DARKMODE" @click="toggleDarkMode" :checked="isDarkMode"></input-switch><br><br>
                
                <p class="font-bold   text-slate-500 text-xl"> --Langue--</p>
                <input-choice  name="en"  id="angalis"  :label="lang.LANGUES "  :options="langues"    :value="-1" @click = "ChangeToEnglish"></input-choice><br><br><br><br>         

            </div>
         </div>
    </div>
</template>

<script>
import InputSwitch from '../inputs/InputSwitch.vue';
import InputChoice from '../inputs/InputChoice.vue'
import Lang from '../../scripts/Lang';
import { langues } from '../../scripts/data';

export default {
    
    name: "UserParams",
    components: {
        InputSwitch, InputChoice
    },
    data() {
        return { 
            isDarkMode: false,
            isEnglish:false, 
            lang: Lang.CurrentLang,
            langues,
            
            
        }
    },
    mounted() {
        Lang.addCallback(lang => this.lang = lang);

        // Check if the user has a dark mode preference
        this.isDarkMode = window.matchMedia('(prefers-color-scheme : dark)').matches
        // Update the class of the body tag
        document.body.classList.toggle('dark', this.isDarkMode)

        API.execute_logged(API.ROUTE.USER, API.METHOD.GET, User.CurrentUser?.getCredentials()).then(res => {
            User.CurrentUser?.setInformations(res);
            User.CurrentUser?.save();

            const fields = ["NotifEmail", "sombre", "en"];
            fields.forEach(field => setInputValue(field, User.CurrentUser[field]));

        }).catch(err => {
            console.error(err);
        });
    },
    methods: {
        toggleDarkMode() {
            this.isDarkMode = !this.isDarkMode
            // Update the class of the body tag
            document.body.classList.toggle('dark', this.isDarkMode)
        },
        ChangeToEnglish() {
            button.addEventListener("click", () => {
                const success = Lang.LoadLang("en");
            });

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