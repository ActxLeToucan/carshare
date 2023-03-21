<template>
    <div class="flex grow flex-col">
        <topbar v-if="User.CurrentUser != null" />
        <div class="flex grow w-fit flex-col justify-center space-y-6 mx-auto">
            <card-modal
                :oncancel="onCancel"
                :onvalidate="onValidate"
                title="Réinitialiser le mot de passe"
            >
                <div class="py-4">
                    <p class="text-lg font-semibold text-slate-500">
                        Veuillez indiquer votre nouveau mot de passe.
                    </p>
                </div>
                <input-text
                    name="password"
                    label="Mot de passe"
                    type="password"
                />
                <input-text
                    name="password-confirm"
                    label="Confirmation"
                    placeholder="Confirmation du mot de passe"
                    type="password"
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

function isPhoneNumber(val) {
    if (!val) return false;
    return val.replace(/(\.|\s|-)/g, "").trim().match(/^((00[0-9]{2})?0[0-9][0-9]{8}|\+[0-9]{11,12})$/) != null;
}

const genres = [
    {value: 1, label: "Homme"},
    {value: -1, label: "Autre", selected: true},
    {value: 0, label: "Femme"},
];

const field_checks = [
    {field: "password",         check: (value) => value.length > 0, error: "Veuillez renseignez votre mot de passe."},
    {field: "password-confirm", check: (value) => value.length > 0, error: "Veuillez confirmer votre mot de passe."},

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
        const data = { "password": payload.password };
        const token = modal.$route.query.token;
        
        if (!token) {
            log.update("Erreur : Aucun token de réinitialisation n'a été fourni.", Log.ERROR);
            setTimeout(() => { log.delete(); }, 4000);
            resolve(false);
            return;
        }
        const creds = new API.Credentials({token: "bearer " + token, type: API.Credentials.TYPE.TOKEN});

        API.execute_logged(API.ROUTE.RESETPWD, API.METHOD.PATCH, creds, data, API.TYPE.JSON).then(res => {
            log.update("Mot de passe réinitialisé avec succès !", Log.SUCCESS);

            setTimeout(() => {
                log.delete();
                resolve("/login");
            }, 4000);
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
    name: 'ReinitView',
    components: {
        Topbar,
        CardModal,
        InputText,
    },
    data() {
        return { User, genres }
    },
    methods: {
        onCancel,
        onValidate
    }
}
</script>