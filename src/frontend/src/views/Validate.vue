<template>
    <div class="flex grow flex-col">
        <topbar v-if="User.CurrentUser != null"></topbar>
        <div class="flex grow w-fit flex-col justify-center mx-auto">
            <card class="flex-col space-y-6">
                <p class="text-4xl font-bold text-slate-500 text-center"> Validation du compte </p>
                <p ref="msg" class="text-lg font-semibold text-slate-500 text-center"> Validation de votre compte ... </p>
            </card>
        </div>
    </div>
</template>

<script>
import Topbar from '../components/topbar/Topbar.vue';
import Modal from '../components/cards/Modal.vue';
import Card from '../components/cards/Card.vue';
import API from '../scripts/API';
import User from '../scripts/User';

export default {
    components: {
        Topbar,
        Modal,
        Card
    },
    name: 'Register',
    methods: {
        
    },
    data() {
        return { User }
    },
    mounted() {
        const msg = this.$refs["msg"];
        const token = this.$route.query.token;
        
        if (!token) {
            msg.classList.remove("text-slate-500");
            msg.classList.add("text-red-500");
            msg.innerText = "Erreur : Aucun token de validation n'a été fourni.";
            return;
        }
        const creds = new API.Credentials({ token: "bearer " + token, type: API.Credentials.TYPE.TOKEN });

        API.execute_logged(API.ROUTE.VERIFY, API.METHOD.PATCH, creds).then(res => {
            msg.classList.remove("text-slate-500");
            msg.classList.add("text-teal-500");
            msg.innerText = "Compte validé avec succès ! Vous pouvez fermer cette page.";
        }).catch(err => {
            msg.classList.remove("text-slate-500");
            msg.classList.add("text-red-500");
            msg.innerText = "Erreur : " + err.message;
        });
    }
}
</script>