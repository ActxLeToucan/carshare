<template>
    <div class="flex grow flex-col">
        <topbar></topbar>
        <div class="flex grow">
            <div class="flex flex-col items-center w-min px-8 py-4 space-y-4 border-r-8 border-teal-500">
                <button-tab href="#infos" :default="true"> Mes informations </button-tab>
                <button-tab href="#trips"> Mes trajets </button-tab>
                <button-tab href="#evals"> Mes notes </button-tab>
                <div class="flex grow justify-end items-end">
                    <button-tab href="#params"> Paramètres </button-tab>
                </div>
            </div>
            <div class="flex grow">
                <tab-window defaultHash="#infos">

                    <tab-div hash="#infos" class="flex flex-col items-center">
                        <p class="text-2xl text-teal-500 font-bold mx-auto mt-4"> Mes informations </p>
                        <div class="flex flex-col grow justify-evenly items-center">
                            <card class="flex flex-col">
                                <div class="flex flex-col">
                                    <input-text label="Nom" placeholder="Nom" :value="''"></input-text>
                                    <input-text label="Prénom" placeholder="Prénom" :value="''"></input-text>
                                    <input-text label="Email" placeholder="Email" :value="''"></input-text>
                                    <input-text label="Téléphone" placeholder="Téléphone" :value="''"></input-text>
                                </div>
                                <div class="flex space-x-4">
                                    <button-block :action="disconnect"> Se déconnecter </button-block>
                                    <button-block :action="deleteAccount" color="red"> Supprimer le compte </button-block>
                                    <div class="flex grow justify-end pl-20">
                                        <button-block :action="() => {}" disabled="true"> Modifier </button-block>
                                    </div>
                                </div>
                            </card>
                            <card class="flex flex-col">
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
            title="Supprimer le compte"
            content="Êtes-vous sûr de vouloir supprimer votre compte ?\nCette action est irréversible."
            cancelLabel="Annuler"
            validateLabel="Supprimer"
            :onload="setDeletePopup"
            :onvalidate="removeAccount"
        ></popup>
    </div>
</template>

<script>
import Topbar from '../components/topbar/Topbar.vue';
import ButtonBlock from '../components/inputs/ButtonBlock.vue';
import ButtonTab from '../components/inputs/ButtonTab.vue';
import TabWindow from '../components/cards/TabWindow.vue';
import TabDiv from '../components/cards/TabDiv.vue';
import Card from '../components/cards/Card.vue';
import InputText from '../components/inputs/InputText.vue';
import User from '../scripts/User';
import Popup from '../components/cards/Popup.vue';
import API from '../scripts/API';
import { Log } from '../scripts/Logs';

export default {
    components: {
        Topbar,
        ButtonBlock,
        ButtonTab,
        TabWindow,
        TabDiv,
        Card,
        InputText,
        Popup
    },
    name: 'Home',
    data() {
        return {}
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
                API.execute_logged(API.ROUTE.USER, API.METHOD.DELETE, User.CurrentUser.getCredentials()).then(res => {
                    log.update("Compte supprimé avec succès !", Log.SUCCESS);
                    setTimeout(() => {
                        log.delete();
                        this.disconnect();
                        resolve(true);
                    }, 1000);
                }).catch(err => {
                    console.error(err);
                    log.update("Erreur : " + err.message, Log.SUCCESS);
                    setTimeout(() => {
                        log.delete();
                        resolve(false);
                    }, 4000);
                });
            });
        }
    }
}
</script>