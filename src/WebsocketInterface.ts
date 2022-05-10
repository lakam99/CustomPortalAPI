import { SocketData } from "./SocketData";
import { PREMADE_RESPONSES } from "./SocketManager";
import { WebsocketProvider } from "./WebsocketProvider";

export class WebSocketInterface {
    connection:WebSocket;
    provider:WebsocketProvider;
    data_queue: Array<SocketData>;
    IP: any;

    constructor(connection:WebSocket, provider:WebsocketProvider) {
        Object.assign(this, {connection, provider});
        this.data_queue = [];
        this.IP = this.connection['_socket'].remoteAddress;
    }

    start_listening() {
        this.connection.onmessage = (message:MessageEvent) => {
            let parsed_data = SocketData.receive_data(message.data);
            if (parsed_data === false)
                this.send(PREMADE_RESPONSES.json_required);
            else {
                this.process_data(parsed_data);
            }
        }
    }

    send(data:SocketData) {
        if (this.connection.readyState != 1) {
            this.data_queue.push(data);
        } else {
            this.connection.send(data.toString());
        }
    }

    private run_queue() {
        this.data_queue.forEach((queue_item)=>{
            this.send(queue_item);
        })
        this.data_queue = [];
    }

    reconnect(new_connection:WebSocket) {
        let current_ip = this.IP;
        let new_ip = this.connection['_socket'].remoteAddress;
        if (current_ip == new_ip) {
            this.connection = new_connection;
            this.start_listening();
            this.send(PREMADE_RESPONSES.provider_accept);
        } else {
            throw `Old IP ${current_ip} does not match new IP ${new_ip}.`;
        }
    }

    process_data(data:SocketData) {
        if (this.data_queue.length) this.run_queue();
        else this.provider.process_data(data).then(data=>this.send(data),error=>this.send(new SocketData({error})));
    }
}