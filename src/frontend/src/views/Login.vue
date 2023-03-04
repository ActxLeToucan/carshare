<template>
    <div class="flex grow flex-col">
        <topbar v-if="User.CurrentUser != null"></topbar>
        <div class="flex grow w-fit flex-col justify-center space-y-6 mx-auto min-w-0 max-w-full">
            <modal :oncancel="onCancel" :onvalidate="onValidate" :title="lang.LOGIN_TITLE">
                <div class="py-4">
                    <p class="text-lg font-semibold text-slate-500"> {{ lang.LOGIN_DESC }}. </p>
                </div>
                <input-text   name="email"            :label="lang.EMAIL"        :placeholder="lang.EMAIL"           type="email"    ></input-text>
                <input-text   name="password"         :label="lang.PASSWORD"     :placeholder="lang.PASSWORD"        type="password" ></input-text>
                <router-link to="/recovery" class="flex items-center justify-center w-fit h-fit text-slate-400 hover:text-teal-500 transition-all">
                    <p class="text-md font-bold whitespace-nowrap text-ellipsis max-w-full min-w-0 w-fit h-fit max-h-full min-h-0"> {{ lang.FORGOT_PASSWORD }} ? </p>
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
import API from '../scripts/API';
import Lang from '../scripts/Lang';

const field_checks = [
    {field: "email",            check: (value) => value.length > 0, error: "Veuillez renseignez votre adresse mail."},
    {field: "password",         check: (value) => value.length > 0, error: "Veuillez renseignez votre mot de passe."}
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
        return { User, lang: Lang.CurrentLang }
    },
    mounted() {
        Lang.addCallback(lang => this.lang = lang);
    }
}
</script>