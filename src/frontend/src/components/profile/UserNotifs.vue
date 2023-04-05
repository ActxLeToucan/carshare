<template>
    <div class="md:show-up flex flex-col grow max-w-full">
        <p class="text-2xl text-teal-500 py-2 font-bold mx-auto">
            {{ lang.MY_NOTIFS }}
        </p>
        <div class="flex flex-col md:w-fit w-full md:mx-auto px-4 max-w-full">
            <div class="flex grow h-fit min-w-[60vw] md:max-w-[70vw] max-w-full">
                <div
                    v-show="loading && !minorLoading"
                    class="flex flex-col justify-center mx-auto max-w-full"
                >
                    <card-badge
                        :newline="true"
                        :title="lang.LOADING_NOTIFS"
                        :content="lang.LOADING_NOTIFS_DESC"
                    />
                </div>
                <div
                    v-if="!loading && error"
                    class="flex flex-col justify-center mx-auto max-w-full"
                >
                    <card-badge
                        :newline="true"
                        :title="lang.ERROR"
                        :content="error"
                    />
                </div>
                <div
                    v-if="notifs.length === 0 && !loading && !error"
                    class="flex flex-col justify-center mx-auto max-w-full"
                >
                    <card-badge
                        :newline="true"
                        :title="lang.NO_NOTIFS"
                        :content="lang.NO_NOTIFS_DESC"
                    />
                </div>
                <div
                    v-if="notifs.length > 0 && (!loading || minorLoading)"
                    class="flex-col w-full mb-12"
                >
                    <button-block
                        class="w-fit mt-8 ml-auto"
                        color="red"
                        :action="deleteAllShow"
                    >
                        <trash-icon class="w-7 h-7 mr-1.5 inline" />
                        <p class="inline">
                            {{ lang.DELETE_ALL }}
                        </p>
                    </button-block>

                    <card-border
                        v-for="notif in notifs"
                        :key="notif.id"
                        class="show-down py-4 my-4 rounded-lg px-4 hover:bg-slate-100 hover:dark:bg-slate-700 hover:dark:border-slate-600 transition-all w-full text-left text-slate-600 dark:text-slate-300"
                    >
                        <div class="w-full">
                            <button-block
                                class="float-right ml-2"
                                :disabled="notif.locked"
                                color="red"
                                :action="() => deleteOne(notif)"
                            >
                                <trash-icon class="w-7 h-7" />
                            </button-block>
                            <p class="font-bold">
                                <span class="text-slate-400 block md:mr-4 md:inline-block">{{
                                    new Date(notif.createdAt).toLocaleString()
                                }}</span>
                                <span class="">{{ notif.title }}</span>
                            </p>
                            <p class="whitespace-pre-wrap">
                                {{ notif.message }}
                            </p>
                            <div
                                v-if="notif.type === 'request' || notif.travelId"
                                class="flex md:flex-row flex-col mt-4 md:items-center"
                            >
                                <button-block
                                    v-if="notif.travelId"
                                    class="inline-block mb-2"
                                    :disabled="notif.locked"
                                    :action="() => showTravel(notif.travelId)"
                                >
                                    {{ lang.SEE_TRAVEL }}
                                </button-block>
                                <div
                                    v-if="notif.travelId && notif.type === 'request'"
                                    class="md:flex hidden inline-block border-l-2 border-slate-400 dark:border-slate-600 h-4 mx-4"
                                />
                                <span
                                    v-if="notif.type === 'request'"
                                    class="flex md:flex-row flex-col"
                                >
                                    <button-block
                                        class="inline-block mb-2 mr-4"
                                        :disabled="notif.locked"
                                        :action="() => acceptOrReject(notif, true)"
                                    >
                                        {{ lang.ACCEPT }}
                                    </button-block>
                                    <button-block
                                        class="inline-block"
                                        color="red"
                                        :disabled="notif.locked"
                                        :action="() => acceptOrReject(notif, false)"
                                    >
                                        {{ lang.REJECT }}
                                    </button-block>
                                </span>
                            </div>
                            <div
                                :ref="`log-notif-${notif.id}`"
                                class="flex flex-col w-full items-center h-fit overflow-hidden transition-all"
                                style="max-height: 0"
                            />
                        </div>
                    </card-border>
                    <button-block
                        v-show="isThereMore"
                        :disabled="loading"
                        class="w-fit mt-8 mx-auto"
                        :action="getNotifs"
                    >
                        <plus-icon class="w-7 h-7 mr-1.5 inline" />
                        <p class="inline">
                            {{ lang.LOAD_MORE }}
                        </p>
                    </button-block>
                </div>
            </div>
        </div>
        <card-popup
            color="red"
            :title="lang.DELETE_ALL_NOTIFS"
            :content="lang.DELETE_ALL_NOTIFS_CONFIRMATION"
            :cancel-label="lang.CANCEL"
            :validate-label="lang.DELETE"
            :onload="setDeleteAllPopup"
            :onvalidate="deleteAll"
        />
        <card-popup
            ref="trip-view"
            :cancel-label="lang.BACK"
            :show-validate="false"
        >
            <trip-detail
                :trip-start="null"
                :trip-end="null"
                :trip-id="travelId ?? null"
                :edit-mode="false"
            />
        </card-popup>
    </div>
</template>

