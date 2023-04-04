<template>
     <div class="flex md:flex-row flex-col grow max-h-full max-w-full min-h-0">
        <div
            ref="query-zone"
            class="flex flex-col items-center h-full max-h-full md:w-min w-full min-w-0 max-w-full p-4 md:border-r-8 border-teal-500 mx-auto overflow-hidden"
        >
            <p class="text-2xl text-teal-500 py-2 font-bold mx-auto">
                {{ lang.TRIPS }}
            </p>
            <p class="text-lg text-slate-500 pt-2 font-semibold mx-auto">
                {{ lang.SEARCH_TRIP }}
            </p>
            <div class="flex max-w-full min-w-0 items-center space-x-2">
                <input-text
                    class="w-full flex grow"
                    placeholder="Rechercher"
                />
                <button-block
                    :action="() => { pagination.offset = 0; selectedTrip = null; search(this) }"
                    :disabled="!searchBar.buttonEnabled"
                >
                    <magnifying-glass-icon class="w-7 h-7" />
                </button-block>
            </div>
            <div
                ref="search-log-zone"
                class="flex flex-col w-full items-center h-fit overflow-hidden transition-all"
                style="max-height: 0;"
            />
            <div class="flex grow w-full flex-col px-8 space-y-4 pt-4 max-w-full min-w-0 overflow-y-auto">
                <admin-trip-card
                    v-for="trip in trips"
                    :key="trip?.id"
                    class="min-w-0 w-full show-up max-w-[20em] mx-auto"
                    :data="trip"
                    :onclick="onCardClicked"
                />
            </div>
            <div class="flex w-full justify-evenly items-center mt-4">
                <button-block
                    :action="() => pagination.previous()"
                    :disabled="!pagination.hasPrevious"
                >
                    <chevron-left-icon class="w-8 h-8" />
                </button-block>
                <p class="text-xl font-bold text-slate-500">
                    {{ pagination.index + 1 }} / {{ pagination.maxIndex + 1 }}
                </p>
                <button-block
                    :action="() => pagination.next()"
                    :disabled="!pagination.hasNext"
                >
                    <chevron-right-icon class="w-8 h-8" />
                </button-block>
            </div>
        </div>
               
        <div
            ref="result-zone"
            class="flex flex-col grow overflow-auto"
        >
            <button
                ref="backbtn"
                class="absolute md:hidden flex rounded-md border-2 border-slate-200 bg-white h-fit w-fit p-1 m-2"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-7 h-7"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                </svg>
            </button>
            <div
                    v-if="selectedTrip != null"
                    class="md:show-up flex flex-col justify-center max-h-full min-h-0"
                >
                    <p class="text-2xl text-teal-500 py-2 font-bold mx-auto w-fit">
                        {{  }}
                    </p>
                    <card class="flex flex-col m-4 mx-auto max-h-full min-h-0">
                        <div class="flex flex-col min-h-0">
                            <input-text
                               name="driver"
                                :label="lang.DRIVER"
                                :placeholder="lang.DRIVER"
                                :value="selectedTrip.driver"
                            />
                            <input-text
                                    name="price"
                                    :label="lang.PRICE"
                                    :placeholder="lang.PRICE"
                                    :value="selectedTrip.price +' €'"
                            />
                            <input-text
                                    name="maxPassengers"
                                    :label="lang.MAXPASSENGERS"
                                    :placeholder="lang.MAXPASSENGERS"
                                    :value="selectedTrip.maxPassengers"
                            />
                            <div
                                v-if="selectedTrip.description.length > 0">
                                <input-text
                                        name="description"
                                        :label="lang.DESCRIPTION"
                                        :placeholder="lang.DESCRIPTION"
                                        :value="selectedTrip.description"
                                />
                            </div>
                            
                            <p class="flex text-xl dark:text-slate-400 text-slate-500 font-bold whitespace-nowrap text-ellipsis  mb-0">
                                steps
                            </p>
                             <div
                                class=" flex flex-col items-center mx-auto w-full md:flex-col max-w-full max-h-full min-h-0 overflow-y-auto space-y-2 py-2"
                            >
                             <card-badge
                                        v-for="step in selectedTrip?.steps"
                                        :key="step.date"
                                        class="md:w-[18em] w-[14em] my-0"
                                        :title="step.city"
                                        :content="step.date.substring(0, 10) +' '+step.date.substring(11, 16)"
                                />
                            </div>
                        <div
                            ref="user-log-zone"
                            class="flex flex-col w-full items-center h-fit overflow-hidden transition-all"
                            style="max-height: 0;"
                        />
                        <div class="flex md:flex-row flex-col md:space-x-4 md:space-y-0 space-y-2 mt-4">
                            <button-block
                                :action="showDeletePopup"
                                color="red"
                            >
                                {{ lang.DELETE_TRIP }}
                            </button-block>
                            <div class="flex grow justify-end pl-20">
                                <button-block :action="updateTrip">
                                    {{ lang.EDIT }}
                                </button-block>
                            </div>
                        </div>
                            
                           
                        </div>
                     
                    </card>
                </div>
        </div>
           <card-popup
                color="red"
                :title="lang.DELETE + ' ' + selectedTrip?.id"
                :content="lang.TRIP_DELETE_VERIFY"
                :cancel-label="lang.CANCEL"
                :validate-label="lang.DELETE"
                :onload="setDeletePopup"
                :onvalidate="deleteTrip"
            />
    </div>
    
</template>

