"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketInterface = void 0;
class WebSocketInterface {
    constructor(connection, provider) {
        Object.assign(this, { connection, provider });
    }
    send(data) {
        this.connection.send(data.toString());
    }
    process_data(data) {
        this.provider.process_data(data).then(data => this.send(data));
    }
}
exports.WebSocketInterface = WebSocketInterface;
