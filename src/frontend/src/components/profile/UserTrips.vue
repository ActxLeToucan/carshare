<template>
    <div class="md:show-up flex flex-col grow">
        <p class="text-2xl text-teal-500 py-2 font-bold mx-auto"> {{ lang.MY_TRIPS }} </p>
    </div>
</template>

<script>
import Lang from '../../scripts/Lang'

export default {
    name: "UserTrips",
    components: {},
    data() {
        return { lang: Lang.CurrentLang }
    },
    mounted() {
        Lang.addCallback(lang => this.lang = lang);
    }
}
</script>