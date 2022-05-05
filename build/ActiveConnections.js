"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveConnections = void 0;
const SocketData_1 = require("./SocketData");
const SocketManager_1 = require("./SocketManager");
class ActiveConnections extends Array {
    constructor() {
        super();
    }
    start_listening(client) {
        client.connection.onmessage = (message) => {
            let parsed_data = SocketData_1.SocketData.receive_data(message.data);
            if (parsed_data === false)
                client.send(SocketManager_1.PREMADE_RESPONSES.json_required);
            else {
                client.process_data(parsed_data);
            }
        };
    }
    push(...items) {
        let r = super.push(...items);
        [...items].forEach(item => this.start_listening(item));
        return r;
    }
}
exports.ActiveConnections = ActiveConnections;
