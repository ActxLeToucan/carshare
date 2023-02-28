<template>
    <div class="flex grow flex-col">
        <topbar></topbar>
        <div class="flex md:flex-row flex-col grow max-h-full min-h-0">
            <div ref="tabs-zone" class="flex flex-col items-center h-full md:w-min w-full px-8 py-4 space-y-4 md:border-r-8 border-teal-500 mx-auto overflow-hidden">
                <button-tab href="#infos" :default="!isMobile"> Mes informations </button-tab>
                <button-tab href="#trips"> Mes trajets </button-tab>
                <button-tab href="#evals"> Mes notes </button-tab>
                <button-tab href="#params"> Paramètres </button-tab>
                <div class="flex grow justify-end items-end mx-auto">
                    <button-block :action="disconnect"> Se déconnecter </button-block>
                </div>
            </div>
            <div ref="content-zone" class="flex flex-col md:grow overflow-scroll">

                <button ref="backtabs-btn" class="absolute md:hidden flex rounded-md border-2 border-slate-200 bg-white h-fit w-fit p-2 m-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>

                <tab-window defaultHash="#infos" class="md:pt-0 pt-5">

                    <tab-div hash="#infos" class="flex flex-col items-center">
                        <p class="text-2xl text-teal-500 font-bold mx-auto mt-4"> Mes informations </p>
                        <div class="flex flex-col grow justify-evenly items-center">
                            <card class="flex flex-col m-4">
                                <div class="flex flex-col">
                                    <input-text   name="lastName"  label="Nom" placeholder="Nom" :value="User.CurrentUser.lastName"></input-text>
                                    <input-text   name="firstName" label="Prénom" placeholder="Prénom" :value="User.CurrentUser.firstName"></input-text>
                                    <input-text   name="email"     label="Email" placeholder="Email" :value="User.CurrentUser.email"></input-text>
                                    <input-text   name="phone"     label="Téléphone" placeholder="Téléphone" :value="User.CurrentUser.phone"></input-text>
                                    <input-choice name="gender"    label="Genre" :list="genres"></input-choice>
                                    <input-switch name="hasCar"    label="J'ai une voiture" :value="User.CurrentUser.hasCar"></input-switch>
                                </div>
                                <div class="flex md:flex-row flex-col md:space-x-4 md:space-y-0 space-y-2 mt-4">
                                    <button-block :action="deleteAccount" color="red"> Supprimer le compte </button-block>
                                    <div class="flex grow justify-end pl-20">
                                        <button-block :action="() => {}" disabled="true"> Modifier </button-block>
                                    </div>
                                </div>
                            </card>
                            <card class="flex flex-col m-4">
                                <div class="flex flex-col">
                                    <input-text label="Ancien mot de passe" placeholder="Ancien mot de passe" :value="''"></input-text>
                                    <input-text label="Nouveau mot de passe" placeholder="Nouveau mot de passe" :value="''"></input-text>
                                    <input-text label="Confirmation" placeholder="Confirmation du mot de passe" :value="''"></input-text>
                                </div>
                                <div class="flex grow justify-end">
                                    <button-block :action="() => {}" disabled="true"> Changer </button-block>
                                </div>
                            </card>
                        </div>
                    </tab-div>

                    <tab-div hash="#trips">
                        <p class="text-2xl text-teal-500 py-2 font-bold mx-auto"> Mes trajets </p>
                    </tab-div>

                    <tab-div hash="#evals">
                        <p class="text-2xl text-teal-500 py-2 font-bold mx-auto"> Mes notes </p>
                    </tab-div>

                    <tab-div hash="#params">
                        <p class="text-2xl text-teal-500 py-2 font-bold mx-auto"> Paramètres </p>
                    </tab-div>
                </tab-window>
            </div>
        </div>
        <popup
            color="red"
            title="Supprimer le compte"
            content="Êtes-vous sûr de vouloir supprimer votre compte ?\nCette action est irréversible."
            cancelLabel="Annuler"
            validateLabel="Supprimer"
            :onload="setDeletePopup"
            :onvalidate="removeAccount"
        > <input-text label="Mot de passe" placeholder="Mot de passe" name="password" type="password"></input-text> </popup>
    </div>
</template>

