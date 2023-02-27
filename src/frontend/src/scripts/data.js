export function retreiveFields(el) {
    /**@type {HTMLDivElement} */
    const inputs_div = el.$refs["inputs"];
    const inputs = [];
    for (let i = 0; i < inputs_div.children.length; i++) {
        const div = inputs_div.children[i];
        const input = div.querySelector("input");
        if (!input) continue;

        if (input.type == "checkbox")
            input.value = input.checked ? true : false;

        inputs.push(input);
    }

    el.inputs = inputs;
    el.get = (name) => {
        const input = inputs.find(input => input.name == name);
        if (!input) return null;
        return input.value;
    };
    el.focus = (name) => {
        const input = inputs.find(input => input.name == name);
        if (!input) return false;
        input.focus();
        return true;
    };
}