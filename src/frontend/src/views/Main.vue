<template>
    <div class="flex grow flex-col">
        <topbar></topbar>
        <div class="flex grow flex-col">
            
            <div class="show-down relative flex w-full min-h-[60vh] bg-teal-500">
                <img class="z-0 object-cover block dark:hidden" src="../assets/img/landscape.svg" alt="">
                <img class="z-0 object-cover hidden dark:block" src="../assets/img/landscape-dark.svg" alt="">
                <div class="z-10 absolute top-0 flex flex-col w-full h-0 justify-center items-center md:pt-32 pt-16">
                    <h1 class="show-down md:text-8xl text-6xl font-extrabold text-white dark:text-slate-700 shadow-3D"> {{ lang.CARSHARE }} </h1>
                    <p style="animation-delay: 200ms;" class="show-down md:text-[1.7em] text-lg font-bold text-white dark:text-slate-700 italic shadow-3D"> {{ lang.CARSHARE_DESC }} </p>
                </div>
                <div style="animation-delay: 200ms;" class="show-up z-10 absolute bottom-0 flex w-full h-0 overflow-visible">
                    <div class="flex flex-col w-fit h-fit mx-auto md:-translate-y-full -translate-y-[50%]">
                        <div class="flex md:flex-wrap md:flex-row flex-col justify-center items-center h-fit w-fit mx-auto rounded-md shadow-lg border-2 border-b-4 border-teal-600 bg-teal-500 px-4 py-2 md:space-x-4 md:space-y-0 space-y-4">
                    
                            <div class="relative h-0 w-0 md:flex hidden">
                                <div class="absolute bottom-11 left-0">
                                    <div> <!-- FOR CAR MOVEMENTS -->
                                        <div> <!-- FOR CAR SHAKES -->
                                            <car ref="car" class="car w-20 text-white dark:text-slate-600 drop-shadow-md cursor-pointer"
                                                style="transform: scale(-1, 1);"
                                                fill="currentColor"
                                                stroke="none"
                                                v-on:click="tuttut">
                                            </car>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="flex md:flex-row flex-col md:space-x-2 items-center w-min">
                                <div class="flex flex-col">
                                    <input-text
                                        name="startingpoint" class="w-48 mx-auto max-w-fit"
                                        :placeholder="lang.STARTING_POINT" dark="true"
                                        :onchange="e => { if (startCity?.value != e.target.value) startCity = null; }"
                                        :value="startCity?.value"
                                    ></input-text>
                                    <selector ref="startSelector" :oncompletion="searchCities" :onclick="onstartselected"></selector>
                                </div>
                                <!-- <div class="flex justify-center items-center"> -->
                                    <!-- <div class="h-0 w-0"> -->
                                        <button-block class="w-fit" color="slate" :action="reverseInputs"> <!-- -translate-x-[50%] -translate-y-[50%] -->
                                            <arrows-right-left-icon class="md:block hidden h-7 w-7"></arrows-right-left-icon>
                                            <arrows-up-down-icon class="md:hidden block h-7 w-7"></arrows-up-down-icon>
                                        </button-block>
                                    <!-- </div> -->
                                <!-- </div> -->
                                <div class="flex flex-col">
                                    <input-text
                                        name="endingpoint" class="w-48 mx-auto max-w-fit"
                                        :placeholder="lang.ENDING_POINT" dark="true"
                                        :onchange="e => { if (endCity?.value != e.target.value) endCity = null; }"
                                        :value="endCity?.value"
                                    ></input-text>
                                    <selector ref="endSelector" :oncompletion="searchCities" :onclick="onendselected"></selector>
                                </div>
                            </div>
                            <span class="md:block hidden bg-teal-600 w-1 h-14 rounded-lg"></span>
                            <div class="flex md:flex-row flex-col md:space-x-2 md:space-y-2 space-y-0 w-min">
                                <input-text name="datetime" class="w-48 mx-auto max-w-fit" placeholder="date" dark="true" type="datetime-local"></input-text>
                            </div>
                            <span class="md:block hidden bg-teal-600 w-1 h-14 rounded-lg"></span>
                            <button-block color="slate" class="mx-auto" :action="searchTrips"> {{ lang.SEARCH }} </button-block>

                        </div>
                        <div style="animation-delay: 400ms;" class="show-up relative flex w-full justify-end mt-4">

                            <button-block class="shadow-lg" href="/trips/new"> Créer un trajet </button-block>

                        </div>
                    </div>
                </div>
            </div>
            
            <div
                ref="log-zone"
                class="flex flex-col w-full justify-center items-center min-h-max h-max transition-all"
                style="max-height: 0px;"
            ></div>

            <div class="flex grow min-h-[50vh]">
                <trip-card
                    v-for="trip in trips" :key="trip.id"
                    :trip="trip" class="mx-auto"
                ></trip-card>
            </div>

        </div>
    </div>
