<template>
    <div class="h-0 w-0 pointer-events-none">
        <div
            v-show="_data.length > 0 && showing"
            class="absolute pointer-events-auto flex flex-col rounded-md border-2 border-slate-200 bg-white shadow-md"
            :style="'margin-top: ' + y/2 + 'em; margin-left: ' + x/2 + 'em;'">
            <p v-for="el in _data" :key="el.id" v-on:click="() => {onclicked(el);}"
               class="text-lg text-slate-500 font-semibold p-2 cursor-pointer hover:bg-slate-100"
            > {{ el.value }} </p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Selector',
    components: {},
    data() {
        return {_data: [], showing: true, mouse: {x: 0, y: 0}, _selection: 0};
    },
    methods: {
        setData(data) {
            if (this._data.length != data.length) this.setSelection(-1);
            this._data = data;
        },
        getData() {
            return this._data;
        },
        setSelection(selection) {
            this._selection = typeof(selection) === "string" ? parseInt(selection) : selection;
            const children = this.$el.firstElementChild.children;
            let index = 0;
            for (const child of children) {
                if (index == this._selection) {
                    child.classList.add("bg-slate-100");
                } else {
                    child.classList.remove("bg-slate-100");
                }
                index++;
            }
        },
        attachInput(input) {
            let timeout = null;
            input.addEventListener("focus", ev => this.showing = true);
            input.addEventListener("blur", ev => {
                const rect = this.$el.firstElementChild.getBoundingClientRect();
                if (this.mouse.x < rect.left || this.mouse.x > rect.left + rect.width || this.mouse.y < rect.top || this.mouse.y > rect.top + rect.height) {
                    this.showing = false;
                }
            });
            input.addEventListener('keyup', ev => {
                if (ev.key === "ArrowDown" || ev.key === "ArrowUp" || ev.key === "Enter") return;
                
                if (timeout) clearTimeout(timeout);
                timeout = setTimeout(() => {
                    const search = ev.target.value;
                    if (search === "") {
                        this.setData([]);
                        return;
                    }

                    if (this.oncompletion)
                        this.oncompletion(this, search);

                }, 400);
            });
            input.addEventListener("keydown", ev => {
                switch (ev.key) {
                    case "Enter":
                        this.select();
                        ev.preventDefault();
                        break;
                    case "ArrowDown":
                        this.next();
                        ev.preventDefault();
                        break;
                    case "ArrowUp":
                        this.prev();
                        ev.preventDefault();
                        break;
                }
            });
        },
        onclicked(el) {
            if (this.onclick) {
                this.onclick(el);
            }
        },
        select() {
            this.onclicked(this._data[this._selection]);
        },
        next() {
            this.setSelection((this._selection + 1 == this._data.length) ? 0 : this._selection + 1);
        },
        prev() {
            this.setSelection((this._selection - 1 < 0) ? this._data.length - 1 : this._selection - 1);
        }
    },
    props: {
        data: {
            type: Array,
            default: [],
            required: false
        },
        x: {
            type: [Number, String],
            default: 0,
            required: false
        },
        y: {
            type: [Number, String],
            default: 0,
            required: false
        },
        selection: {
            type: [Number, String],
            default: 0,
            required: false
        },
        onclick: {
            type: Function,
            default: null,
            required: false
        },
        oncompletion: {
            type: Function,
            default: null,
            required: false
        }
    },
    mounted() {
        this.setData(this.data);
        this.setSelection(this.selection);
        window.addEventListener("mousemove", ev => {
            this.mouse.x = ev.clientX;
            this.mouse.y = ev.clientY;
        });
    }
}
</script>