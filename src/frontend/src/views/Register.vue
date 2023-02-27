<template>
    <div class="flex grow flex-col">
        <topbar v-if="User.CurrentUser != null"></topbar>
        <div class="flex grow w-fit flex-col justify-center space-y-6 mx-auto">
            <modal :oncancel="onCancel" :onvalidate="onValidate" title="S'inscrire">
                <div class="py-4">
                    <p class="text-lg font-semibold text-slate-500"> Veuillez renseigner vos informations pour vous inscrire. </p>
                </div>
                <input-text   name="firstName"        label="Prénom"       placeholder="Prénom"                                       ></input-text>
                <input-text   name="lastName"         label="Nom"          placeholder="Nom de famille"                               ></input-text>
                <input-text   name="email"            label="Email"        placeholder="Adresse mail"                 type="email"    ></input-text>
                <input-text   name="phone"            label="Téléphone"    placeholder="Numéro de téléphone"          type="tel"      ></input-text>
                <input-text   name="password"         label="Mot de passe" placeholder="Mot de passe"                 type="password" ></input-text>
                <input-text   name="password-confirm" label="Confirmation" placeholder="Confirmation du mot de passe" type="password" ></input-text>
                <input-choice name="gender"           label="Genre"        :list="genres"                                             ></input-choice>
                <input-switch name="hasCar"           label="J'ai une voiture"                                        value="false"   ></input-switch>
            </modal>
        </div>
    </div>
</template>

<script>
import Topbar from '../components/topbar/Topbar.vue';
import Modal from '../components/cards/Modal.vue';
import InputText from '../components/inputs/InputText.vue';
import InputSwitch from '../components/inputs/InputSwitch.vue';
import InputChoice from '../components/inputs/InputChoice.vue';
import { Log } from '../scripts/Logs';
import User from '../scripts/User';
import re from '../scripts/Regex';
import API from '../scripts/API';

function isPhoneNumber(val) {
    if (!val) return false;
    return val.replace(/(\.|\s|-)/g, "").trim().match(/^((00[0-9]{2})?0[0-9][0-9]{8}|\+[0-9]{11,12})$/) != null;
}

const genres = [
    {value: 1, label: "Homme"},
    {value: -1, label: "Non spécifié", selected: true},
    {value: 0, label: "Femme"},
];

const field_checks = [
    {field: "firstName",        check: (value) => value.length > 0, error: "Veuillez renseignez votre nom."},
    {field: "lastName",         check: (value) => value.length > 0, error: "Veuillez renseignez votre prénom."},
    {field: "email",            check: (value) => value.length > 0, error: "Veuillez renseignez votre adresse mail."},
    {field: "phone",            check: (value) => value.length > 0, error: "Veuillez renseignez votre numéro de téléphone."},
    {field: "password",         check: (value) => value.length > 0, error: "Veuillez renseignez votre mot de passe."},
    {field: "password-confirm", check: (value) => value.length > 0, error: "Veuillez confirmer votre mot de passe."},

    {field: "firstName",        check: (value) => value.length <= 50,               error: "Le nom est trop long."},
    {field: "lastName",         check: (value) => value.length <= 50,               error: "Le prénom est trop long."},
    {field: "email",            check: (value) => value.length <= 64,               error: "L'adresse mail est trop longue."},
    {field: "email",            check: (value) => value.match(re.REGEX_EMAIL) != null, error: "L'adresse mail n'est pas valide."},
    {field: "phone",            check: (value) => isPhoneNumber(value),             error: "Le numéro de téléphone est invalide."},

    {field: "password-confirm", check: (value, modal) => value === modal.get("password"), error: "Les mots de passe ne correspondent pas."},
    {field: "password",         check: (value) => value.length >= 10,                     error: "Le mot de passe doit faire au moins 10 caractères."},
    {field: "password",         check: (value) => value.match(/[A-Z]/g) != null,          error: "Le mot de passe doit contenir au moins une majuscule."},
    {field: "password",         check: (value) => value.match(/[a-z]/g) != null,          error: "Le mot de passe doit contenir au moins une minuscule."},
    {field: "password",         check: (value) => value.match(/[0-9]/g) != null,          error: "Le mot de passe doit contenir au moins un chiffre."},
    {field: "password",         check: (value) => value.match(/[^A-Za-z0-9]/g) != null,   error: "Le mot de passe doit contenir au moins un caractère spécial."}
];

function onCancel(modal) {
    return true;
}

function onValidate(modal) {
    return new Promise((resolve, reject) => {
        const log = modal.log("Vérification des entrées ...", Log.INFO);
        for (let i = 0; i < field_checks.length; i++) {
            const check = field_checks[i];
            const result = check.check(modal.get(check.field), modal);
            if (!result) {
                modal.focus(check.field);
                log.update(check.error, Log.WARNING);
                setTimeout(() => { log.delete(); }, 4000);
                resolve(false);
                return;
            }
        }
        log.update("Envoi des données ...", Log.INFO);

        const payload = modal.getPayload();
        const userInfos = {
            "email": payload.email,
            "password": payload.password,
            "firstName": payload.firstName,
            "lastName": payload.lastName,
            "phone": payload.phone,
            "gender": parseInt(payload.gender),
            "hasCar": payload.hasCar === "true"
        };

        API.execute(API.ROUTE.SIGNUP, API.METHOD.POST, userInfos, API.TYPE.JSON).then(res => {
            log.update("Compte créé avec succès !", Log.SUCCESS);

            const user = new User(res.user);
            user.setInformations({token: res.token});
            user.save();

            const email_log = modal.log("Envoi de l'email de vérification ...", Log.INFO);
            API.execute_logged(API.ROUTE.VERIFY, API.METHOD.POST, user.getCredentials(), {email: userInfos.email}, API.TYPE.JSON).then(res => {
                email_log.update("Email envoyé avec succès !", Log.SUCCESS);

                setTimeout(() => {
                    log.delete();
                    email_log.delete();
                    resolve(true);
                }, 2000);

            }).catch(err => {
                email_log.update("Erreur : " + err.message, Log.ERROR);
            
                setTimeout(() => {
                    log.delete();
                    email_log.delete();
                    resolve(false);
                }, 4000);
            });

        }).catch(err => {
            log.update("Erreur : " + err.message, Log.ERROR);
            
            setTimeout(() => {
                log.delete();
                resolve(false);
            }, 4000);
        });
    });
}

export default {
    components: {
        Topbar,
        Modal,
        InputText,
        InputSwitch,
        InputChoice
    },
    name: 'Register',
    methods: {
        onCancel,
        onValidate
    },
    data() {
        return { User, genres }
    }
}
</script>