<script>
import Lang from "../../scripts/Lang";
import API from "../../scripts/API";
import User from "../../scripts/User";
import CardBorder from "../cards/CardBorder.vue";
import CardBadge from "../cards/CardBadge.vue";
import ButtonBlock from "../inputs/ButtonBlock.vue";

import {
    TrashIcon,
    PlusIcon
} from "@heroicons/vue/20/solid";
import CardPopup from "../cards/CardPopup.vue";
import { Log, LogZone } from "../../scripts/Logs";
import TripDetail from "../cards/TripDetail.vue";

export default {
    name: "UserNotifs",
    components: {
        CardPopup,
        ButtonBlock,
        CardBorder,
        CardBadge,
        TrashIcon,
        PlusIcon,
        TripDetail
    },
    data() {
        return {
            lang: Lang.CurrentLang,
            notifs: [],
            loading: true,
            minorLoading: false,
            error: null,
            next: 0,
            travelId: null
        };
    },
    computed: {
        isThereMore() {
            return this.next !== 0 && this.next !== null;
        },
    },
    mounted() {
        Lang.AddCallback((lang) => (this.lang = lang));
        this.getNotifs();
        this.logZones = {};

        this.tripPreview = this.$refs["trip-view"];

        const interval = setInterval(() => {
            if (window.location.hash !== "#notifs") return;
            this.refreshNotifs();
        }, 4000);
    },
    methods: {
        getNotifs() {
            this.loading = true;
            API.execute_logged(
                API.ROUTE.MY_NOTIFS + API.createPagination(this.next),
                API.METHOD.GET,
                User.CurrentUser?.getCredentials()
            ).then((data) => {
                this.upsertNotifs(...data.data);
                this.next = data.next;
                this.minorLoading = true;
            }).catch((err) => {
                this.error = err.message;
                this.notifs = [];
            }).finally(() => {
                this.loading = false;
            });
        },
        upsertNotifs(...n) {
            const notifs = this.notifs;
            for (const notif of n) {
                const index = notifs.findIndex((n) => n.id === notif.id);
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
            const log = this.notifLog(notif, this.lang.DELETING + "...", Log.INFO);
            API.execute_logged(
                `${API.ROUTE.NOTIFS}/${notif.id}`,
                API.METHOD.DELETE,
                User.CurrentUser?.getCredentials()
            ).then((_) => {
                this.notifs = this.notifs.filter((n) => n.id !== notif.id);
                window.topbar?.fetchNotifs();
            }).catch((err) => {
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
            API.execute_logged(
                API.ROUTE.ALL_NOITFS,
                API.METHOD.DELETE,
                User.CurrentUser?.getCredentials()
            ).then((_) => {
                this.notifs = [];
                window.topbar?.fetchNotifs();
                log.update(this.lang.NOTIFS_DELETED, Log.SUCCESS);
                setTimeout(() => {
                    log.delete();
                    popup.hide();
                }, 2000);
            }).catch((err) => {
                log.update(this.lang.ERROR + " : " + err.message, Log.ERROR);
                setTimeout(() => {
                    log.delete();
                }, 6000);
            });
        },
        acceptOrReject(notif, accept) {
            notif.type = `request.${accept ? "accepted" : "rejected"}`;
            notif.locked = true;
            const log = this.notifLog(notif, this.lang.SENDING_RESPONSE + "...", Log.INFO);
            if (notif.bookingId === null) {
                log.update(this.lang.BOOKING_DOESNT_EXIST_ANYMORE, Log.ERROR);
                setTimeout(() => {
                    log.delete();
                    notif.locked = false;
                    notif.type = 'request';
                }, 6000);
                return;
            }
            API.execute_logged(
                accept
                    ? API.ROUTE.BOOKINGS.ACCEPT(notif.bookingId)
                    : API.ROUTE.BOOKINGS.REJECT(notif.bookingId),
                API.METHOD.PATCH,
                User.CurrentUser?.getCredentials()
            ).then((data) => {
                log.update(data.message, Log.SUCCESS);
                setTimeout(() => {
                    log.delete();
                    notif.locked = false;
                }, 6000);
            }).catch((err) => {
                log.update(this.lang.ERROR + " : " + err.message, Log.ERROR);
                setTimeout(() => {
                    log.delete();
                    notif.locked = false;
                    notif.type = 'request';
                }, 6000);
            });
        },
        notifLog(notif, msg, type = Log.INFO) {
            if (!this.logZones[notif.id]) {
                const dom = this.$refs["log-notif-" + notif.id][0];
                this.logZones[notif.id] = new LogZone(dom);
                if (!this.logZones[notif.id]) return;
            }
            const log = new Log(msg, type);
            log.attachTo(this.logZones[notif.id]);
            return log;
        },
        showTravel(travelId) {
            this.travelId = travelId;
            this.tripPreview?.show();
        },
        refreshNotifs() {
            const displayedCount = this.next;
            API.execute_logged(
                API.ROUTE.MY_NOTIFS + API.createPagination(0, 10), // Max 10 nouvelles notifs par requête (ca devrait aller)
                API.METHOD.GET,
                User.CurrentUser?.getCredentials()
            ).then((data) => {
                if (data.data.length > displayedCount) {
                    this.upsertNotifs(...data.data);
                    window.topbar?.fetchNotifs();
                }
            }).catch((err) => {
                this.error = err.message;
                this.notifs = [];
            });
        }
    },
};
</script>
