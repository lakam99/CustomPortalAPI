"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketData = void 0;
class SocketData extends Object {
    constructor(data_obj) {
        super();
        Object.assign(this, data_obj);
    }
    static receive_data(data) {
        try {
            var parsed_data = JSON.parse(data);
        }
        catch (_a) {
            return false;
        }
        return new SocketData(parsed_data);
    }
    toString() {
        return JSON.stringify(this);
    }
}
exports.SocketData = SocketData;
