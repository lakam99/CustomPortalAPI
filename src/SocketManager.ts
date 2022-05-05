import { ActiveConnections } from "./ActiveConnections";
import { SocketData } from "./SocketData";
import { WebSocketInterface } from "./WebsocketInterface";
import { WebsocketProvider } from "./WebsocketProvider";

export const PREMADE_RESPONSES = {
    setup: new SocketData({controller_needed:true}),
    no_operator: new SocketData({error: 'You must provide a valid operator.'}),
    json_required: new SocketData({error: 'You must provide json data.'})
}

export class SocketManager {
    socket:any;
    active_connections:ActiveConnections;
    premade_data:any;
    providers:Array<WebsocketProvider>;

    constructor(socket) {
        this.socket = socket;
        this.active_connections = new ActiveConnections();
        this.process_connection();
    }

    private static send_err_response(client:WebSocket, response:SocketData) {
        client.send(response.toString());
        client.close();
    }

    private process_connection() {
        this.socket.on('connection', (client_connection:WebSocket)=>{
            client_connection.addEventListener('message', (data)=>{
                let parsed = SocketData.receive_data(data.data);
                if (parsed === false) {
                    SocketManager.send_err_response(client_connection, PREMADE_RESPONSES.json_required);
                };
                if (parsed['provider'] === undefined)
                    SocketManager.send_err_response(client_connection, PREMADE_RESPONSES.no_operator);
                else {
                    let provider = this.providers.filter(provider=>provider.name == parsed['provider'])[0];
                    if (!provider)
                        SocketManager.send_err_response(client_connection, PREMADE_RESPONSES.no_operator);
                    else {
                        this.active_connections.push(new WebSocketInterface(client_connection, provider));
                    }
                }
            }, {once:true});
        })
    }
}