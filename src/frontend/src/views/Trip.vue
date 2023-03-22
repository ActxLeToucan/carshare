<template>
  <div class="flex grow flex-col">
    <top-bar v-if="User.CurrentUser != null" />
    <div class="flex grow w-fit flex-col justify-center space-y-6 mx-auto min-w-0 max-w-full">
      <card-modal
        :oncancel="onCancel"
        :onvalidate="onValidate"
        :title="lang.TRIP_TITLE"
      >

      </card-modal>
    </div>
  </div>
</template>

<script>
import CardModal from "../components/cards/CardModal.vue";
import Lang from "../scripts/Lang";
import User from "../scripts/User";
import TopBar from "../components/topbar/Topbar.vue";

function onCancel(modal) {
  return true;
}

function onValidate(modal) {
  return true;
}

export default {
  name: "TripView",
  components: {TopBar, CardModal},
  data() {
    return { User, lang: Lang.CurrentLang }
  },
  mounted() {
    Lang.AddCallback(lang => this.lang = lang);
  },
  created() {
    console.log(this.$route.params);
  },
  methods: {
    onCancel,
    onValidate
  }
}
</script>

<style scoped>

</style>