<script>
import Topbar from '../components/topbar/Topbar.vue';
import ButtonBlock from '../components/inputs/ButtonBlock.vue';
import ButtonTab from '../components/inputs/ButtonTab.vue';
import InputChoice from '../components/inputs/InputChoice.vue';
import InputSwitch from '../components/inputs/InputSwitch.vue';
import TabWindow from '../components/cards/TabWindow.vue';
import TabDiv from '../components/cards/TabDiv.vue';
import Card from '../components/cards/Card.vue';
import InputText from '../components/inputs/InputText.vue';
import User from '../scripts/User';
import Popup from '../components/cards/Popup.vue';
import API from '../scripts/API';
import { Log } from '../scripts/Logs';

const genres = [
    { label: "Homme", value: 1, selected: User.CurrentUser.gender == 1 },
    { label: "Autre", value: -1, selected: User.CurrentUser.gender == -1 },
    { label: "Femme", value: 0, selected: User.CurrentUser.gender == 0 },
];

export default {
    components: {
        Topbar,
        ButtonBlock,
        ButtonTab,
        TabWindow,
        TabDiv,
        Card,
        InputText,
        Popup,
        InputChoice,
        InputSwitch
    },
    name: 'Home',
    data() {
        return { User, genres, isMobile: window.innerWidth < 768 }
    },
    methods: {
        setDeletePopup(popup) {
            this.deletePopup = popup;
        },
        disconnect() {
            User.forget();
            this.$router.push('/');
        },
        deleteAccount() {
            if (!this.deletePopup) return;
            this.deletePopup.show();
        },
        removeAccount(popup) {
            return new Promise((resolve, reject) => {
                const log = popup.log("Suppression du compte...", Log.INFO);
                API.execute_logged(API.ROUTE.USER, API.METHOD.DELETE, User.CurrentUser.getCredentials(), {password: popup.get("password")}).then(res => {
                    log.update("Compte supprimé avec succès !", Log.SUCCESS);
                    setTimeout(() => {
                        log.delete();
                        this.disconnect();
                        resolve(true);
                    }, 1000);
                }).catch(err => {
                    console.error(err);
                    log.update("Erreur : " + err.message, Log.ERROR);
                    setTimeout(() => {
                        log.delete();
                        resolve(false);
                    }, 4000);
                });
            });
        },
        setupView() {
            const tabs = this.$refs["tabs-zone"];
            const tabsBtn = this.$refs["backtabs-btn"];
            const content = this.$refs["content-zone"];

            if (this.isMobile) {
                this.showTabs = () => {
                    tabs.classList.remove("hidden");
                    content.classList.add("hidden");

                    tabs.classList.add("show-right");
                    content.classList.remove("show-left");
                    tabsBtn.classList.remove("show-left");
                };
                this.hideTabs = () => {
                    tabs.classList.add("hidden");
                    content.classList.remove("hidden");

                    tabs.classList.remove("show-right");
                    content.classList.add("show-left");
                    tabsBtn.classList.add("show-left");
                };

                tabsBtn.addEventListener("click", () => {
                    this.showTabs();
                    this.$router.push({ hash: '' });
                });
                if (window.location.hash == '')
                    this.showTabs();
                else this.hideTabs();
            } else {
                tabs.classList.remove("hidden");
                content.classList.remove("hidden");
            }
        }
    },
    mounted() {
        this.setupView();
        window.addEventListener("resize", () => {
            this.isMobile = window.innerWidth < 768;
            this.setupView();
        });

        const setInputValue = (name, value) => {
            const input = this.$el.querySelector(`input[name="${name}"]`);
            if (input) input.value = value;
        }

        API.execute_logged(API.ROUTE.USER, API.METHOD.GET, User.CurrentUser.getCredentials()).then(res => {
            User.CurrentUser.setInformations(res);
            User.CurrentUser.save();
            
            const fields = ["lastName", "firstName", "email", "phone", "gender", "hasCar"];
            fields.forEach(field => setInputValue(field, User.CurrentUser[field]));

        }).catch(err => {
            console.error(err);
        });
    },
    watch: {
        '$route.hash': function (newVal, oldVal) {
            const isMobile = window.innerWidth < 768;
            if (isMobile && newVal != '') this.hideTabs();
        }
    }
}
</script>