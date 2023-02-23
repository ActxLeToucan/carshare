<template>
    <div :id="'tab-' + hash" class="flex grow">
        <slot></slot>
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