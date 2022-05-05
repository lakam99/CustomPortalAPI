import { SocketData } from "./SocketData";
import { PREMADE_RESPONSES } from "./SocketManager";
import { WebSocketInterface } from "./WebsocketInterface";

export class ActiveConnections extends Array<WebSocketInterface>{
    connections:Array<WebSocketInterface>;

    constructor() {
        super();
    }

    start_listening(client:WebSocketInterface) {
        client.connection.onmessage = (message:MessageEvent) => {
            let parsed_data = SocketData.receive_data(message.data);
            if (parsed_data === false)
                client.send(PREMADE_RESPONSES.json_required);
            else {
                client.process_data(parsed_data);
            }
        }
    }

    push(...items: WebSocketInterface[]): number {
        let r = super.push(...items);
        [...items].forEach(item=>this.start_listening(item));
        return r;
    }
}