</template>

<script>
import ButtonBlock from '../components/inputs/ButtonBlock.vue';
import InputText from '../components/inputs/InputText.vue';
import Topbar from "../components/topbar/Topbar.vue";
import Selector from '../components/inputs/Selector.vue';
import TripCard from '../components/cards/TripCard.vue';
import { Log, LogZone } from '../scripts/Logs';
import Car from '../components/Car.vue';
import BAN from '../scripts/BAN.js';
import Lang from '../scripts/Lang.js';

import {
    ArrowsRightLeftIcon,
    ArrowsUpDownIcon
} from '@heroicons/vue/24/outline';
import API from '../scripts/API';
import User from '../scripts/User';

let firsttut = false;
function addtut(dom) {
    const car = document.querySelector(".car");
    const rect = car.getBoundingClientRect();
    const txt = document.createElement("p");
    const txtcontainer = document.createElement("div");
    const sideright = !firsttut;
    firsttut = !firsttut;
    txt.classList.add("tuttext", "tutanim");

    txt.innerText = "tut";
    txtcontainer.style.left = rect.left + (sideright?rect.width-20:0) + "px";
    txtcontainer.style.top = rect.top + "px";

    txtcontainer.classList.add("tutcontainer");
    txtcontainer.appendChild(txt);
    txtcontainer.style.transform = "rotate(" + (sideright?'':'-') + "25deg)";
    dom.appendChild(txtcontainer);

    setTimeout(() => {
        txt.remove();
    }, 500);
}

function addtof(dom) {
    const car = document.querySelector(".car");
    const rect = car.getBoundingClientRect();
    const txt = document.createElement("p");
    const txtcontainer = document.createElement("div");
    const sideright = car.style.transform.indexOf("-1") != -1;
    txt.classList.add("tuttext", "tutanim");

    txt.innerText = "tof";
    txtcontainer.style.left = rect.left + (sideright?-10:rect.width) + "px";
    txtcontainer.style.top = rect.top + 20 + "px";

    txtcontainer.classList.add("tutcontainer");
    txtcontainer.appendChild(txt);
    txtcontainer.style.transform = "rotate(" + (sideright?'-':'') + "25deg)";
    dom.appendChild(txtcontainer);

    setTimeout(() => {
        txt.remove();
        txtcontainer.remove();
    }, 500);
}

let tutpos = 0;
let tuttimeout = null;
let tofinterval = null;
function settutpos(el) {
    const car = document.querySelector(".car");
    const carShake = car.parentElement;
    const carMovement = carShake.parentElement;
    const parent = carMovement.parentElement;
    const parentRect = parent.getBoundingClientRect();
    const rect = (el != null)? el.getBoundingClientRect() : {left: parentRect.left};

    let newpos = rect.left - parentRect.left;
    if (newpos < tutpos) car.style.transform = "scale(1, 1)";
    else car.style.transform = "scale(-1, 1)";

    let tutdelta = Math.abs(newpos - tutpos);
    tutpos = newpos;


    carMovement.style.transition = "all linear";
    carMovement.style.transitionDuration = tutdelta * 4 + "ms";
    carMovement.style.transform = "translateX(" + tutpos + "px)";
    carShake.classList.add("tutmove");

    if (tuttimeout != null || tofinterval != null) {
        clearTimeout(tuttimeout);
        clearInterval(tofinterval);
        tuttimeout = null;
        tofinterval = null;
    }

    tofinterval = setInterval(() => { addtof(document.body); }, 150);
    tuttimeout = setTimeout(() => {
        carShake.classList.remove("tutmove");
        if (tofinterval != null) {
            clearInterval(tofinterval);
            tofinterval = null;
        }
        tuttimeout = null;
    }, tutdelta * 4);
}

