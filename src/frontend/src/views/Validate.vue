<template>
    <div class="flex grow flex-col">
        <topbar v-if="User.CurrentUser != null" />
        <div class="flex grow w-fit flex-col justify-center mx-auto">
            <card-border class="flex-col space-y-6">
                <p class="text-4xl font-bold text-slate-500 text-center">
                    {{ lang.VALIDATION_TITLE }}
                </p>
                <p
                    ref="msg"
                    class="text-lg font-semibold text-slate-500 text-center"
                >
                    {{ lang.VALIDATION_LOADING }} ...
                </p>
            </card-border>
        </div>../components/cards/Cardborder.vue
    </div>
</template>

<script>
import Topbar from '../components/topbar/Topbar.vue';
import CardBorder from '../components/cards/CardBorder.vue';
import API from '../scripts/API';
import User from '../scripts/User';
import Lang from '../scripts/Lang';

export default {
    name: 'ValidateView',
    components: {
        Topbar,
        CardBorder
    },
    data() {
        return { User, lang: Lang.CurrentLang }
    },
    mounted() {
        const msg = this.$refs["msg"];
        const token = this.$route.query.token;
        
        if (!token) {
            msg.classList.remove("text-slate-500");
            msg.classList.add("text-red-500");
            msg.innerText = this.lang.VALIDATION_NO_TOKEN;
            return;
        }
        const creds = new API.Credentials({ token: "bearer " + token, type: API.Credentials.TYPE.TOKEN });

        API.execute_logged(API.ROUTE.VERIFY, API.METHOD.PATCH, creds).then(res => {
            msg.classList.remove("text-slate-500");
            msg.classList.add("text-teal-500");
            msg.innerText = this.lang.VALIDATION_SUCCESS;
        }).catch(err => {
            msg.classList.remove("text-slate-500");
            msg.classList.add("text-red-500");
            msg.innerText = this.lang.ERROR + " : " + err.message;
        });
    },
    methods: {
        
    }
}
</script>