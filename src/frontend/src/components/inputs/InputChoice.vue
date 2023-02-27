<template>
    <div class="flex h-fit w-full justify-between md:space-x-8 items-center my-2">
        <label class="flex text-xl text-slate-500 font-bold whitespace-nowrap text-ellipsis w-fit">
            {{ label }}
        </label>
        <div>
            <select
                ref="select" name="" id=""
                class="flex w-fit h-fit bg-white rounded-md text-slate-600 font-bold text-lg whitespace-nowrap text-ellipsis
                       outline-transparent px-4 py-2 border-b-4 border-sslate-500 transition-all focus:outline hover:border-slate-300"
            >
                <option v-for="el in this.elements" :value="el.value" :key="el.value"> {{ el.label }} </option>
            </select>
        </div>
        <input ref="input" :name="name" type="text" class="hidden">
    </div>
</template>

<script>

function setup(obj) {
    obj.selected = obj.value;
    obj.inputEl = null;
    obj.selectEl = null;

    obj.setSelected = (el) => {
        obj.selected = el;
        if (obj.onchange) {
            obj.onchange(el);
        }
        if (obj.inputEl != null) {
            obj.inputEl.value = el;
        }
        if (obj.selectEl != null) {
            obj.selectEl.value = el;
        }
        obj.elements.forEach(item => {
            item.selected = item.value == el;
        });
        obj.$forceUpdate();
    };

    obj.elements = [];
    for (let i = 0; i < obj.list.length; i++) {
        const el = obj.list[i];
        obj.elements.push({
            label: el.label,
            value: el.value,
            selected: el.value === obj.value || el.selected
        });
    }
}

export default {
    name: 'Choice',
    data() {
        setup(this);
        return {};
    },
    components: {},
    methods: {},
    props: {
        label: {
            type: String,
            default: "",
            required: false
        },
        value: {
            type: String,
            default: "",
            required: false
        },
        list: {
            type: Array,
            default: [],
            required: true
        },
        onchange: {
            type: Function,
            required: false
        },
        name: {
            type: String,
            default: "",
            required: false
        }
    },
    mounted() {
        this.elements.forEach(item => {
            if (item.selected) {
                this.selected = item.value;
            }
        });

        this.inputEl = this.$refs["input"];
        this.inputEl.value = this.selected;
        this.selectEl = this.$refs["select"];
        this.selectEl.value = this.selected;
        this.selectEl.addEventListener("change", (e) => {
            this.setSelected(e.target.value);
        });
    }
}
</script>