<template>
    <div class="flex grow flex-col">
        <topbar v-if="User.CurrentUser != null"></topbar>
        <div class="flex grow w-fit flex-col justify-center space-y-6 mx-auto">
            <modal :oncancel="onCancel" :onvalidate="onValidate" title="Se connecter">
                <input-text   name="email"            label="Email"        placeholder="Adresse mail"                 type="email"    ></input-text>
                <input-text   name="password"         label="Mot de passe" placeholder="Mot de passe"                 type="password" ></input-text>
                <router-link to="/recovery" class="flex items-center justify-center w-fit h-fit text-slate-400 hover:text-teal-500 transition-all">
                    <p class="text-md font-bold whitespace-nowrap text-ellipsis max-w-full min-w-0 w-fit h-fit max-h-full min-h-0"> Mot de passe oublié ? </p>
                </router-link>
            </modal>
        </div>
    </div>
</template>

<script>
import Topbar from '../components/topbar/Topbar.vue';
import Modal from '../components/cards/Modal.vue';
import InputText from '../components/inputs/InputText.vue';
import { Log } from '../scripts/Logs';
import User from '../scripts/User';
import re from '../scripts/Regex';
import API from '../scripts/API';

const field_checks = [
    {field: "email",            check: (value) => value.length > 0, error: "Veuillez renseignez votre adresse mail."},
    {field: "password",         check: (value) => value.length > 0, error: "Veuillez renseignez votre mot de passe."},

    {field: "email",            check: (value) => value.length <= 64,               error: "L'adresse mail est trop longue."},
    {field: "email",            check: (value) => value.match(re.REGEX_EMAIL) != null, error: "L'adresse mail n'est pas valide."},

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
                setTimeout(() => { log.delete(); }, 2000);
                resolve(false);
                return;
            }
        }
        log.update("Envoi des données ...", Log.INFO);

        const payload = modal.getPayload();
        const userInfos = {
            "email": payload.email,
            "password": payload.password
        };

        API.execute(API.ROUTE.LOGIN, API.METHOD.POST, userInfos, API.TYPE.JSON).then(res => {
            log.update("Connecté avec succès !", Log.SUCCESS);

            const user = new User({id: res.userId, token: res.token});
            user.save();

            setTimeout(() => {
                log.delete();
                resolve(true);
            }, 2000);
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
        InputText
    },
    name: 'Login',
    methods: {
        onCancel,
        onValidate
    },
    data() {
        return { User }
    }
}
</script>