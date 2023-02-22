<template>
    <div class="flex h-fit w-full justify-between md:space-x-8 items-center my-2">
        <label class="flex text-xl text-slate-500 font-bold whitespace-nowrap text-ellipsis w-fit">
            {{ label }}
        </label>
        <div>
            <div class="md:flex hidden h-fit rounded-md font-bold text-lg whitespace-nowrap text-ellipsis hover:border-slate-300 transition-all focus:outline outline-transparent space-x-2">
                <button
                    v-for="el in this.elements"
                    :class="el.selected? ' text-slate-50 bg-teal-500 hover:bg-teal-600 border-teal-600 hover:border-teal-700 ' : ' bg-white text-slate-600 hover:bg-slate-100 border-slate-200 hover:border-slate-300 '"
                    :key="el.value"
                    v-on:click="this.setSelected(el.value)"
                    class="flex h-fit border-b-4 rounded-md px-4 py-2 font-bold text-lg whitespace-nowrap text-ellipsis transition-all cursor-pointer">
                    <p class="text-lg text-center font-semibold px-2 mx-auto"> {{ el.label }} </p>
                </button>
            </div>
            <select
                ref="select" name="" id=""
                class="md:hidden flex w-fit h-fit bg-white rounded-md text-slate-600 font-bold text-lg whitespace-nowrap text-ellipsis
                       outline-transparent px-4 py-2 border-b-4 border-sslate-500 transition-all focus:outline hover:border-slate-300"
            >
                <option v-for="el in this.elements" :value="el.value"> {{ el.label }} </option>
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