<template>
    <div
        :id="'tab-' + hash"
        class="flex grow max-w-full"
    >
        <slot />
    </div>
</template>

<script>
export default {
    name: 'TabDiv',
    props: {
        hash: {
            type: String,
            default: '',
            required: true
        }
    },
    data() {
        return {}
    },
    methods: {
        
    }
}
</script>