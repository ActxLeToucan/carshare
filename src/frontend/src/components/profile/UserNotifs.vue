<template>
    <div class="md:show-up flex flex-col grow">
        <p class="text-2xl text-teal-500 py-2 font-bold mx-auto"> {{ lang.MY_NOTIFS }} </p>
        <div class="flex flex-col grow justify-evenly">
            <div class="flex flex-col w-fit md:mx-auto mx-4">
                <card class="flex grow h-fit min-w-[60vw] md:max-w-[70vw]">
                    <div v-show="loading" class="flex flex-col justify-center mx-auto">

                        <div class="flex flex-col justify-center py-4 my-4 rounded-lg bg-slate-100 px-4">
                            <p class="text-xl text-center text-slate-500 font-bold mx-auto"> {{ lang.LOADING_NOTIFS }} </p>
                            <p ref="loading-desc" class="text-xl text-center text-slate-500 mx-auto"> {{ lang.LOADING_NOTIFS_DESC }} </p>
                        </div>

                    </div>
                    <div v-show="!loading && error" class="flex flex-col justify-center mx-auto">

                        <div class="flex flex-col justify-center py-4 my-4 rounded-lg bg-slate-100 px-4">
                            <p class="text-xl text-center text-slate-500 font-bold mx-auto"> {{ lang.ERROR }} </p>
                            <p ref="loading-desc" class="text-xl text-center text-slate-500 mx-auto"> {{ this.error }} </p>
                        </div>

                    </div>
                    <div v-if="notifs.length === 0 && !loading && !error" class="flex flex-col justify-center mx-auto">

                        <div class="flex flex-col justify-center py-4 my-4 rounded-lg bg-slate-100 px-4">
                            <p class="text-xl text-center text-slate-500 font-bold mx-auto"> {{ lang.NO_NOTIFS }} </p>
                            <p class="text-xl text-center text-slate-500 mx-auto"> {{ lang.NO_NOTIFS_DESC }} </p>
                        </div>

                    </div>
                    <div v-if="notifs.length > 0 && !loading" class="flex-col w-full">

                        <button v-for="notif in notifs" :key="notif.id"
                                class="flex py-4 my-4 rounded-lg bg-slate-100 px-4 border-2 border-transparent
                                    hover:border-slate-200 transition-all w-full text-left"
                        >
                            <p class="basis-1/3">{{notif.title}}</p>
                            <p class="basis-2/3"> {{ notif.message }} </p>

                        </button>

                    </div>
                </card>
            </div>
        </div>
    </div>
</template>

<script>
import Lang from '../../scripts/Lang'
import API from "../../scripts/API";
import User from "../../scripts/User";
import Card from "../cards/Card.vue";

export default {
    name: "UserNotifs",
    components: {Card},
    data() {
        return {
            lang: Lang.CurrentLang,
            notifs: [],
            loading: true,
            error: null
        }
    },
    mounted() {
        Lang.AddCallback(lang => this.lang = lang);
        this.getNotifs();
    },
    methods: {
        getNotifs() {
            this.loading = true;
            API.execute_logged(API.ROUTE.MY_NOTIFS, API.METHOD.GET, User.CurrentUser?.getCredentials()).then((data) => {
                console.log(data);
                this.notifs = data;
            }).catch(err => {
                console.error(err);
                this.error = err.message;
                this.notifs = [];
            }).finally(() => {
                this.loading = false;
            });
        }
    }
}
</script>