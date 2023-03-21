<template>
    <div class="flex grow flex-col max-w-full">
        <topbar v-show="User.CurrentUser != null" />
        <div class="flex grow flex-col">
            <p class="text-2xl text-teal-500 font-bold mx-auto md:my-4 my-2">
                {{ lang.CREATE_TRIP }}
            </p>
            <div class="flex md:hidden justify-evenly px-1 space-x-1">
                <button
                    class="p-2 my-2 border-2 w-[50%] h-fit text-md font-semibold transition-all"
                    :class="selectedTab == 0 ? 'bg-teal-500 border-teal-600 text-teal-900' : 'bg-slate-100 dark:bg-slate-700 border-transparent text-slate-500 dark:text-slate-400'"
                    @click="() => { selectedTab = 0; }"
                >
                    {{ lang.INFORMATIONS }}
                </button>

                <button
                    class="p-2 my-2 border-2 w-[50%] h-fit text-md font-semibold transition-all"
                    :class="selectedTab == 1 ? 'bg-teal-500 border-teal-600 text-teal-900' : 'bg-slate-100 dark:bg-slate-700 border-transparent text-slate-500 dark:text-slate-400'"
                    @click="() => { selectedTab = 1; }"
                >
                    {{ lang.STEPS }}
                </button>
            </div>
            <div class="flex md:flex-row flex-col grow h-full">
                <div
                    class="flex flex-col md:w-[50%] w-full grow md:px-2"
                    :class="isMobile? (selectedTab == 1 ? 'hidden' : 'show-right') : ''"
                >
                    <card-border class="flex flex-col w-fit mx-auto space-y-4 max-w-full">
                        <input-choice
                            name="trip-type"
                            :label="lang.TRIP_TYPE"
                            :list="tripTypes"
                            :onchange="val => selectedTripType = Number(val)"
                            :value="selectedTripType"
                        />
                        <input-text
                            class="max-w-full"
                            name="trip-slots"
                            :label="lang.TRIP_SLOTS"
                            type="number"
                            value="0"
                            min="0"
                        />
                        <input-text
                            class="max-w-full"
                            name="trip-price"
                            :label="lang.PRICE"
                            type="number"
                            value="0"
                            min="0"
                        />
                        <input-block
                            class="max-w-full"
                            name="trip-infos"
                            :label="lang.TRIP_INFO"
                            type="text"
                            value=""
                        />
                    </card-border>
                    <div class="flex flex-col grow justify-evenly items-center my-4 space-y-4">
                        <!-- GROUP SELECTION -->
                        <card-border v-show="selectedTripType == 1">
                            <div
                                v-show="selectedGroup == null"
                                class="flex flex-col justify-center"
                            >
                                <p class="text-slate-500 text-lg text-center font-base">
                                    {{ lang.SELECT_GROUP }}
                                </p>
                                <button
                                    class="p-2 mt-2 mx-auto text-slate-400 rounded-lg border-2 border-transparent hover:bg-slate-100 hover:border-slate-200 transition-all"
                                    @click="() => { $refs['group-popup'].show(); }"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke-width="1.5"
                                        stroke="currentColor"
                                        class="w-10 h-10"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                                        />
                                    </svg>
                                </button>
                            </div>
                            <div
                                v-show="selectedGroup != null"
                                class="flex flex-col justify-center"
                            >
                                <p class="text-slate-500 text-lg text-center font-base">
                                    {{ lang.GROUP_SELECTED }}
                                </p>
                                <button
                                    class="p-2 mt-2 mx-auto text-slate-400 rounded-lg border-2 border-transparent hover:bg-slate-100 hover:border-slate-200 transition-all"
                                    @click="() => { $refs['group-popup'].show(); }"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke-width="1.5"
                                        stroke="currentColor"
                                        class="w-10 h-10 mx-auto"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                                        />
                                    </svg>
                                    <p class="text-slate-500 text-lg text-center font-semibold">
                                        {{ selectedGroup?.name }}
                                    </p>
                                    <p class="text-slate-500 text-md text-center font-base">
                                        {{ selectedGroup?.users?.length }} {{ (selectedGroup?.users?.length == 1? lang.MEMBER: lang.MEMBERS) }}
                                    </p>
                                </button>
                            </div>
                        </card-border>
                    </div>
                    <div
                        ref="log-zone"
                        class="flex flex-col w-full items-center h-fit overflow-hidden transition-all"
                        style="max-height: 0px;"
                    />
                    <div class="flex w-full md:justify-evenly justify-between items-end my-4 md:px-0 px-4">
                        <button-text :action="goBack">
                            {{ lang.CANCEL }}
                        </button-text>
                        <button-block :action="showValidatePopup">
                            {{ lang.CREATE }}
                        </button-block>
                    </div>
                </div>

                <div class="md:flex hidden grow w-fit items-center justify-center py-[20vh]">
                    <span class="w-1 h-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
                </div>

                <div
                    class="flex flex-col md:w-[50%] grow w-full md:px-2"
                    :class="isMobile? (selectedTab == 0 ? 'hidden' : 'show-left') : ''"
                >
                    <div class="flex flex-col w-fit mx-auto max-w-full">
                        <!-- START SECTION -->
                        <card-border class="flex flex-col mb-2 p-2 w-full">
                            <input-text
                                ref="startstep-input"
                                class="my-1"
                                :label="lang.TRIP_START"
                                :onchange="e => { if (startStep.destination?.value != e.target.value) startStep.destination = null; }"
                                :value="startStep.destination?.value"
                            />
                            <selector
                                ref="start-selector"
                                :oncompletion="searchCities"
                                :onclick="city => { startStep.destination = city; }"
                                :onload="sel => sel.attachInput($refs['startstep-input'].$el.querySelector('input'))"
                            />
                            <input-text
                                ref="startstep-date" 
                                class="my-1"
                                :label="lang.DATE"
                                :value="startStep.datetime"
                                :onchange="e => setStartDate(e.target.value)"
                                type="datetime-local"
                            />
                        </card-border>

                        <div class="flex flex-col">
                            <div class="flex flex-col space-y-2">
                                <span class="h-4 w-1 bg-slate-300 dark:bg-slate-600 rounded-md mx-auto" />
                                <button
                                    class="flex rounded-md border-2 border-slate-400 dark:border-slate-500 w-fit mx-auto text-slate-500 shadow-none
                                            hover:border-teal-500 hover:text-teal-500 hover:shadow-md buttontransition-all"
                                    @click="addStep(0)"
                                >
                                    <plus-icon class="w-6 h-6" />
                                </button>
                                <span class="h-4 w-1 bg-slate-300 dark:bg-slate-600 rounded-md mx-auto" />
                            </div>

                            <!-- IN BETWEEN STEPS SECTION -->
                            <div
                                v-for="(step, index) in tripSteps"
                                :key="step.id"
                                class="flex flex-col"
                            >
                                <div class="flex items-center">
                                    <card-border class="flex flex-col w-full my-2 p-2">
                                        <div class="flex grow w-full h-0 justify-end">
                                            <button
                                                class="flex rounded-md h-fit w-fit text-slate-500 pl-2 hover:text-red-500 cursor-pointer -translate-y-4 translate-x-4 transition-all"
                                                @click="() => delStep(index)"
                                            >
                                                <x-mark-icon class="w-6 h-6" />
                                            </button>
                                        </div>
                                        <input-text
                                            class="my-1" 
                                            :name="'midpoint-input-' + index"
                                            :label="lang.TRIP_STEP + ' ' + (index+1)"
                                            type="text"
                                            :onchange="e => { if (step.destination?.value != e.target.value) step.destination = null; }"
                                            :value="step.destination?.value"
                                        />
                                        <selector
                                            :ref="'mid-selector-' + index"
                                            class="ml-auto"
                                            :oncompletion="searchCities"
                                            :onclick="city => { step.destination = city; }"
                                            :onload="sel => sel.attachInput($el.querySelector('input[name=midpoint-input-' + index + ']'))"
                                        />
                                        <input-text
                                            :ref="'midpoint-date-' + index" 
                                            class="my-1"
                                            :label="lang.DATE"
                                            :value="step.datetime"
                                            :onchange="e => setStepDate(index, e.target.value)"
                                            type="datetime-local"
                                        />
                                    </card-border>
                                </div>
                                <div class="flex flex-col space-y-2">
                                    <span class="h-4 w-1 bg-slate-300 dark:bg-slate-600 rounded-md mx-auto" />
                                    <button
                                        class="flex rounded-md border-2 border-slate-400 dark:border-slate-500 w-fit mx-auto text-slate-500 shadow-none
                                                hover:border-teal-500 hover:text-teal-500 hover:shadow-md transition-all"
                                        @click="() => addStep(index + 1)"
                                    >
                                        <plus-icon class="w-6 h-6" />
                                    </button>
                                    <span class="h-4 w-1 bg-slate-300 dark:bg-slate-600 rounded-md mx-auto" />
                                </div>
                            </div>
                        </div>

                        <!-- END STEP -->
                        <card-border class="flex flex-col mb-2 p-2 w-full">
                            <input-text
                                ref="endstep-input"
                                class="my-1"
                                :label="lang.TRIP_END"
                                :onchange="e => { if (endStep.destination?.value != e.target.value) endStep.destination = null; }"
                                :value="endStep.destination?.value"
                            />
                            <selector
                                ref="start-selector"
                                :oncompletion="searchCities"
                                :onclick="city => { endStep.destination = city; }"
                                :onload="sel => sel.attachInput($refs['endstep-input'].$el.querySelector('input'))"
                            />
                            <input-text
                                ref="endstep-date" 
                                class="my-1"
                                :label="lang.DATE"
                                :value="endStep.datetime"
                                :onchange="e => setEndDate(e.target.value)"
                                type="datetime-local"
                            />
                        </card-border>
                    </div>
                </div>
            </div>
        </div>
        <card-popup
            ref="group-popup"
            :title="lang.SELECT_GROUP"
            :content="lang.SELECT_GROUP_DESC"
            :show-validate="false"
            :oncancel="() => { selectedGroup = null; $refs['group-popup'].hide();}"
        >
            <div class="flex flex-wrap justify-evenly md:max-w-[50vw] overflow-auto max-h-[50vh]">
                <button
                    v-for="group in groups"
                    :key="group.name"
                    class="flex flex-col justify-center py-1 md:m-2 m-1 rounded-md bg-slate-100 px-2 w-fit max-w-[14em] border-2 border-transparent
                            hover:border-slate-200 cursor-pointer transition-all"
                    @click="() => { selectedGroup = group; $refs['group-popup'].hide(); }"
                >
                    <p class="md:text-xl text-lg text-slate-500 font-bold mx-auto whitespace-nowrap text-ellipsis overflow-x-hidden max-w-full">
                        {{ group.name }}
                    </p>
                    <p class="md:text-lg text-md text-slate-500 mx-auto whitespace-nowrap text-ellipsis overflow-x-hidden max-w-full">
                        {{ group.users.length }} {{ group.users.length == 1? lang.MEMBER: lang.MEMBERS }}
                    </p>
                </button>
                <div
                    v-show="groups.length == 0"
                    class="flex flex-col justify-center py-1 md:m-2 m-1 rounded-md bg-slate-100 px-2 w-fit max-w-[80%] border-2 border-transparent"
                >
                    <p class="md:text-xl text-lg text-slate-500 font-bold mx-auto whitespace-nowrap text-ellipsis overflow-x-hidden max-w-full">
                        {{ lang.NO_GROUPS }}
                    </p>
                    <p class="md:text-lg text-md text-slate-500 mx-auto whitespace-nowrap text-ellipsis overflow-x-hidden max-w-full">
                        {{ lang.NO_GROUPS_DESC }}
                    </p>
                </div>
            </div>
        </card-popup>
        <card-popup
            ref="confirm-popup"
            :title="lang.CONFIRM_TRIP"
            :content="lang.CONFIRM_TRIP_DESC"
            :show-validate="true"
            :onvalidate="uploadTrip"
            :oncancel="() => { $refs['confirm-popup'].hide(); }"
        >
            <div
                ref="trip-desc"
                class="flex flex-col"
            />
        </card-popup>
    </div>
