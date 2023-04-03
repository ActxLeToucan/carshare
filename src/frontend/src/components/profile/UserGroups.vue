<template>
    <div class="md:show-up flex flex-col grow max-w-full">
        <p class="text-2xl text-teal-500 py-2 font-bold mx-auto">
            {{ lang.MY_GROUPS }}
        </p>
        <div class="flex flex-col grow justify-evenly">
            <div class="flex flex-col w-fit md:mx-auto mx-auto max-w-full px-2">
                <p class="text-xl text-slate-500 py-2 font-semibold">
                    {{ lang.MY_GROUPS }}
                </p>
                <card class="flex grow h-fit min-w-[60vw] md:max-w-[70vw] w-full overflow-y-auto">
                    <div
                        v-show="loading"
                        class="flex flex-col justify-center mx-auto max-w-full"
                    >
                        <card-badge
                            :newline="true"
                            :title="lang.LOADING_GROUPS"
                            :content="lang.LOADING_GROUPS_DESC"
                        />
                    </div>
                    <div
                        v-if="groups.length == 0 && !loading"
                        class="flex flex-col justify-center mx-auto max-w-full"
                    >
                        <card-badge
                            :newline="true"
                            :title="lang.NO_GROUPS"
                            :content="lang.NO_GROUPS_DESC"
                        />
                    </div>
                    <div
                        v-if="groups.length > 0 && !loading"
                        class="flex space-x-4 overflow-x-scroll w-full"
                    >
                        <button
                            v-for="group in groups"
                            :key="group.id"
                            class="flex flex-col justify-center py-4 my-4 rounded-lg bg-slate-100 dark:bg-slate-700 px-4 border-2 border-transparent hover:border-slate-200 hover:border-slate-600 cursor-pointer transition-all"
                            @click="showGroup(group)"
                        >
                            <p class="text-xl md:text-2xl text-slate-500 dark:text-slate-300 font-bold mx-auto whitespace-nowrap text-ellipsis overflow-x-hidden max-w-full">
                                {{ group.name }}
                            </p>
                            <p class="text-lg md:text-xl text-slate-500 dark:text-slate-400 mx-auto whitespace-nowrap text-ellipsis overflow-x-hidden max-w-full">
                                {{ group.users.length }} {{ group.users.length >= 2 ? lang.MEMBERS : lang.MEMBER }}
                            </p>
                        </button>
                        <button-block
                            v-show="showPagBtn"
                            :disabled="loading"
                            class="w-fit mt-8 mx-auto"
                            :action="showMoreGroups"
                        >
                            <plus-icon class="w-7 h-7 mr-1.5 inline" />
                            <p class="inline">
                                {{ lang.LOAD_MORE }}
                            </p>
                        </button-block>
                    </div>
                </card>
                <div class="flex justify-center mt-4">
                    <button-block :action="createPopup?.show">
                        {{ lang.CREATE_GROUP }}
                    </button-block>
                </div>
            </div>

            <div
                ref="group-zone"
                class="flex md:w-[60vw] md:mx-auto px-2 h-fit mx-auto transition-all overflow-hidden my-4 max-w-full"
                style="max-height: 0px;"
            >
                <div class="flex flex-col h-fit grow rounded-lg border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div class="flex grow justify-between bg-slate-100 dark:bg-slate-700 h-fit items-center">
                        <div class="relative w-8 h-8" />
                        <div class="flex grow justify-center items-center py-1 max-w-[80%] text-slate-500 dark:text-slate-300 space-x-4">
                            <p
                                v-show="!editGroupName"
                                class="text-2xl font-bold w-fit whitespace-nowrap text-ellipsis overflow-x-hidden max-w-full"
                            >
                                {{ selectedGroup?.name }}
                            </p>
                            <input
                                v-show="editGroupName"
                                class="flex h-fit rounded-md px-2 py-1 text-center font-bold text-lg whitespace-nowrap max-w-full min-w-0 text-ellipsis transition-all focus:outline outline-transparent text-slate-600 placeholder-slate-600/[0.5] bg-white dark:bg-slate-600 text-slate-400 dark:text-slate-200"
                                :value="selectedGroup?.name"
                                @blur="changeGroupName"
                            >
                            <button
                                class="w-6 h-6 hover:text-teal-500 transition-all"
                                @click="editGroupName = !editGroupName"
                            >
                                <pencil-icon v-show="!editGroupName" />
                                <check-icon v-show="editGroupName" />
                            </button>
                        </div>
                        <x-mark-icon
                            class="relative w-8 h-8 mr-1 text-slate-500 dark:text-slate-400 hover:text-slate-600 cursor-pointer transition-all"
                            @click="hideGroupZone()"
                        />
                    </div>
                    <div class="flex grow h-fit justify-center p-4">
                        <div
                            v-if="selectedGroup?.users.length == 0"
                            class="flex flex-col justify-center mx-auto max-w-full"
                        >
                            <card-badge
                                :newline="true"
                                class="max-w-full"
                                :title="lang.NO_USERS"
                                :content="lang.NO_USERS_DESC"
                            />
                        </div>
                        <div
                            v-if="selectedGroup?.users.length > 0"
                            class="flex overflow-x-auto space-x-4 w-full"
                        >
                            <card-badge
                                v-for="member in selectedGroup?.users"
                                :key="member.email"
                                class="md:max-w-[18em] max-w-[14em]"
                                :title="member.firstName + ' ' + member.lastName"
                                :content="member.email"
                            />
                        </div>
                    </div>
                    <div class="flex grow justify-end p-2">
                        <button-block
                            :action="showDeletePopup"
                            color="red"
                        >
                            {{ lang.DELETE_GROUP }}
                        </button-block>
                    </div>
                </div>
            </div>
        </div>
        <card-popup
            color="red"
            :title="lang.DELETE_GROUP"
            :content="lang.GROUP_DELETE_CONFIRMATION"
            :cancel-label="lang.CANCEL"
            :validate-label="lang.DELETE"
            :onload="setDeletePopup"
            :onvalidate="removeGroup"
        />
        <card-popup
            ref="create-popup"
            :title="lang.CREATE_GROUP"
            :content="lang.GROUP_CREATE_CONFIRMATION+'.'"
            :cancel-label="lang.CANCEL"
            :validate-label="lang.CREATE"
            :onvalidate="createGroup"
            :disable-validate="isCreating"
        >
            <input-text
                :label="lang.GROUP_NAME"
                :placeholder="lang.GROUP_NAME"
                name="name"
            />
        </card-popup>
    </div>
