<template>
    <div class="flex h-fit w-full justify-between md:space-x-8 space-x-4 items-center my-2 min-w-0 max-w-full">
        <label class="flex text-xl text-slate-500 dark:text-slate-400 font-bold whitespace-nowrap text-ellipsis w-fit">
            {{ label }}
        </label>
        <div class="min-w-0 max-w-full">
            <select
                id=""
                ref="select"
                name=""
                class="flex w-fit h-fit bg-white dark:bg-slate-600 rounded-md text-slate-600 dark:text-slate-300 font-bold text-lg whitespace-nowrap text-ellipsis outline-none
                       min-w-0 max-w-full outline-transparent px-4 py-2 border-b-4 border-slate-200 dark:border-slate-700 transition-all focus:border-teal-500 hover:border-slate-300"
            >
                <option
                    v-for="el in elements"
                    :key="el.value"
                    :value="el.value"
                >
                    {{ el.label ?? lang[el.id] }}
                </option>
            </select>
        </div>
        <input
            ref="input"
            :name="name"
            type="number"
            class="hidden"
        >
    </div>
</template>

<script>
import Lang from '../../scripts/Lang';

function setup(obj) {
    obj.selected = obj.value;
    obj.inputEl = null;
    obj.selectEl = null;

    obj.setSelected = (el, triggerEvent=true) => {
        obj.selected = el;
        if (obj.onchange && triggerEvent) {
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
            id: el.id,
            value: el.value,
            selected: el.value === obj.value || el.selected
        });
    }
}

export default {
    name: 'InputChoice',
    components: {},
    props: {
        label: {
            type: String,
            default: "",
            required: false
        },
        value: {
            type: [Number, String],
            default: 0,
            required: false
        },
        list: {
            type: Array,
            default: () => [],
            required: true
        },
        onchange: {
            type: Function,
            default: null,
            required: false
        },
        name: {
            type: String,
            default: "",
            required: false
        }
    },
    data() {
        setup(this);
        return { lang: Lang.CurrentLang };
    },
    watch: {
        value: function (val) {
            this.setSelected(val, false);
        }
    },
    mounted() {
        Lang.AddCallback(lang => this.lang = lang);

        this.selected = this.value;
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
    },
    methods: {}
}
</script>