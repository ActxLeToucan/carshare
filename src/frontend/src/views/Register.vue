<template>
    <div class="flex grow flex-col">
        <topbar></topbar>
        <div class="flex grow w-fit flex-col justify-center space-y-6 mx-auto">
            
        </div>
    </div>
</template>

<script>
import Topbar from "../components/topbar/Topbar.vue"

export default {
    components: { Topbar },
    name: 'Register',
    data() {
        return {}
    }
}
</script>