import Lang from "./Lang";

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

export function isPhoneNumber(val) {
    if (!val) return false;
    return val.replace(/(\.|\s|-)/g, "").trim().match(/^((00[0-9]{2})?0[0-9][0-9]{8}|\+[0-9]{11,12})$/) != null;
}

export const genres = [
    {value: 1,  id: 'MALE'},
    {value: -1, id: 'UNSPECIFIED'},
    {value: 0,  id: 'FEMALE'},
];

export const themes = [
    {value: 0, id: 'DARKMODE'},
    {value: 1, id: 'LIGHTMODE'},
    {value: -1, id: 'DEFAULT'},
];
export const levels = [
    {value: 0, id: 'USER'},
    {value: 1, id: 'ADMIN'},
    {value: 2, id: 'SUPER_ADMIN'},
];
