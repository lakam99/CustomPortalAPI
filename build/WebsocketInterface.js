"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketInterface = void 0;
const SocketData_1 = require("./SocketData");
const SocketManager_1 = require("./SocketManager");
class WebSocketInterface {
    constructor(connection, provider, user_id) {
        Object.assign(this, { connection, provider, user_id });
        this.data_queue = [];
        this.IP = this.connection['_socket'].remoteAddress;
    }
    start_listening() {
        this.connection.onmessage = (message) => {
            let parsed_data = SocketData_1.SocketData.receive_data(message.data);
            if (parsed_data === false)
                this.send(SocketManager_1.PREMADE_RESPONSES.json_required);
            else {
                this.process_data(parsed_data);
            }
        };
    }
    send(data) {
        if (this.connection.readyState != 1) {
            this.data_queue.push(data);
        }
        else {
            this.connection.send(data.toString());
        }
    }
    run_queue() {
        this.data_queue.forEach((queue_item) => {
            this.send(queue_item);
        });
        this.data_queue = [];
    }
    reconnect(new_connection) {
        let current_ip = this.IP;
        let new_ip = this.connection['_socket'].remoteAddress;
        if (current_ip == new_ip) {
            this.connection = new_connection;
            this.start_listening();
            this.send(SocketManager_1.PREMADE_RESPONSES.provider_accept);
        }
        else {
            throw `Old IP ${current_ip} does not match new IP ${new_ip}.`;
        }
    }
    process_data(data) {
        if (this.data_queue.length)
            this.run_queue();
        else
            this.provider.process_data(data).then(data => this.send(data), error => this.send(new SocketData_1.SocketData({ error })));
    }
}
exports.WebSocketInterface = WebSocketInterface;