<script>
import User from '../../scripts/User.js';
import API from '../../scripts/API.js';
import InputText from '../inputs/InputText.vue';
import ButtonBlock from '../inputs/ButtonBlock.vue';
import AdminGroupCard from './AdminGroupCard.vue';
import AdminTripCard from './AdminTripCard.vue';
import CardPopup from '../cards/CardPopup.vue';
import CardBadge from '../cards/CardBadge.vue';
import Card from '../cards/CardBorder.vue';
import { Log, LogZone } from '../../scripts/Logs.js';
import { genres, levels } from '../../scripts/data';
import {
    MagnifyingGlassIcon,
    ChevronRightIcon,
    ChevronLeftIcon
}from '@heroicons/vue/24/outline';
import Lang from "../../scripts/Lang";

const PAGE = { QUERY: 1, RESULTS: 2 };

function search(obj) {
    obj.searchBar.buttonEnabled = false;
    const log = obj.searchLog(Lang.CurrentLang.SEARCHING + "...", Log.INFO);

    const value = obj.$refs['query-zone'].querySelector('input').value;

    API.execute_logged(API.ROUTE.TRAVELS.GET + obj.pagination + "&query=" + value, API.METHOD.GET, User.CurrentUser?.getCredentials(), { search: value }).then((data) => {
        obj.trips = data.data;
        obj.pagination.total = data.total;
        console.log('rien' , data)
        log.delete();
    }).catch((err) => {
        log.update(Lang.CurrentLang.ERROR + " : " + err.message, Log.ERROR);
        setTimeout(() => { log.delete(); }, 4000);
    }).finally(() => {
        obj.searchBar.buttonEnabled = true;
    });

   

}
export default {
    name: 'AdminTrips',
    components: {
     InputText,
        ButtonBlock,
        AdminGroupCard,
        AdminTripCard,
        CardPopup,
        Card,
        CardBadge,
        MagnifyingGlassIcon,
        ChevronRightIcon,
        ChevronLeftIcon
    },
    data() {
        return {
            User,
            trips: [],
            selectedTrip: null,
            isMobile: window.innerWidth < 768,
            genres,
            levels,
            lang: Lang.CurrentLang,
            pagination: API.createPagination(0, 5),
            formUser: {
                buttonEnabled: true,
            },
            searchBar: {
                buttonEnabled: true,
            },
            groupName: '',
        }
    },
    mounted() {
        Lang.AddCallback(lang => this.lang = lang);
         const backbtn = this.$refs['backbtn'];
        backbtn.addEventListener('click', () => {
            this.displayPage(PAGE.QUERY);
        });

        this.searchLogZone = new LogZone(this.$refs["search-log-zone"]);

        this.displayPage(PAGE.QUERY);
        window.addEventListener("resize", _ => {
            this.isMobile = window.innerWidth < 768;
            this.displayPage();
        });

        this.pagination.onChanged(() => {
            this.search();
        });
    },
    methods: {
      
        displayPage(page) {
            const queryZone = this.$refs['query-zone'];
            const resultZone = this.$refs['result-zone'];
            if (!queryZone || !resultZone) return;
            if (!page) page = this.displayedPage;

            if (this.isMobile) {
                switch (page) {
                    case PAGE.QUERY:
                        queryZone.classList.remove('hidden');
                        resultZone.classList.add('hidden');
                        break;
                    case PAGE.RESULTS:
                        queryZone.classList.add('hidden');
                        resultZone.classList.remove('hidden');
                        break;
                }
            } else {
                queryZone.classList.remove('hidden');
                resultZone.classList.remove('hidden');
            }
            this.displayedPage = page || this.displayedPage;
        },
        onCardClicked(trip) {
            this.selectedTrip = trip;  
            API.execute_logged(API.ROUTE.TRAVELS.GET + '/' + this.selectedTrip.id , API.METHOD.GET, User.CurrentUser?.getCredentials()).then((data) => {
                this.selectedTrip = data;
                console.log('trips', this.selectedTrip)
                
            }).catch((err) => {
                console.log(err)
            }).finally(() => {
               
            });
            this.displayPage(PAGE.RESULTS);
        },
        searchLog(msg, type = Log.INFO) {
            if (!this.searchLogZone) return;
            const log = new Log(msg, type);
            log.attachTo(this.searchLogZone);
            return log;
        },
        search() {
            return search(this);
        },
        groupLog(msg, type = Log.INFO) {
            if (!this.userLogZone) {
                this.userLogZone = new LogZone(this.$refs["user-log-zone"]);
                if (!this.userLogZone) return;
            }
            const log = new Log(msg, type);
            log.attachTo(this.userLogZone);
            return log;
        },
        setDeletePopup(popup) {
            this.deletePopup = popup;
        },
          showDeletePopup() {
            this.deletePopup.setTitle(this.lang.DELETE + ' ' );
            this.deletePopup.show();
        },
        deleteTrip(popup) {
            popup.setTitle(this.lang.DELETE + ' ' + this.selectedGroup?.name);

            const log = popup.log(Lang.CurrentLang.DELETING_TRIP + "...", Log.INFO);
            API.execute_logged(API.ROUTE.TRAVELS.GET + "/" + this.selectedTrip.id, API.METHOD.DELETE, User.CurrentUser?.getCredentials()).then((data) => {
                log.update(Lang.CurrentLang.TRIPP_DELETED, Log.SUCCESS);
                this.displayPage(PAGE.QUERY);
                this.trips.splice(this.trips.indexOf(this.selectedTrip), 1);
                this.selectedTrip = null;
                setTimeout(() => {
                    log.delete();
                    popup.hide();
                }, 2000);
            }).catch(err => {
                setTimeout(() => {

                }, 4000);
            });
        },

    }
}

</script>