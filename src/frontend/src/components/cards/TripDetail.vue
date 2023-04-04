<template>
    <div class="relative flex flex-col grow w-full h-fit min-h-0 min-w-[60vw]">
        <p
            v-if="trip != null"
            class="md:absolute text-xl font-semibold md:text-center text-slate-500 md:mb-4"
        >
            {{ (trip?.status == -1)? lang.CANCELED : ((trip?.status == 1)? lang.FINISHED : '') }}
        </p>
        <h1
            v-if="trip != null"
            class="text-xl font-bold text-center text-teal-500 mb-4"
        >
            {{ lang.TRAVEL_CARD_LABEL.replace('{DATE}', new Date(trip.steps[0]?.date).toLocaleDateString()) }}
        </h1>
        <div
            v-if="trip != null"
            class="flex md:flex-row flex-col grow min-w-0 w-full h-fit md:space-y-0 space-y-4"
        >
            <div class="flex grow mx-auto flex-col md:w-[50%] w-fit max-w-full justify-center items-center md:pr-4">
                <p class="text-xl text-slate-600 dark:text-slate-300 font-bold whitespace-nowrap text-ellipsis mb-1">
                    {{ lang.TRIP_DESTINATIONS }}
                </p>
                <div class="flex flex-col grow h-fit w-fit space-y-2 w-full overflow-y-auto max-h-min min-h-[4em]">
                    <button
                        v-for="(step, index) in trip.steps"
                        :key="step.id"
                        class="flex h-fit w-full justify-between items-center space-x-10 rounded-md border-2 py-1 px-2"
                        :class="(index < startIndex || index > endIndex) ? ' bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 ' + (!editMode? 'hover:border-slate-300 hover:dark:border-slate-500' : 'cursor-default') : ' bg-white dark:bg-slate-600 border-slate-300 dark:border-slate-500 ' + (!editMode? 'hover:border-slate-400 hover:dark:border-slate-400' : 'cursor-default')"
                        @click="toogleStep(index)"
                    >
                        <p
                            class="text-xl font-bold whitespace-nowrap text-ellipsis overflow-hidden"
                            :class="(index < startIndex || index > endIndex) ? ' text-slate-400 dark:text-slate-500' : ' text-slate-500 dark:text-slate-200'"
                        >
                            {{ step.city }}
                        </p>
                        <p
                            class="text-lg font-semibold whitespace-nowrap"
                            :class="(index < startIndex || index > endIndex) ? ' text-slate-300 dark:text-slate-500' : ' text-slate-400 dark:text-slate-300'"
                        >
                            {{ new Date(step.date).toLocaleTimeString().substring(0, 5) }}
                        </p>
                    </button>
                </div>
                <div class="flex flex-col grow rounded-lg bg-slate-200 dark:bg-slate-600 border-2 border-slate-200 dark:border-slate-600 w-fit min-w-full max-w-full mt-4">
                    <p class="text-xl text-slate-600 dark:text-slate-200 font-bold mx-2 mb-1 whitespace-nowrap text-ellipsis overflow-hidden">
                        {{ lang.TRIP_INFO }}
                    </p>
                    <div class="flex grow rounded-md bg-white dark:bg-slate-700 p-2">
                        <p class="text-lg text-slate-500 dark:text-slate-300 font-semibold text-ellipsis overflow-hidden">
                            {{ trip.description }}
                        </p>
                    </div>
                </div>
            </div>
            <div class="flex grow justify-center items-center">
                <span class="hidden md:flex grow h-40 w-1 bg-slate-200 dark:bg-slate-700 rounded-md" />
                <span class="md:hidden flex grow mx-8 h-1 bg-slate-200 dark:bg-slate-700 rounded-md" />
            </div>
            <div class="flex grow mx-auto flex-col md:w-[50%] w-fit max-w-full items-center md:pl-4 space-y-4">
                <div class="flex flex-col h-50% w-full">
                    <p class="text-xl text-slate-600 dark:text-slate-300 font-bold mx-2 mb-1 mr-auto">
                        {{ lang.PASSENGERS }}
                    </p>
                    <div class="flex bg-white dark:bg-slate-700 rounded-md border-2 border-slate-200 dark:border-slate-600 p-2 w-full min-h-[8em] items-center overflow-x-auto">
                        <p
                            v-show="trip.passengers?.length == 0"
                            class="text-slate-500 dark:text-slate-400 text-lg font-semibold w-fit mx-auto"
                        >
                            {{ lang.NO_PASSENGERS }}.
                        </p>
                        <button
                            v-for="passenger in trip.passengers"
                            :id="'passenger-' + passenger.id"
                            :ref="'passenger-' + passenger.id"
                            :key="passenger.id"
                            :class="passenger.id == User.CurrentUser.id ? 'bg-slate-200 dark:bg-slate-600 cursor-default' : 'bg-slate-100 dark:bg-slate-500 hover:border-slate-300 hover:dark:border-slate-400 cursor-pointer'"
                            class="mx-2 border-2 border-transparent rounded-md px-2 py-1 max-w-[6em] justify-center hover:max-w-[20em] transition-all"
                            @click="displayNotation(passenger)"
                        >
                            <user-icon class="w-full text-slate-600 dark:text-slate-50 w-8 h-8" />
                            <p class="text-lg text-slate-600 dark:text-slate-50 font-semibold text-center whitespace-nowrap text-ellipsis overflow-hidden"> {{ passenger.firstName + ' ' + passenger.lastName.substring(0, 1) + '.' }} </p>
                        </button>
                    </div>
                </div>

                <div class="flex h-50% w-full">
                    <div class="flex w-[50%] justify-evenly items-center">
                        <div class="flex flex-col">
                            <p class="text-xl text-slate-600 dark:text-slate-300 font-bold mx-2 mb-1 mx-auto text-center">
                                {{ lang.DRIVER }}
                            </p>
                            <button
                                :id="'passenger-' + trip.driver.id"
                                :ref="'passenger-' + trip.driver.id"
                                class="flex flex-col justify-center items-center bg-white dark:bg-slate-700 m-2 px-2 h-20 min-w-[5em] max-w-[10em] items-center rounded-md mx-auto border-2 border-transparent"
                                :class="trip.driver.id == User.CurrentUser.id ? ' cursor-default' : ' hover:border-slate-200 hover:dark:border-slate-400 cursor-pointer transition-all'"
                                @click="displayNotation(trip.driver)"
                            >
                                <div class="flex w-11 h-11 mx-auto">
                                    <user-icon class="w-10 text-slate-500 dark:text-slate-400 mx-auto" />
                                </div>
                                <p class="text-slate-500 dark:text-slate-300 text-lg font-semibold max-w-full whitespace-nowrap text-ellipsis overflow-hidden">
                                    {{ trip.driver.firstName + " " + trip.driver.lastName.substring(0, 1) + "." }}
                                </p>
                            </button>
                        </div>
                    </div>

                    <div class="flex w-[50%] justify-evenly items-center">
                        <div class="flex flex-col">
                            <p class="text-xl text-slate-600 dark:text-slate-300 font-bold mx-2 mb-1 mx-auto text-center">
                                {{ lang.PRICE }}
                            </p>
                            <div class="flex flex-col justify-center items-center m-2 h-20 w-20 items-center bg-white dark:bg-slate-700 rounded-md mx-auto">
                                <p class="text-slate-500 dark:text-slate-300 text-2xl font-bold">
                                    {{ trip.price + " €" }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div
            v-show="trip != null && !editMode && (User.CurrentUser.id !== trip?.driver?.id || isPast)"
            class="flex w-full justify-center items-center my-4"
        >
            <button-block :action="bookTrip">
                {{ lang.BOOK_TRIP }}
            </button-block>
        </div>
        <div
            v-show="editMode && (User.CurrentUser.id === trip?.driver?.id)"
            class="flex md:flex-row flex-col w-full justify-between items-center my-4 md:space-y-0 space-y-2"
        >
            <button-block
                v-show="trip != null && !isPast"
                class="max-w-full"
                color="teal"
                :href="trip?.id ? '/trips/edit?id=' + trip?.id : undefined"
                :disabled="trip?.status != 0"
            >
                {{ lang.EDIT_TRIP }}
            </button-block>
            <button-block
                v-show="trip != null"
                class="max-w-full"
                :action="endTravel"
                :disabled="trip?.status != 0"
            >
                {{ lang.MARK_AS_FINISHED }}
            </button-block>
            <button-block
                v-show="trip != null && !isPast"
                class="max-w-full"
                color="red"
                :action="removeTravel"
                :disabled="trip?.status != 0"
            >
                {{ lang.CANCEL_TRIP }}
            </button-block>
        </div>
        <div
            v-show="trip != null"
            ref="log-zone"
            class="flex flex-col w-full justify-center items-center min-h-max h-max transition-all"
            style="max-height: 0px;"
        />
        <div
            v-show="state == 'loading'"
            class="w-40 h-40 justify-center items-center flex mx-auto"
        >
            <card-badge
                :title="lang.LOADING_TRIP"
                :content="lang.LOADING_TRIP_DESC"
            />
        </div>
        <div
            id="notation-div"
            ref="notation-div"
            class="flex absolute bg-slate-50 border-2 border-slate-200 rounded-lg shadow-lg p-2 w-fit h-fit"
            style="display: none;"
        >
            <p
                v-show="loadingNotations"
                class="text-center text-slate-500 dark:text-slate-300 font-semibold text-lg"
            >
                ...
            </p>
            <button
                v-for="i in [1, 2, 3, 4, 5]"
                v-show="!loadingNotations"
                :key="i"
                class="inline w-7 h-7 text-slate-400 dark:text-slate-400 mx-0.5"
                @click="setNotation(i)"
            >
                <star-icon v-if="currentEvaluation?.note < i || currentEvaluation == null" />
                <star-icon-solid
                    v-if="currentEvaluation?.note >= i"
                    class="text-yellow-500"
                />
            </button>
        </div>
    </div>
</template>

<script>
import API from '../../scripts/API';
import Lang from "../../scripts/Lang";
import User from "../../scripts/User";
import ButtonBlock from "../inputs/ButtonBlock.vue";
import { Log, LogZone } from "../../scripts/Logs";

import { StarIcon as StarIconSolid } from '@heroicons/vue/24/solid';
import {
    UserIcon,
    StarIcon
} from '@heroicons/vue/24/outline';
import CardBadge from './CardBadge.vue';

export default {
    name: "TripDetail",
    components: {
        ButtonBlock,
        UserIcon,
        CardBadge,
        StarIcon,
        StarIconSolid
    },
    props: {
        tripId: {
            type: [Number, String, null],
            required: true,
        },
        tripStart: {
            type: [Object, String, null],
            required: true,
        },
        tripEnd: {
            type: [Object, String, null],
            required: true,
        },
        editMode: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    data() {
        return {
            User,
            lang: Lang.CurrentLang,
            trip: null,
            startIndex: null,
            endIndex: null,
            isPast: false,
            state: null,
            notationDiv: null,
            evaluatedUser: null,
            loadingNotations: false,
            currentEvaluation: null,
        };
    },
    watch: {
        tripId: function (newVal, oldVal) {
            this.loadTrip(newVal);
        },
        tripStart: function (newVal, oldVal) {
            this.loadTrip(this.tripId);
        },
        tripEnd: function (newVal, oldVal) {
            this.loadTrip(this.tripId);
        },
    },
    mounted() {
        Lang.AddCallback((lang) => (this.lang = lang));
        this.loadTrip(this.id);

        this.logZone = new LogZone(this.$refs["log-zone"]);
    },
    methods: {
        loadTrip(id) {
            if (id == null) return;
            this.trip = null;
            this.state = "loading";

            API.execute_logged(API.ROUTE.TRAVELS.GET + "/" + id, API.METHOD.GET, User.CurrentUser.getCredentials()).then(res => {
                this.trip = res;

                this.startIndex = (this.tripStart)? this.trip?.steps.findIndex(step => step.city == this.tripStart.value) : 0;
                this.endIndex   = (this.tripEnd)? this.trip?.steps.findIndex(step => step.city == this.tripEnd.value) : this.trip.steps.length - 1;

                this.isPast = new Date(this.trip.steps[this.trip.steps.length - 1].date) < new Date();
                this.state = "done";
            }).catch(err => {
                console.error(err);
                this.popup?.hide();
                this.state = "error";
            });
        },
        log(msg, type = Log.INFO) {
            if (!this.logZone) return null;
            const log = new Log(msg, type);
            log.attachTo(this.logZone);
            return log;
        },
        bookTrip() {
            const log = this.log("Envoi de la demande ...", Log.INFO);

            API.execute_logged(API.ROUTE.BOOKINGS.MY.NEW, API.METHOD.POST, User.CurrentUser.getCredentials(), {
                travelId: this.trip.id,
                departureId: this.trip.steps[this.startIndex].id,
                arrivalId: this.trip.steps[this.endIndex].id,
            }).then(res => {
                log.update(res.message, Log.SUCCESS);
                setTimeout(() => { log.delete(); this.popup?.hide(); }, 4000);
            }).catch(err => {
                log.update(Lang.CurrentLang.ERROR + " : " + err.message, Log.ERROR);
                setTimeout(() => { log.delete(); }, 6000);
                console.error(err);
            });
        },
        removeTravel() {
            const log = this.log(Lang.CurrentLang.CANCELLING_TRIP + " ...", Log.INFO);

            API.execute_logged(API.ROUTE.TRAVELS.MY + "/" + this.trip.id, API.METHOD.DELETE, User.CurrentUser.getCredentials()).then(res => {
                log.update(Lang.CurrentLang.TRIP_CANCELLED, Log.SUCCESS);
                setTimeout(() => { log.delete(); this.popup?.hide(); this.$router.go(); }, 2000); // TODO : change reload to something better
            }).catch(err => {
                log.update(Lang.CurrentLang.ERROR + " : " + err.message, Log.ERROR);
                setTimeout(() => { log.delete(); }, 4000);
                console.error(err);
            });
        },
        endTravel() {
            const log = this.log(Lang.CurrentLang.MARKING_TRIP_AS_FINISHED + " ...", Log.INFO);

            API.execute_logged(API.ROUTE.TRAVELS.MY + "/" + this.trip.id + "/end", API.METHOD.PATCH, User.CurrentUser.getCredentials()).then(res => {
                log.update(Lang.CurrentLang.TRIP_MARKED_AS_FINISHED, Log.SUCCESS);
                setTimeout(() => { log.delete(); this.popup?.hide(); this.$router.go(); }, 2000);
            }).catch(err => {
                log.update(Lang.CurrentLang.ERROR + " : " + err.message, Log.ERROR);
                setTimeout(() => { log.delete(); }, 4000);
                console.error(err);
            });
        },
        setPopup(popup) {
            this.popup = popup;
        },
        toogleStep(index) {
            if (this.editMode) return;

            const mid = (this.startIndex + this.endIndex) / 2;
            if (index < mid) {
                this.startIndex = index;
            } else {
                this.endIndex = index;
            }
            this.$forceUpdate();
        },
        setEval(ev) {
            this.currentEvaluation = ev;
        },
        displayNotation(passenger) {
            const getElement = el => {
                if (!el) return null;

                while (!el.id.startsWith("passenger") && el.id !== "notation-div" && el.parentElement) {
                    el = el.parentElement;
                }

                if (!el.parentElement) return null;
                return el;
            };

            if (!passenger || passenger.id === User.CurrentUser.id) return;
            const target = getElement(this.$el.querySelector("#passenger-" + passenger.id));
            if (!target) return;

            if (this.notationDiv == null) {
                this.notationDiv = this.$el.querySelector("#notation-div");
                document.body.appendChild(this.notationDiv);
            }
            this.notationDiv.style.display = "block";

            const listener = (e) => {
                if (getElement(e.target) == null) {
                    this.notationDiv.style.display = "none";
                    document.removeEventListener("click", listener);
                }
            };
            document.addEventListener("click", listener);

            const rect = this.notationDiv.getBoundingClientRect();
            const trect = target.getBoundingClientRect();
            this.notationDiv.style.top = trect.top + trect.height + 10 + "px";
            this.notationDiv.style.left = trect.left + trect.width / 2 - rect.width / 2 + "px";
            setTimeout(() => { this.notationDiv.style.left = trect.left + trect.width / 2 - rect.width / 2 + "px"; }, 100);

            this.evaluatedUser = passenger;

            // loading notations
            this.loadingNotations = true;
            API.execute_logged(API.ROUTE.NOTATIONS.MY + API.createParameters({
                travelId: this.trip.id,
                evaluatedId: passenger.id,
            }), API.METHOD.GET, User.CurrentUser?.getCredentials()).then(res => {
                this.setEval(res.evaluation);
            }).catch(err => {
                console.error(err);
            }).finally(() => {
                this.loadingNotations = false;
            });
        },
        setNotation(n) {
            if (this.currentEvaluation === null) {
                API.execute_logged(API.ROUTE.NOTATIONS.MY, API.METHOD.POST, User.CurrentUser?.getCredentials(), {
                    travelId: this.trip.id,
                    evaluatedId: this.evaluatedUser.id,
                    note: n,
                }).then(res => {
                    this.setEval(res.evaluation);
                }).catch(err => {
                    console.error(err);
                }).finally(() => {
                    this.loadingNotations = false;
                });
            } else {
                if (this.currentEvaluation.note == n) {
                    API.execute_logged(API.ROUTE.NOTATIONS.ALL + '/' + this.currentEvaluation.id, API.METHOD.DELETE, User.CurrentUser?.getCredentials()).then(res => {
                        this.setEval(null);
                    }).catch(err => {
                        console.error(err);
                    }).finally(() => {
                        this.loadingNotations = false;
                    });
                } else {
                    API.execute_logged(API.ROUTE.NOTATIONS.ALL + '/' + this.currentEvaluation.id, API.METHOD.PATCH, User.CurrentUser?.getCredentials(), {note: n}).then(res => {
                        this.currentEvaluation.note = n;
                    }).catch(err => {
                        console.error(err);
                    }).finally(() => {
                        this.loadingNotations = false;
                    });
                }
            }
        }
    },
};
</script>
