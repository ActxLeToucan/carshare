export function executeAfter(obj, callback) {
    if ( obj === undefined || obj === null ) {
        callback();
        return;
    }

    if (obj instanceof Promise) {
        obj.then(callback);
    } else {
        callback(obj);
    }
}