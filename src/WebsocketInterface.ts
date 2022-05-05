import { SocketData } from "./SocketData";
import { WebsocketProvider } from "./WebsocketProvider";

export class WebSocketInterface {
    connection:WebSocket;
    provider:WebsocketProvider;

    constructor(connection:WebSocket, provider:WebsocketProvider) {
        Object.assign(this, {connection, provider})
    }

    send(data:SocketData) {
        this.connection.send(data.toString());
    }

    process_data(data:SocketData) {
        this.provider.process_data(data);
    }
}