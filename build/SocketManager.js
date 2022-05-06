"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketManager = exports.PREMADE_RESPONSES = void 0;
const ActiveConnections_1 = require("./ActiveConnections");
const SocketData_1 = require("./SocketData");
const WebsocketInterface_1 = require("./WebsocketInterface");
const WebsocketProvider_1 = require("./WebsocketProvider");
const OldOpenTickets_WebsocketProvider_1 = require("./OldOpenTickets.WebsocketProvider");
exports.PREMADE_RESPONSES = {
    setup: new SocketData_1.SocketData({ controller_needed: true }),
    no_operator: new SocketData_1.SocketData({ error: 'You must provide a valid operator.' }),
    json_required: new SocketData_1.SocketData({ error: 'You must provide json data.' })
};
class SocketManager {
    constructor(socket) {
        this.socket = socket;
        this.active_connections = new ActiveConnections_1.ActiveConnections();
        this.providers = [];
        this.providers.push(new WebsocketProvider_1.WebsocketProvider('Old Open Tickets', OldOpenTickets_WebsocketProvider_1.OldOpenTickets));
        this.process_connection();
    }
    static send_err_response(client, response) {
        client.send(response.toString());
        client.close();
    }
    process_connection() {
        this.socket.on('connection', (client_connection) => {
            client_connection.addEventListener('message', (data) => {
                let parsed = SocketData_1.SocketData.receive_data(data.data);
                if (parsed === false) {
                    SocketManager.send_err_response(client_connection, exports.PREMADE_RESPONSES.json_required);
                }
                ;
                if (parsed['provider'] === undefined)
                    SocketManager.send_err_response(client_connection, exports.PREMADE_RESPONSES.no_operator);
                else {
                    let provider = this.providers.filter(provider => provider.name == parsed['provider'])[0];
                    if (!provider)
                        SocketManager.send_err_response(client_connection, exports.PREMADE_RESPONSES.no_operator);
                    else {
                        this.active_connections.push(new WebsocketInterface_1.WebSocketInterface(client_connection, new provider.classType()));
                    }
                }
            }, { once: true });
        });
    }
}
exports.SocketManager = SocketManager;
