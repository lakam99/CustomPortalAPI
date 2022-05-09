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
    json_required: new SocketData_1.SocketData({ error: 'You must provide json data.' }),
    provider_accept: new SocketData_1.SocketData({ accepted: true, message: 'The provider has accepted your connection.' })
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
    match_connection(client_connection, provider) {
        return this.active_connections.filter((active_connection) => {
            return active_connection.provider.name == provider.name && active_connection.IP == client_connection['_socket'].remoteAddress;
        });
    }
    do_if_client_reconnecting_to_provider(client_connection, provider) {
        var matches = this.match_connection(client_connection, provider);
        if (matches.length) {
            var match = matches.length > 1 ? matches[matches.length - 1] : matches[0];
            match.reconnect(client_connection);
            return true;
        }
        return false;
    }
    get_provider_by_name(name) {
        return this.providers.filter(provider => provider.name == name)[0];
    }
    introduce_connection_to_provider(client_connection, parsed) {
        let provider = this.get_provider_by_name(parsed['provider']);
        if (!provider) {
            SocketManager.send_err_response(client_connection, exports.PREMADE_RESPONSES.no_operator);
        }
        else if (!this.do_if_client_reconnecting_to_provider(client_connection, provider)) {
            this.active_connections.push(new WebsocketInterface_1.WebSocketInterface(client_connection, new provider.classType()));
            client_connection.send(exports.PREMADE_RESPONSES.provider_accept.toString());
        }
    }
    process_connection() {
        this.socket.on('connection', (client_connection) => {
            client_connection.addEventListener('message', (data) => {
                let parsed = SocketData_1.SocketData.receive_data(data.data);
                if (parsed === false) {
                    SocketManager.send_err_response(client_connection, exports.PREMADE_RESPONSES.json_required);
                }
                else if (parsed['provider'] === undefined)
                    SocketManager.send_err_response(client_connection, exports.PREMADE_RESPONSES.no_operator);
                else {
                    this.introduce_connection_to_provider(client_connection, parsed);
                }
            }, { once: true });
        });
    }
}
exports.SocketManager = SocketManager;
