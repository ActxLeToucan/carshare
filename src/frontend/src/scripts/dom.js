export function applyClasses(dom, classes) {
    dom.classList.remove(...dom.classList);

    if (classes === undefined || classes === null) {
        return;
    }

    if (typeof classes === "string") {
        const list = classes.split(" ");
        dom.classList.add(...list);
    } else if (classes instanceof Array) {
        dom.classList.add(...classes);
    }
}