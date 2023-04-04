<template>
    <div class="flex justify-end h-0 w-full pointer-events-none">
        <div
            v-show="m_data.length > 0 && showing"
            class="show-up h-fit pointer-events-auto flex flex-col rounded-md border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-600 shadow-md"
            :style="'margin-top: ' + y/2 + 'em; margin-left: ' + x/2 + 'em; z-index: 1000;'"
        >
            <div
                v-for="el in m_data"
                :key="el.id"
                class="cursor-pointer hover:bg-slate-50 hover:dark:bg-slate-500 px-2 py-1 min-w-full rounded-md border-2 border-transparent
                       w-full hover:border-slate-200 hover:dark:border-slate-400 hover:w-fit"
                @click="() => {onclicked(el);}"
            >
                <p class="text-lg text-slate-500 dark:text-slate-300 whitespace-nowrap text-ellipsis overflow-hidden font-semibold">
                    {{ el.value }}
                </p>
                <p class="text-sm text-slate-400 dark:text-slate-400 whitespace-nowrap text-ellipsis overflow-hidden italic">
                    {{ el.desc }}
                </p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'SelectorList',
    components: {},
    props: {
        data: {
            type: Array,
            default: () => [],
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
        },
        onload: {
            type: Function,
            default: null,
            required: false
        },
        oncancel: {
            type: Function,
            default: null,
            required: false
        },
        detached: {
            type: Boolean,
            default: false,
            required: false
        }
    },
    data() {
        return {m_data: [], showing: true, mouse: {x: 0, y: 0}, m_selection: 0, input: null};
    },
    mounted() {
        this.setData(this.data);
        this.setSelection(this.selection);
        window.addEventListener("mousemove", ev => {
            this.mouse.x = ev.clientX;
            this.mouse.y = ev.clientY;
        });

        if (this.onload)
            this.onload(this);

        if (this.detached) {
            this.$el.style.position = "absolute";
            this.$el.classList.remove("h-0", "w-full", "pointer-events-none")
            this.$el.style.top = "0";
            this.$el.style.left = "0";
            document.body.appendChild(this.$el);
            this.goToInput();
        }
    },
    methods: {
        setData(data) {
            if (this.m_data.length != data.length) this.setSelection(-1);
            this.m_data = data;
            this.goToInput();
        },
        setShowing(showing) {
            this.showing = showing;
            this.goToInput();
        },
        getData() {
            return this.m_data;
        },
        setSelection(selection) {
            this.m_selection = typeof(selection) === "string" ? parseInt(selection) : selection;
            this.showing = true;
            const children = this.$el.firstElementChild.children;
            let index = 0;
            for (const child of children) {
                if (index == this.m_selection) {
                    child.classList.add("bg-slate-50", "dark:bg-slate-500", "border-slate-200", "dark:border-slate-400", "w-fit");
                    child.classList.remove("w-full", "border-transparent");
                } else {
                    child.classList.add("w-full", "border-transparent");
                    child.classList.remove("bg-slate-50", "dark:bg-slate-500", "border-slate-200", "dark:border-slate-400", "w-fit");
                }
                index++;
            }
            this.goToInput();
        },
        attachInput(input) {
            let timeout = null;
            this.input = input;

            input.addEventListener("focus", ev => this.showing = true);
            input.addEventListener("blur", ev => {
                const rect = this.$el.firstElementChild.getBoundingClientRect();
                if (this.mouse.x < rect.left || this.mouse.x > rect.left + rect.width || this.mouse.y < rect.top || this.mouse.y > rect.top + rect.height) {
                    this.showing = false;
                    if (this.oncancel) this.oncancel(this);
                }
            });
            input.addEventListener('keyup', ev => {
                const avoided = ["ArrowDown", "ArrowUp", "Enter", "Escape", "Shift", "Control", "Alt", "Meta", "CapsLock", "Tab"];
                if (avoided.includes(ev.key)) {
                    ev.preventDefault();
                    return;
                }
                
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
                case "Escape":
                    this.setSelection(-1);
                    this.setShowing(false);
                    ev.preventDefault();
                    break;
                }
            });

            this.goToInput();
        },
        onclicked(el) {
            if (this.onclick) {
                this.onclick(el);
            }
            this.showing = false;
        },
        select() {
            this.onclicked(this.m_data[this.m_selection]);
        },
        next() {
            this.setSelection((this.m_selection + 1 == this.m_data.length) ? 0 : this.m_selection + 1);
        },
        prev() {
            this.setSelection((this.m_selection - 1 < 0) ? this.m_data.length - 1 : this.m_selection - 1);
        },
        goToInput() {
            if (!this.input) return;
            const rect = this.input.getBoundingClientRect();
            this.$el.firstElementChild.style.width = rect.width + "px";

            if (!this.detached) return;
            this.$el.style.top = rect.top + rect.height + "px";
            this.$el.style.left = rect.left + "px";
        }
    }
}
</script>