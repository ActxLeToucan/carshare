<template>
    <div class="flex grow flex-col">
        <topbar v-if="User.CurrentUser != null" />
        <div class="flex grow w-fit flex-col justify-center space-y-6 mx-auto">
            <card-modal
                :oncancel="onCancel"
                :onvalidate="onValidate"
                title="Mot de passe oublié"
            >
                <div class="py-4">
                    <p class="text-lg font-semibold text-slate-500">
                        Vous avez oublié votre mot de passe ?
                    </p>
                    <p class="text-lg font-semibold text-slate-500">
                        Pas de soucis ! Nous vous enverrons un mail pour le réinitialiser.
                    </p>
                </div>
                <input-text
                    name="email"
                    label="Email"
                    placeholder="Adresse mail"
                    type="email"
                />
            </card-modal>
        </div>
    </div>
</template>

<script>
import Topbar from '../components/topbar/Topbar.vue';
import CardModal from '../components/cards/CardModal.vue';
import InputText from '../components/inputs/InputText.vue';
import { Log } from '../scripts/Logs';
import User from '../scripts/User';
import API from '../scripts/API';

const field_checks = [
    {field: "email",            check: (value) => value.length > 0, error: "Veuillez renseignez votre adresse email."}
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
        const data = { email: payload.email };

        API.execute(API.ROUTE.RESETPWD, API.METHOD.POST, data, API.TYPE.JSON).then(res => {
            log.update(res.message, Log.SUCCESS);

            setTimeout(() => {
                log.delete();
                resolve(true);
            }, 6000);
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
    name: 'RecoveryView',
    components: {
        Topbar,
        CardModal,
        InputText
    },
    data() {
        return { User }
    },
    methods: {
        onCancel,
        onValidate
    }
}
</script>