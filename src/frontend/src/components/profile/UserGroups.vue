<template>
    <div class="show-up flex flex-col grow">
        <p class="text-2xl text-teal-500 py-2 font-bold mx-auto"> {{ lang.MY_GROUPS }} </p>
        <div class="flex flex-col grow justify-evenly">

            <div class="flex flex-col w-fit mx-auto">
                <p class="text-2xl text-slate-500 py-2 font-semibold"> {{ lang.MY_GROUPS }} </p>
                <card class="min-w-[60vw]">
                    <div v-if="groups.length == 0" class="flex flex-col justify-center">

                    <p class="text-2xl text-slate-500 py-2 font-bold mx-auto"> {{ lang.NO_GROUPS }} </p>
                    <p class="text-2xl text-slate-500 py-1 mx-auto"> {{ lang.NO_GROUPS_DESC }} </p>
                        

                    </div>
                    <div v-if="groups.length > 0" class="flex justify-evenly">
                        


                    </div>
                </card>
            </div>

        </div>
    </div>
</template>

<script>
import Lang from '../../scripts/Lang';
import Card from '../cards/Card.vue';

const groups = [
    // {name: "Group 1"},
];

export default {
    name: "UserGroups",
    components: {
        Card
    },
    data() {
        return { groups, lang: Lang.CurrentLang }
    },
    mounted() {
        Lang.addCallback(lang => this.lang = lang);
    }
}
</script>