export default {
    components: {
        Topbar,
        InputText,
        ButtonBlock,
        ArrowsRightLeftIcon,
        ArrowsUpDownIcon,
        Selector,
        Car,
        TripCard
    },
    name: 'Main',
    data() {
        return { lang: Lang.CurrentLang, trips: [], startCity: {}, endCity: {} }
    },
    methods: {
        onstartselected(city) {
            this.startCity = city;
        },
        onendselected(city) {
            this.endCity = city;
        },
        tuttut() {
            const car = this.$refs["car"];
            const parent = car.$el.parentElement;
            parent.classList.add("tutshake");
            setTimeout(() => {
                parent.classList.remove("tutshake");
            }, 500);

            setTimeout(() => addtut(this.$el), 50);
            setTimeout(() => addtut(this.$el), 300);
        },
        searchCities(selector, search) {
            BAN.searchCities(search).then(cities => {
                let index = 0;
                const data = cities.map(city => ({ id: index++, value: city.city, desc: city.context }));
                selector.setData(data);
            }).catch(err => {
                selector.setData([]);
            });
        },
        reverseInputs() {
            const start = this.startInput.value;
            const end = this.endInput.value;
            this.startInput.value = end;
            this.endInput.value = start;
        },
        log(msg, type = Log.INFO) {
            if (!this.logZone) return null;
            const log = new Log(msg, type);
            log.attachTo(this.logZone);
            return log;
        },
        searchTrips() {
            const msg_log = this.log(Lang.CurrentLang.INPUT_VERIFICATION, Log.INFO);
            const input_date = document.querySelector("input[name=datetime]");
            const input_start = document.querySelector("input[name=startingpoint]");
            const input_end = document.querySelector("input[name=endingpoint]");

            const field_checks = [
                { field: input_start, msg: Lang.CurrentLang.STARTING_POINT_SPECIFY },
                { field: input_end, msg: Lang.CurrentLang.ENDING_POINT_SPECIFY },
                { field: input_date, msg: Lang.CurrentLang.DATE_SPECIFY }
            ];

            for (let i = 0; i < field_checks.length; i++) {
                const check = field_checks[i];
                if (check.field.value == "") {
                    msg_log.update(check.msg, Log.WARNING);
                    check.field.focus();
                    setTimeout(() => { msg_log.delete(); }, 6000);
                    return;
                }
            }

            console.log(this.startCity);

            msg_log.update(Lang.CurrentLang.SEARCHING + " ...", Log.INFO);
            API.execute_logged(API.ROUTE.TRAVELS.SEARCH + API.createParameters({
                date: input_date.value,
                startCity: this.startCity.value,
                endCity: this.endCity.value,
                startContext: this.startCity.desc,
                endContext: this.endCity.desc,
            }), API.METHOD.GET, User.CurrentUser.getCredentials()).then(res => {
                if (res.data)
                    this.addTrips(res.data);
                else this.addTrips(res);
                msg_log.delete();
            }).catch(err => {
                console.error(err);
                msg_log.update(Lang.CurrentLang.ERROR + " : " + err.message, Log.ERROR);
                setTimeout(() => { msg_log.delete(); }, 5000);
            });
        },
        addTrips(list) {
            for (const el in list) {
                this.trips.push({
                    date: el.steps[0]?.date.toLocalDateString(),
                    author: el.driver.firstName + el.driver.lastName.substring(0, 1) + ".",
                    startCity: el.steps[0]?.label,
                    startTime: el.steps[0]?.date.toLocalTimeString().substring(0, 5),
                    endCity: el.steps[el.steps.length - 1]?.label,
                    endTime: el.steps[el.steps.length - 1]?.date.toLocalTimeString().substring(0, 5),
                    slots: el.maxPassengers - (el.passengers?.length ?? 0),
                    price: el.price,
                });
            }
        }
    },
    mounted() {
        Lang.AddCallback(lang => this.lang = lang);

        window.addEventListener("resize", ev => {
            this.isMobile = window.innerWidth < 768;
        });

        this.startInput = this.$el.querySelector('input[name="startingpoint"]');
        this.endInput = this.$el.querySelector('input[name="endingpoint"]');
        this.dateInput = this.$el.querySelector('input[name="datetime"]');
        this.startSelector = this.$refs["startSelector"];
        this.endSelector = this.$refs["endSelector"];

        // tut tut movements
        this.startInput.addEventListener("focus", ev => { settutpos(ev.target); });
        this.endInput.addEventListener("focus", ev => { settutpos(ev.target); });
        this.dateInput.addEventListener("focus", ev => { settutpos(ev.target); });

        this.startSelector.attachInput(this.startInput);
        this.endSelector.attachInput(this.endInput);

        this.logZone = new LogZone(this.$refs["log-zone"]);
    }
}
</script>

<style>
@keyframes tutanim {
    0% { transform: translateY(0em); opacity: 0; }
    50% { transform: translateY(-1em); opacity: 1; }
    100% { transform: translateY(-2em); opacity: 0; }
}

@keyframes tutshake {
    0% { transform: translateY(0); }
    25% { transform: translateY(-0.2em) rotate(-2deg); }
    50% { transform: translateY(0); }
    75% { transform: translateY(-0.1em) rotate(2deg); }
    100% { transform: translateY(0); }
}

@keyframes tutmove {
    0%, 50% { transform: translateY(0); }
    25% { transform: translateY(-10%) rotate(2deg); }
    75% { transform: translateY(-10%) rotate(-2deg); }
}

.tutanim { animation: tutanim 0.5s forwards; }
.tutshake { animation: tutshake 0.5s forwards; }
.tuttext {
    font-size: 0.8em;
    font-weight: 500;
    @apply text-white dark:text-slate-700;
}
.tutcontainer {
    position: absolute;
    width: fit-content;
    height: fit-content;
    display: flex;
    justify-content: center;
    align-items: center;
}
.tutmove { animation: tutmove 0.4s infinite; }
</style>