<template>
    <div class="flex grow flex-col">
        <topbar v-if="User.CurrentUser != null"></topbar>
        <div class="flex grow w-fit flex-col justify-center space-y-6 mx-auto min-w-0 max-w-full">
            <modal :oncancel="onCancel" :onvalidate="onValidate" :title="lang.REGISTER_TITLE">
                <div class="py-4">
                    <p class="text-lg font-semibold text-slate-500"> {{ lang.REGISTER_DESC }}. </p>
                </div>
                <input-text   name="firstName"        :label="lang.FIRSTNAME+'*'"   :placeholder="lang.FIRSTNAME"                        ></input-text>
                <input-text   name="lastName"         :label="lang.LASTNAME+'*'"    :placeholder="lang.LASTNAME"                         ></input-text>
                <input-text   name="email"            :label="lang.EMAIL+'*'"       :placeholder="lang.EMAIL"            type="email"    ></input-text>
                <input-text   name="phone"            :label="lang.PHONE+'*'"       :placeholder="lang.PHONE"            type="tel"      ></input-text>
                <input-text   name="password"         :label="lang.PASSWORD+'*'"    :placeholder="lang.PASSWORD"         type="password" ></input-text>
                <input-text   name="password-confirm" :label="lang.PWD_CONFIRM+'*'" :placeholder="lang.PASSWORD_CONFIRM" type="password" ></input-text>
                <input-choice name="gender"           :label="lang.GENDER"          :list="genres"                       :value="-1"     ></input-choice>
                <input-switch name="hasCar"           :label="lang.I_HAVE_A_CAR"                                         value="false"   ></input-switch>
                <p class="text-md font-semibold text-slate-500"> * {{ lang.REQUIRED_FIELDS }}. </p>
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
import User from '../scripts/User';
import re from '../scripts/Regex';
import API from '../scripts/API';
import Lang from '../scripts/Lang';
import { Log } from '../scripts/Logs';
import { genres } from '../scripts/data';

function isPhoneNumber(val) {
    if (!val) return false;
    return val.replace(/(\.|\s|-)/g, "").trim().match(/^((00[0-9]{2})?0[0-9][0-9]{8}|\+[0-9]{11,12})$/) != null;
}

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
        return { User, genres, lang: Lang.CurrentLang }
    },
    mounted() {
        Lang.addCallback(lang => this.lang = lang);
    }
}
</script>