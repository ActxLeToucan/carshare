<template>
    <div class="flex grow flex-col">
        <topbar v-if="User.CurrentUser != null"></topbar>
        <div class="flex grow w-fit flex-col justify-center space-y-6 mx-auto">
            <modal :oncancel="onCancel" :onvalidate="onValidate" title="S'inscrire">
                <input-text   name="firstname"        label="Nom"          placeholder="Nom de famille"                               ></input-text>
                <input-text   name="lastname"         label="Prénom"       placeholder="Prénom"                                       ></input-text>
                <input-text   name="mail"             label="Email"        placeholder="Adresse mail"                 type="email"    ></input-text>
                <input-text   name="phone"            label="Téléphone"    placeholder="Numéro de téléphone"          type="tel"      ></input-text>
                <input-text   name="password"         label="Mot de passe" placeholder="Mot de passe"                 type="password" ></input-text>
                <input-text   name="password-confirm" label="Confirmation" placeholder="Confirmation du mot de passe" type="password" ></input-text>
                <input-switch name="is-driver"        label="J'ai une voiture"                                        value="false"   ></input-switch>
            </modal>
        </div>
    </div>
</template>

<script>
import Topbar from "../components/topbar/Topbar.vue";
import Modal from "../components/cards/Modal.vue";
import InputText from "../components/inputs/InputText.vue";
import InputSwitch from "../components/inputs/InputSwitch.vue";
import { Log } from '../scripts/Logs';
import User from '../scripts/User';

function isPhoneNumber(val) {
    if (!val) return false;
    return val.replace(/(\.|\s|-)/g, "").trim().match(/^((00[0-9]{2})?0[0-9][0-9]{8}|\+[0-9]{11,12})$/) != null;
}

const field_checks = [
    {field: "firstname",        check: (value) => value.length > 0, error: "Veuillez renseignez votre nom."},
    {field: "lastname",         check: (value) => value.length > 0, error: "Veuillez renseignez votre prénom."},
    {field: "mail",             check: (value) => value.length > 0, error: "Veuillez renseignez votre adresse mail."},
    {field: "phone",            check: (value) => value.length > 0, error: "Veuillez renseignez votre numéro de téléphone."},
    {field: "password",         check: (value) => value.length > 0, error: "Veuillez renseignez votre mot de passe."},
    {field: "password-confirm", check: (value) => value.length > 0, error: "Veuillez confirmer votre mot de passe."},

    {field: "firstname",        check: (value) => value.length <= 50,   error: "Ce nom est trop long."},
    {field: "lastname",         check: (value) => value.length <= 50,   error: "Ce prénom est trop long."},
    {field: "mail",             check: (value) => value.length <= 64,   error: "Cette adresse mail est trop longue."},
    {field: "phone",            check: (value) => isPhoneNumber(value), error: "Ce numéro de téléphone est invalide."},

    {field: "password-confirm", check: (value, modal) => value === modal.get("password"), error: "Les mots de passe ne correspondent pas."},
    {field: "password",         check: (value) => value.length >= 10,                     error: "Votre mot de passe doit faire au moins 10 caractères."},
    {field: "password",         check: (value) => value.match(/[A-Z]/g) != null,          error: "Votre mot de passe doit contenir au moins une majuscule."},
    {field: "password",         check: (value) => value.match(/[a-z]/g) != null,          error: "Votre mot de passe doit contenir au moins une minuscule."},
    {field: "password",         check: (value) => value.match(/[0-9]/g) != null,          error: "Votre mot de passe doit contenir au moins un chiffre."},
    {field: "password",         check: (value) => value.match(/[^A-Za-z0-9]/g) != null,   error: "Votre mot de passe doit contenir au moins un caractère spécial."}
];

function onCancel(modal) {
    return true;
}

function onValidate(modal) {
    return new Promise((resolve, reject) => {
        
        const inputs_log = modal.log("Vérification des entrées ...", Log.INFO);
        for (let i = 0; i < field_checks.length; i++) {
            const check = field_checks[i];
            const result = check.check(modal.get(check.field), modal);
            if (!result) {
                modal.focus(check.field);
                inputs_log.update(check.error, Log.ERROR);
                setTimeout(() => { inputs_log.delete(); }, 2000);
                resolve(false);
                return;
            }
        }
        inputs_log.update("Vérification des entrées ... OK", Log.SUCCESS);
        setTimeout(() => { inputs_log.delete() }, 500);

        const err_log = modal.log("Erreur : Inscription non implémentée.", Log.ERROR);
        setTimeout(() => {
            err_log.delete();
            setTimeout(() => { resolve(false); }, 500);
        }, 2000);
    });
}

export default {
    components: {
        Topbar,
        Modal,
        InputText,
        InputSwitch
    },
    name: 'Register',
    methods: {
        onCancel,
        onValidate
    },
    data() {
        return { User }
    }
}
</script>