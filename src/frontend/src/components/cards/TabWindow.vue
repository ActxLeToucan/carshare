<template>
    <div class="flex flex-col grow overflow-scroll">
        <slot></slot>
    </div>
</template>

<script>
export default {
    name: 'TabWindow',
    props: {
        defaultHash: {
            type: String,
            default: '',
            required: false
        }
    },
    data() {
        return {
            activeHash: this.defaultHash
        }
    },
    methods: {
        setActiveHash(hash) {
            this.activeHash = hash;
        },
        getTab(hash) {
            return document.getElementById('tab-' + hash);
        }
    },
    mounted() {
        if (window.location.hash != '') {
            this.activeHash = window.location.hash;
        }

        this.update = () => {
            for (let i = 0; i < this.$el.children.length; i++) {
                if (this.$el.children[i].id == 'tab-' + this.activeHash) {
                    this.$el.children[i].classList.remove('hidden');
                } else {
                    this.$el.children[i].classList.add('hidden');
                }
            }
        };
        this.update();
    },
    watch: {
        '$route.hash': function (newVal, oldVal) {
            if (newVal != '') {
                this.activeHash = newVal;
            } else {
                this.activeHash = this.defaultHash;
            }
            this.update();
        }
    }
}
</script>