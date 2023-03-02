<template>
    <div class="flex grow flex-col">
        <topbar></topbar>
        <div class="flex grow w-fit flex-col justify-center space-y-6 mx-auto">
            <h1 class="md:text-6xl text-4xl font-extrabold text-teal-500 text-center"> Car Share - Application </h1>
            <img src="../assets/img/car.svg" class="max-w-full md:max-h-20 max-h-12 mx-auto" alt="">
        </div>
    </div>
</template>

<script>
import Topbar from "../components/topbar/Topbar.vue"

export default {
    components: { Topbar },
    name: 'Main',
    data() {
        return {}
    }
}
</script>