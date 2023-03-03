<template>
    <div class="flex grow flex-col">
        <topbar></topbar>
        <div class="flex grow flex-col">
            
            <div class="flex w-full h-[40%] bg-teal-500">

            </div>
            <div class="flex grow">

            </div>

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