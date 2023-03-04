<template>
    <div class="show-up flex flex-col grow">
        <p class="text-2xl text-teal-500 font-bold mx-auto mt-4"> Mes informations </p>
        <div class="flex flex-col grow justify-evenly items-center">
            <card class="flex flex-col m-4">
                <div class="flex flex-col">
                    <input-text   name="lastName"  label="Nom" placeholder="Nom" :value="User.CurrentUser?.lastName"></input-text>
                    <input-text   name="firstName" label="Prénom" placeholder="Prénom" :value="User.CurrentUser?.firstName"></input-text>
                    <input-text   name="email"     label="Email" placeholder="Email" :value="User.CurrentUser?.email" class="mb-0"></input-text>
                    <div class="flex space-x-4">
                        <p v-if="emailVerified == 'false'" class="ml-auto text-md text-slate-500"> Adresse non verifiée : </p>
                        <p v-if="emailVerified == 'true'" class="ml-auto text-md text-slate-500"> Adresse verifiée </p>
                        <p v-if="emailVerified == 'pending'" class="ml-auto text-md text-slate-500"> Un mail de vérification vous a été envoyé </p>
                        <p v-if="emailVerified == 'error'" class="ml-auto text-md text-red-500"> Une erreur s'est produite, veuillez réessayer. </p>
                        <button
                            v-on:click="verifyEmail"
                            v-if="emailVerified == 'false'"
                            class="ml-auto font-semibold text-md text-slate-500 hover:text-teal-500 cursor-pointer"> Vérifier </button>
                    </div>
                    <input-text   name="phone"     label="Téléphone" placeholder="Téléphone" :value="User.CurrentUser?.phone"></input-text>
                    <input-choice name="gender"    label="Genre" :value="User.CurrentUser?.gender" :list="genres"></input-choice>
                    <input-switch name="hasCar"    label="J'ai une voiture" :value="User.CurrentUser?.hasCar"></input-switch>
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
        <popup
            color="red"
            title="Supprimer le compte"
            content="Êtes-vous sûr de vouloir supprimer votre compte ?\nCette action est irréversible."
            cancelLabel="Annuler"
            validateLabel="Supprimer"
            :onload="setDeletePopup"
            :onvalidate="removeAccount"
        >
            <input-text label="Mot de passe" placeholder="Mot de passe" name="password" type="password"></input-text>
        </popup>
    </div>
</template>

<script>
import ButtonBlock from '../inputs/ButtonBlock.vue';
import InputText from '../inputs/InputText.vue';
import InputChoice from '../inputs/InputChoice.vue';
import InputSwitch from '../inputs/InputSwitch.vue';
import Card from '../cards/Card.vue';
import Popup from '../cards/Popup.vue';

import { Log } from '../../scripts/Logs';
import { genres } from '../../scripts/data';

export default {
    name: "UserInfos",
    components: {
        ButtonBlock,
        Card,
        InputText,
        Popup,
        InputChoice,
        InputSwitch
    },
    data() {
        return { User, genres, isMobile: window.innerWidth < 768, emailVerified: (User.CurrentUser?.emailVerifiedOn != null).toString() }
    },
    methods: {
        setDeletePopup(popup) {
            this.deletePopup = popup;
        },
        deleteAccount() {
            if (!this.deletePopup) return;
            this.deletePopup.show();
        },
        removeAccount(popup) {
            return new Promise((resolve, reject) => {
                const log = popup.log("Suppression du compte...", Log.INFO);
                API.execute_logged(API.ROUTE.USER, API.METHOD.DELETE, User.CurrentUser?.getCredentials(), {password: popup.get("password")}).then(res => {
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
        verifyEmail() {
            API.execute_logged(API.ROUTE.VERIFY, API.METHOD.POST, User.CurrentUser?.getCredentials()).then(res => {
                this.emailVerified = 'pending';
            }).catch(err => {
                this.emailVerified = 'error';
            });
        }
    },
    mounted() {
        const setInputValue = (name, value) => {
            const input = this.$el.querySelector(`input[name="${name}"]`);
            if (input) input.value = value;
        }

        API.execute_logged(API.ROUTE.USER, API.METHOD.GET, User.CurrentUser?.getCredentials()).then(res => {
            User.CurrentUser?.setInformations(res);
            User.CurrentUser?.save();
            
            const fields = ["lastName", "firstName", "email", "phone", "gender", "hasCar"];
            fields.forEach(field => setInputValue(field, User.CurrentUser[field]));

        }).catch(err => {
            console.error(err);
        });
    }
}
</script>