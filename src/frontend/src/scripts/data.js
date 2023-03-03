export function retreiveFields(el) {
    /**@type {HTMLDivElement} */
    const inputs_div = el.$refs["inputs"];
    const inputs = [];
    for (let i = 0; i < inputs_div.children.length; i++) {
        const div = inputs_div.children[i];
        const input = div.querySelector("input");
        if (!input) continue;

        input.value = getTypedValue(input);

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

export function getTypedValue(input) {
    switch (input.type) {
        case "number":
            return Number(input.value);
        case "checkbox":
            return input.checked;
        default:
            return input.value;
    }
}

export const genres = [
    {value: 1,  label: "Homme"},
    {value: -1, label: "Non spécifié"},
    {value: 0,  label: "Femme"},
];