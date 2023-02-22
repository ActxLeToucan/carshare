<template>
    <div class="flex grow bg-slate-50">
        <router-view class="overflow-y-scroll"></router-view>
    </div>
</template>

<script>

export default {
    name: "App",
    components: {
        
    },
    data() {
        return {
            year: new Date().getFullYear()
        }
    },
    mounted() {

    }
};
</script>

<style>
</style>