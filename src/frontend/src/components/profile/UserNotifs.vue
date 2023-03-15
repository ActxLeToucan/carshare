<template>
    <div class="md:show-up flex flex-col grow">
        <p class="text-2xl text-teal-500 py-2 font-bold mx-auto"> {{ lang.MY_NOTIFS }} </p>
        <div class="flex flex-col md:w-fit w-full md:mx-auto px-4">
            <div class="flex grow h-fit min-w-[60vw] md:max-w-[70vw]">
                <div v-show="loading && !minorLoading" class="flex flex-col justify-center mx-auto">

                    <div class="flex flex-col justify-center py-4 my-4 rounded-lg bg-slate-100 px-4">
                        <p class="text-xl text-center text-slate-500 font-bold mx-auto"> {{ lang.LOADING_NOTIFS }} </p>
                        <p ref="loading-desc" class="text-xl text-center text-slate-500 mx-auto"> {{ lang.LOADING_NOTIFS_DESC }} </p>
                    </div>

                </div>
                <div v-if="!loading && error" class="flex flex-col justify-center mx-auto">

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
                <div v-if="notifs.length > 0 && (!loading || minorLoading)" class="flex-col w-full mb-12">

                    <button-block class="w-fit mt-8 ml-auto" color="red" :action="deleteAllShow">
                        <trash-icon class="w-7 h-7 mr-1.5 inline"></trash-icon><p class="inline">{{ lang.DELETE_ALL }}</p>
                    </button-block>

                    <card v-for="notif in notifs" :key="notif.id"
                            class="py-4 my-4 rounded-lg px-4 hover:bg-slate-100 transition-all w-full text-left text-slate-600">
                        <div class="w-full">
                            <button-block class="float-right ml-2" :disabled="notif.locked" color="red" :action="() => deleteOne(notif)">
                                <trash-icon class="w-7 h-7"></trash-icon>
                            </button-block>
                            <p class="font-bold">
                                <span class="text-slate-400 block md:mr-4 md:inline-block">{{ new Date(notif.createdAt).toLocaleString() }}</span>
                                <span class="">{{ notif.title }}</span>
                            </p>
                            <p class="whitespace-pre-wrap"> {{ notif.message }} </p>
                            <div class="mt-4" v-if="notif.type === 'request'">
                                <button-block class="inline-block mr-4"         :action="() => acceptRequest(notif)">Accepter</button-block>
                                <button-block class="inline-block" color="red"  :action="() => refuseRequest(notif)">Refuser</button-block>
                            </div>
                            <div
                                :ref="`log-notif-${notif.id}`"
                                class="flex flex-col w-full items-center h-fit overflow-hidden transition-all"
                                style="max-height: 0;"
                            />
                        </div>
                    </card>
                    <button-block v-show="isThereMore" :disabled="loading" class="w-fit mt-8 mx-auto" :action="getNotifs">
                        <PlusIcon class="w-7 h-7 mr-1.5 inline"></PlusIcon><p class="inline">{{ lang.LOAD_MORE }}</p>
                    </button-block>

                </div>
            </div>
        </div>
        <popup
            color="red"
            :title="lang.DELETE_ALL_NOTIFS"
            :content="lang.DELETE_ALL_NOTIFS_CONFIRMATION"
            :cancelLabel="lang.CANCEL"
            :validateLabel="lang.DELETE"
            :onload="setDeleteAllPopup"
            :onvalidate="deleteAll"
        />
    </div>
</template>

<script>
import Lang from '../../scripts/Lang'
import API from "../../scripts/API";
import User from "../../scripts/User";
import Card from "../cards/Card.vue";
import ButtonBlock from "../inputs/ButtonBlock.vue";
import ButtonText from "../inputs/ButtonText.vue";
import ButtonTab from "../inputs/ButtonTab.vue";
import {TrashIcon, PlusIcon} from "@heroicons/vue/20/solid";
import Popup from "../cards/Popup.vue";
import {Log, LogZone} from "../../scripts/Logs";

export default {
    name: "UserNotifs",
    components: {Popup, ButtonTab, ButtonText, ButtonBlock, Card, TrashIcon, PlusIcon},
    data() {
        return {
            lang: Lang.CurrentLang,
            notifs: [],
            loading: true,
            minorLoading: false,
            error: null,
            next: 0
        }
    },
    mounted() {
        Lang.AddCallback(lang => this.lang = lang);
        this.getNotifs();
        this.logZones = {};
    },
    computed: {
        isThereMore() {
            return this.next !== 0 && this.next !== null;
        }
    },
    methods: {
        getNotifs() {
            this.loading = true;
            API.execute_logged(API.ROUTE.MY_NOTIFS + API.createPagination(this.next), API.METHOD.GET, User.CurrentUser?.getCredentials()).then((data) => {
                this.upsertNotifs(...data.data);
                this.next = data.next;
                this.minorLoading = true;
            }).catch(err => {
                this.error = err.message;
                this.notifs = [];
            }).finally(() => {
                this.loading = false;
            });
        },
        upsertNotifs(...n) {
            const notifs = this.notifs;
            for (const notif of n) {
                const index = notifs.findIndex(n => n.id === notif.id);
                if (index !== -1) {
                    notifs[index] = notif;
                } else {
                    notifs.push(notif);
                }
            }
            notifs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            this.notifs = notifs;
            return this.notifs.length - notifs.length;
        },
        deleteOne(notif) {
            notif.locked = true;
            const log = this.notifLog(notif, this.lang.DELETING + '...', Log.INFO);
            API.execute_logged(`${API.ROUTE.NOTIFS}/{notif.id}`, API.METHOD.DELETE, User.CurrentUser?.getCredentials()).then(_ => {
                this.notifs = this.notifs.filter(n => n.id !== notif.id);
            }).catch(err => {
                log.update(this.lang.ERROR + " : " + err.message, Log.ERROR);
                notif.locked = false;
                setTimeout(() => {
                    log.delete();
                }, 6000);
            });
        },
        setDeleteAllPopup(popup) {
            this.deleteAllPopup = popup;
        },
        deleteAllShow() {
            if (!this.deleteAllPopup) return;
            this.deleteAllPopup.show();
        },
        deleteAll(popup) {
            const log = popup.log(this.lang.DELETING_NOTIFS, Log.INFO);
            API.execute_logged(API.ROUTE.ALL_NOITFS, API.METHOD.DELETE, User.CurrentUser?.getCredentials()).then(_ => {
                this.notifs = [];
                log.update(this.lang.NOTIFS_DELETED, Log.SUCCESS);
                setTimeout(() => {
                    log.delete();
                    popup.hide();
                }, 2000);
            }).catch(err => {
                log.update(this.lang.ERROR + " : " + err.message, Log.ERROR);
                setTimeout(() => {
                    log.delete();
                }, 6000);
            });
        },
        acceptRequest(notif) {
            // TODO: send accept request with SENDER: ${notif.userId} and TRAVEL: ${notif.travelId} TO: ${notif.senderId}
            notif.type = 'request.old';
        },
        refuseRequest(notif) {
            // TODO: send refuse request with SENDER: ${notif.userId} and TRAVEL: ${notif.travelId} TO: ${notif.senderId}
            notif.type = 'request.old';
        },
        notifLog(notif, msg, type = Log.INFO) {
            if (!this.logZones[notif.id]) {
                const dom = this.$refs["log-notif-"+notif.id][0];
                this.logZones[notif.id] = new LogZone(dom);
                if (!this.logZones[notif.id]) return;
            }
            const log = new Log(msg, type);
            log.attachTo(this.logZones[notif.id]);
            return log;
        },
    }
}
</script>
