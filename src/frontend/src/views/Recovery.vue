<template>
    <div class="flex grow flex-col">
        <topbar v-if="User.CurrentUser != null"></topbar>
        <div class="flex grow w-fit flex-col justify-center space-y-6 mx-auto">
            <modal :oncancel="onCancel" :onvalidate="onValidate" disabled="true" title="Mot de passe oublié">
                <div class="py-4">
                    <p class="text-lg font-semibold text-slate-500"> Vous avez oublié votre mot de passe ? </p>
                    <p class="text-lg font-semibold text-slate-500"> Pas de soucis ! Nous vous enverrons un email pour le réinitialiser. </p>
                </div>
                <input-text   name="email"            label="Email"        placeholder="Adresse mail"                 type="email"    ></input-text>
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
    {field: "email",            check: (value) => value.length <= 64,               error: "L'adresse mail est trop longue."},
    {field: "email",            check: (value) => value.match(re.REGEX_EMAIL) != null, error: "L'adresse mail n'est pas valide."}
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
        const data = { "email": payload.email };

        API.execute(API.ROUTE.RECOVERY, API.METHOD.POST, data, API.TYPE.JSON).then(res => {
            log.update("Email envoyé !", Log.SUCCESS);

            const user = new User(res.user);
            user.setInformations({token: res.token});
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
    name: 'Recover',
    methods: {
        onCancel,
        onValidate
    },
    data() {
        return { User }
    }
}
</script>