</template>

<script>
import Lang from '../../scripts/Lang';
import Card from '../cards/CardBorder.vue';
import CardBadge from '../cards/CardBadge.vue';
import ButtonBlock from '../inputs/ButtonBlock.vue';
import InputText from '../inputs/InputText.vue';
import CardPopup from '../cards/CardPopup.vue';

import {
    XMarkIcon,
    PlusIcon,
    PencilIcon,
    CheckIcon,
} from '@heroicons/vue/24/outline';
import API from '../../scripts/API';
import User from '../../scripts/User';
import { Log } from '../../scripts/Logs';

export default {
    name: "UserGroups",
    components: {
        Card,
        CardBadge,
        ButtonBlock,
        XMarkIcon,
        CardPopup,
        InputText,
        PlusIcon,
        PencilIcon,
        CheckIcon,
    },
    data() {
        return {
            groups: [],
            loading: false,
            lang: Lang.CurrentLang,
            selectedGroup: null,
            deletePopup: null,
            createPopup: null,
            showPagBtn: false,
            pagination: API.createPagination(0, 5),
            isCreating: false,
            editGroupName: false,
        }
    },
    mounted() {
        Lang.AddCallback(lang => this.lang = lang);
        this.updateGroups();

        this.createPopup = this.$refs["create-popup"];
    },
    methods: {
        showGroupZone() {
            const zone = this.$refs["group-zone"];
            const child = zone.firstElementChild;
            zone.style.maxHeight = child.getBoundingClientRect().height + "px";
            setTimeout(() => { zone.style.maxHeight = "2000px"; }, 250);
        },
        hideGroupZone() {
            const zone = this.$refs["group-zone"];
            zone.style.maxHeight = "0px";
        },
        showGroup(group) {
            this.selectedGroup = group;
            this.showGroupZone();
        },
        setDeletePopup(popup) {
            this.deletePopup = popup;
        },
        showDeletePopup() {
            this.deletePopup.setTitle(this.lang.DELETE + ' ' + this.selectedGroup?.name);
            this.deletePopup.show();
        },
        removeGroup(popup) {
            popup.setTitle(this.lang.DELETE + ' ' + this.selectedGroup?.name);
            const log = popup.log(Lang.CurrentLang.DELETING_GROUP + "...", Log.INFO);
            API.execute_logged(API.ROUTE.GROUPS + "/" + this.selectedGroup.id, API.METHOD.DELETE, User.CurrentUser?.getCredentials()).then((data) => {
                log.update(Lang.CurrentLang.GROUP_DELETED, Log.SUCCESS);
                this.groups.splice(this.groups.indexOf(this.selectedGroup), 1);
                this.selectedGroup = null;
                this.hideGroupZone();
                setTimeout(() => {
                    log.delete();
                    popup.hide();
                }, 2000);
            }).catch(err => {
                log.update(Lang.CurrentLang.ERROR + " : " + err.message, Log.SUCCESS);
                setTimeout(() => {
                    log.delete();
                }, 4000);
            });
        }, 
        createGroup(popup) {
            this.isCreating = true;
            const log = popup.log(Lang.CurrentLang.INPUT_VERIFICATION + " ...", Log.INFO);

            const field_checks = [
                {field: "name",        check: (value) => value.length > 0, error: Lang.CurrentLang.NAME_SPECIFY},
            ];
            
            for (let i = 0; i < field_checks.length; i++) {
                const check = field_checks[i];
                const result = check.check(popup.get(check.field), popup);
                if (!result) {
                    popup.focus(check.field);
                    log.update(check.error, Log.WARNING);
                    setTimeout(() => { log.delete(); }, 4000);
                    this.isCreating = false;
                    return;
                }
            }
            log.update(Lang.CurrentLang.CREATING_GROUP + " ...", Log.INFO);
            const name = popup.get("name");

            API.execute_logged(API.ROUTE.GROUPS + "/my", API.METHOD.POST, User.CurrentUser?.getCredentials(), {name}).then(res => {
                log.update(Lang.CurrentLang.GROUP_CREATED, Log.SUCCESS);
                setTimeout(() => {
                    log.delete();
                    popup.hide();
                    this.isCreating = false;
                }, 2000);
                this.updateGroups();
            }).catch(err => {
                log.update(Lang.CurrentLang.ERROR + " : " + err.message, Log.ERROR);
                this.isCreating = false;
                setTimeout(() => {
                    log.delete();
                }, 6000);
            });
        },
        updateGroups() {
            this.loading = true;
            API.execute_logged(API.ROUTE.GROUPS + "/my" + this.pagination, API.METHOD.GET, User.CurrentUser?.getCredentials()).then(res => {
                const data = res.data ?? res.groups;
                data.forEach(group => {
                    if (!this.groups.find(g => g.id == group.id))
                        this.groups.push(group)
                });
                this.loading = false;
                this.pagination.total = res.total ?? 0;
                this.showPagBtn = this.pagination.hasNext;
            }).catch(err => {
                console.error(err);
            });
        },
        showMoreGroups() {
            this.pagination.next();
            this.updateGroups();
        },
        changeGroupName(ev) {
            const oldName = this.selectedGroup.name;
            const newName = ev.target.value.trim();
            if (oldName != newName) {
                API.execute_logged(API.ROUTE.GROUPS + "/" + this.selectedGroup.id + "/name", API.METHOD.PATCH, User.CurrentUser?.getCredentials(), {groupName: newName}).then(res => {
                    this.selectedGroup.name = newName;
                    this.editGroupName = false;
                }).catch(err => {
                    console.error(err);
                });
            }
        },
    }
}
</script>