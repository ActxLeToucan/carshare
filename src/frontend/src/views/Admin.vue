<template>
    <div class="flex grow flex-col">
        <topbar></topbar>
        <div class="flex md:flex-row flex-col grow max-h-full min-h-0">
            <div ref="tabs-zone" class="flex flex-col items-center h-full md:w-min w-full px-8 py-4 space-y-4 md:border-r-8 border-teal-500 mx-auto overflow-hidden">
                <p class="text-2xl text-teal-500 py-2 font-bold mx-auto"> {{ lang.ADMINISTRATION }} </p>
                <button-tab href="#users" :default="!isMobile"> {{ lang.USERS }} </button-tab>
                <button-tab href="#groups"> {{ lang.GROUPS }} </button-tab>
                <button-tab href="#trips"> {{ lang.TRIPS }} </button-tab>
            </div>
            <div ref="content-zone" class="flex flex-col md:grow overflow-scroll">

                <button ref="backtabs-btn" class="absolute md:hidden flex rounded-md border-2 border-slate-200 bg-white h-fit w-fit p-2 m-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>

                <tab-window defaultHash="#users">
                    <tab-div hash="#users">
                        <admin-users></admin-users>
                    </tab-div>

                    <tab-div hash="#groups">
                        <admin-groups></admin-groups>
                    </tab-div>

                    <tab-div hash="#trips">
                        <admin-trips></admin-trips>
                    </tab-div>
                </tab-window>
            </div>
        </div>
    </div>
</template>

<script>
import Topbar from "../components/topbar/Topbar.vue"
import User from '../scripts/User';
import ButtonTab from '../components/inputs/ButtonTab.vue';
import TabWindow from '../components/cards/TabWindow.vue';
import TabDiv from '../components/cards/TabDiv.vue';

import AdminUsers from '../components/admin/AdminUsers.vue';
import AdminGroups from '../components/admin/AdminGroups.vue';
import AdminTrips from '../components/admin/AdminTrips.vue';
import Lang from '../scripts/Lang';

export default {
    name: 'Admin',
    components: {
        Topbar,
        ButtonTab,
        TabWindow,
        TabDiv,

        AdminUsers,
        AdminGroups,
        AdminTrips
    },
    methods: {
        setupView() {
            const tabs = this.$refs["tabs-zone"];
            const tabsBtn = this.$refs["backtabs-btn"];
            const content = this.$refs["content-zone"];
            if (tabs == null || tabsBtn == null || content == null) return;

            if (this.isMobile) {
                this.showTabs = () => {
                    tabs.classList.remove("hidden");
                    content.classList.add("hidden");

                    tabs.classList.add("show-right");
                    content.classList.remove("show-left");
                    tabsBtn.classList.remove("show-left");
                };
                this.hideTabs = () => {
                    tabs.classList.add("hidden");
                    content.classList.remove("hidden");

                    tabs.classList.remove("show-right");
                    content.classList.add("show-left");
                    tabsBtn.classList.add("show-left");
                };

                tabsBtn.addEventListener("click", () => {
                    this.showTabs();
                    this.$router.push({ hash: '' });
                });
                if (window.location.hash == '')
                    this.showTabs();
                else this.hideTabs();
            } else {
                tabs.classList.remove("hidden");
                content.classList.remove("hidden");
            }
        },
    },
    data() {
        return { User, isMobile: window.innerWidth < 768, lang: Lang.CurrentLang }
    },
    mounted() {
        Lang.addCallback(lang => this.lang = lang);

        this.setupView();
        window.addEventListener("resize", () => {
            this.isMobile = window.innerWidth < 768;
            this.setupView();
        });
    },
    watch: {
        '$route.hash': function (newVal, oldVal) {
            const isMobile = window.innerWidth < 768;
            if (isMobile && newVal != '') this.hideTabs();
        }
    }
}
</script>