"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveConnections = void 0;
class ActiveConnections extends Array {
    constructor() {
        super();
    }
    push(...items) {
        [...items].forEach(item => item.start_listening());
        let r = super.push(...items);
        return r;
    }
}
exports.ActiveConnections = ActiveConnections;
