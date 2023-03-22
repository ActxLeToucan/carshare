<template>
    <div class="flex grow bg-slate-50 dark:bg-slate-800 min-w-0 max-w-full">
        <router-view />
    </div>
</template>

<script>
export default {
    name: "App",
    components: {},
    data() {
        return {}
    },
    mounted() {
        // get current theme and apply it
        const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const forcedTheme = localStorage.getItem("theme");
        const enableDarkMode = forcedTheme ? forcedTheme == "0" : isDarkMode;

        if (enableDarkMode) document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
    }
};
</script>

<style>
</style>