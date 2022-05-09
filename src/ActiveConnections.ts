import { SocketData } from "./SocketData";
import { PREMADE_RESPONSES } from "./SocketManager";
import { WebSocketInterface } from "./WebsocketInterface";

export class ActiveConnections extends Array<WebSocketInterface>{
    connections:Array<WebSocketInterface>;

    constructor() {
        super();
    }

    push(...items: WebSocketInterface[]): number {
        [...items].forEach(item=>item.start_listening());
        let r = super.push(...items);
        return r;
    }
}