</template>

<script>
import ButtonBlock from '../components/inputs/ButtonBlock.vue';
import ButtonText from '../components/inputs/ButtonText.vue';
import InputChoice from '../components/inputs/InputChoice.vue';
import InputText from '../components/inputs/InputText.vue';
import InputBlock from '../components/inputs/InputBlock.vue';
import Topbar from "../components/topbar/Topbar.vue";
import CardPopup from "../components/cards/CardPopup.vue";
import CardBorder from '../components/cards/CardBorder.vue';
import { goBack } from "../scripts/redirects.js";
import User from "../scripts/User.js";
import Lang from "../scripts/Lang.js";
import Selector from '../components/inputs/Selector.vue';
import BAN from '../scripts/BAN';
import { Log, LogZone } from '../scripts/Logs';

import {
    PlusIcon,
    XMarkIcon
} from '@heroicons/vue/24/outline';
import API from '../scripts/API';
import { getTypedValue } from '../scripts/data';

const tripTypes = [
    { value: 0, id: 'TRIP_PUBLIC' },
    { value: 1, id: 'TRIP_PRIVATE' }
];

export default {
    name: 'TripsNew',
    components: {
        Topbar,
        ButtonBlock,
        InputText,
        InputBlock,
        ButtonText,
        InputChoice,
        PlusIcon,
        XMarkIcon,
        Selector,
        CardBorder,
        CardPopup
    },
    data() {
        return {
            User,
            lang: Lang.CurrentLang,
            tripTypes,
            selectedTripType: 0,
            selectedGroup: null,
            tripSteps: [],
            startStep: {destination: "", datetime: null},
            endStep: {destination: "", datetime: null},
            goBack,
            groups: [],
            selectedTab: 0,
            isMobile: window.innerWidth < 768,
        }
    },
    mounted() {
        this.logZone = new LogZone(this.$refs['log-zone']);

        this.groups.splice(0, this.groups.length);
        API.execute_logged(API.ROUTE.GROUPS, API.METHOD.GET, User.CurrentUser?.getCredentials()).then(res => {
            const data = res.data ?? res.groups;
            data.forEach(group => this.groups.push(group));
        }).catch(err => {
            console.error(err);
        });

        window.addEventListener('resize', () => { this.isMobile = window.innerWidth < 768; });
    },
    methods: {
        searchCities(selector, search) {
            BAN.searchCities(search).then(cities => {
                let index = 0;
                let res = cities.map(city => ({
                    id: index++,
                    value: city.name,
                    desc: city.context,
                    label: city.label,
                    city: city.city,
                    context: city.context,
                    lat: city.lat,
                    lng: city.lng,
                }));
                selector.setData(res);
            }).catch(err => {
                selector.setData([]);
            });
        },
        addStep(index) {
            this.tripSteps.splice(index, 0, {destination: "", datetime: null})
        },
        setStepDate(index, v) { this.tripSteps[index].datetime = v; },
        setStartDate(v)       { this.startStep.datetime = v;        },
        setEndDate(v)         { this.endStep.datetime = v;          },
        delStep(index) {
            this.tripSteps.splice(index, 1)
        },
        showValidatePopup() {
            const res = this.updateTripDesc();
            if (!res) return;
            const popup = this.$refs['confirm-popup'];
            popup.show();
        },
        log(msg, type = Log.INFO) {
            if (!this.logZone) return null;
            const log = new Log(msg, type);
            log.attachTo(this.logZone);
            return log;
        },
        createTrip(showlogs = true) {
            const toDestination = (obj) => !obj? null: ({label: obj.label, city: obj.city, context: obj.context, lat: obj.lat, lng: obj.lng});
            const toStep = (obj) => !obj? null: ({date: obj.datetime, ...toDestination(obj.destination)});

            const groupID = this.selectedTripType == 1? this.selectedGroup?.id: null;
            const infos = this.$el.querySelector("textarea[name=trip-infos]").value;
            const price = this.$el.querySelector("input[name=trip-price]").value;
            const slots = this.$el.querySelector("input[name=trip-slots]").value;
            const steps = [this.startStep]
                .concat(this.tripSteps)
                .concat([this.endStep])
                .map(toStep);

            const data = {
                maxPassengers: Number(slots),
                price: Number(price),
                description: infos,
                groupId: groupID != null ? Number(groupID) : null,
                steps: steps
            }

            let msg_log = null;
            if (showlogs)
                msg_log = this.log(Lang.CurrentLang.INPUT_VERIFICATION + " ...", Log.INFO);
            let valid = true;

            const field_checks = [
                {check: () => slots > 0, error: Lang.CurrentLang.SLOTS_SPECIFY},
                {check: () => this.selectedTripType == 0 || this.selectedGroup, error: Lang.CurrentLang.GROUP_SPECIFY},
                {
                    check: () =>
                        steps.reduce((acc, step) => {
                            if (!acc) return false;
                            if (!step) return false;
                            if (!step.label) return false;
                            return true;
                        }, true)
                    ,
                    error: Lang.CurrentLang.DESTINATION_SPECIFY
                },
                {
                    check: () =>
                        steps.reduce((acc, step) => {
                            if (!acc) return false;
                            if (!step) return false;
                            if (!step.date) return false;
                            return true;
                        }, true)
                    ,
                    error: Lang.CurrentLang.DATETIME_SPECIFY
                }
            ];

            field_checks.forEach(check => {
                if (!check.check() && valid) {
                    if (showlogs) msg_log.update(check.error, Log.WARNING);
                    valid = false;
                }
            });

            if (!valid) {
                setTimeout(() => { msg_log.delete(); }, 6000);
                return null;
            }

            if (showlogs) {
                msg_log.update(Lang.CurrentLang.INPUT_VERIFICATION_SUCCESS, Log.SUCCESS);
                setTimeout(() => { msg_log.delete(); }, 2000);
            }

            return data;
        },
        updateTripDesc() {
            const data = this.createTrip();
            if (!data) return false;
            let startDate = "";

            const stylize = str => `<span class="text-slate-600 font-bold">${str}</span>`;
            const getDate = date => {
                if (!date) return undefined;
                const strDate = new Date(date).toLocaleDateString();
                if (strDate === startDate) return Lang.CurrentLang.SAME_DAY.toLowerCase();
                return strDate;
            };
            const getTime = date => !date ? undefined: new Date(date).toLocaleTimeString().substring(0, 5);
            const formatString = (str, ...args) => {
                return str.replace(/\{(\d+)\}/g, (match, number) => {
                    return stylize(typeof args[number] != 'undefined' ? args[number] : match);
                });
            }

            const tripDesc = this.$refs['trip-desc'];
            startDate = getDate(data.steps[0].date);

            let desc = "";
            desc += formatString(
                Lang.CurrentLang.CONFIRM_TRIP_CONTENT,
                data.steps[0]?.label,
                data.steps[data.steps.length - 1]?.label,
                startDate,
                getTime(data.steps[0].date),
                getDate(data.steps[data.steps.length - 1].date),
                getTime(data.steps[data.steps.length - 1].date),
                data.price,
                data.maxPassengers,
            ) + "\n";

            desc += "\r";

            desc += formatString(
                data.groupId? Lang.CurrentLang.CONFIRM_TRIP_PRIVATE: Lang.CurrentLang.CONFIRM_TRIP_PUBLIC,
                this.selectedGroup?.name
            ) + "\n";

            desc += "\r";

            desc += formatString(
                data.steps.length > 2? (
                    data.steps.length == 3? Lang.CurrentLang.CONFIRM_TRIP_1_STEP: Lang.CurrentLang.CONFIRM_TRIP_N_STEPS
                ): Lang.CurrentLang.CONFIRM_TRIP_NO_STEPS,
                data.steps.length - 2
            ) + "\n";

            const steps = data.steps.slice(1, data.steps.length - 1);
            steps.forEach((step, index) => {
                desc += formatString(
                    Lang.CurrentLang.CONFIRM_TRIP_STEP,
                    index + 1,
                    step.label,
                    getDate(step.date),
                    getTime(step.date)
                ) + "\n";
            });

            desc += "\r";

            desc += formatString(
                data.description == ""? Lang.CurrentLang.CONFIRM_TRIP_NO_INFOS: Lang.CurrentLang.CONFIRM_TRIP_INFOS,
                "\n" + data.description.split("\n").map(l => stylize(l)).join("\n")
            );

            const lines = desc.split("\n");
            tripDesc.innerHTML = "";
            lines.forEach(line => {
                const p = document.createElement("p");
                p.classList.add("text-md", "text-gray-500", "font-semibold");
                let text = line;
                if (line.startsWith("\r")) {
                    p.classList.add("mt-4");
                    text = line.substring(1);
                }
                p.innerHTML = text;
                tripDesc.appendChild(p);
            });

            return true;
        },
        uploadTrip(popup) {
            const data = this.createTrip(false);
            if (!data) return;

            const msg_log = popup.log(Lang.CurrentLang.CREATING_TRIP, Log.INFO);
            API.execute_logged(API.ROUTE.TRAVELS.CREATE, API.METHOD.POST, User.CurrentUser?.getCredentials(), data).then(res => {
                msg_log.update(Lang.CurrentLang.TRIP_CREATED, Log.SUCCESS);
                setTimeout(() => {
                    msg_log.delete();
                    popup.hide();
                }, 2000);
            }).catch(err => {
                msg_log.update(Lang.CurrentLang.ERROR + " : " + err.message, Log.ERROR);
                setTimeout(() => {
                    msg_log.delete();
                }, 6000);
            });
        }
    }
}
</script>
