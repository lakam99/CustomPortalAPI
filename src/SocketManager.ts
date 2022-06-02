import { ActiveConnections } from "./ActiveConnections";
import { SocketData } from "./SocketData";
import { WebSocketInterface } from "./WebsocketInterface";
import { WebsocketProvider } from "./WebsocketProvider";
import {OldOpenTickets} from "./OldOpenTickets.WebsocketProvider";

export const PREMADE_RESPONSES = {
    setup: new SocketData({controller_needed:true}),
    no_operator: new SocketData({error: 'You must provide a valid operator.'}),
    json_required: new SocketData({error: 'You must provide json data.'}),
    no_user_id: new SocketData({error: 'No "user" param with user id was provided.'}),
    provider_accept: new SocketData({accepted: true, message: 'The provider has accepted your connection.'}),
    ok: new SocketData({ok:true})
}

export class SocketManager {
    socket:any;
    active_connections:ActiveConnections;
    premade_data:any;
    providers:Array<WebsocketProvider>;

    constructor(socket) {
        this.socket = socket;
        this.active_connections = new ActiveConnections();
        this.providers = [];
        this.providers.push(new WebsocketProvider('Old Open Tickets', OldOpenTickets));
        this.process_connection();
    }

    private static send_err_response(client:WebSocket, response:SocketData) {
        client.send(response.toString());
        client.close();
    }

    private match_connection(client_connection:WebSocket, provider:WebsocketProvider, user_id:string):Array<WebSocketInterface> {
        return this.active_connections.filter((active_connection)=>{
            return active_connection.provider.name == provider.name 
            && active_connection.IP == client_connection['_socket'].remoteAddress
            && active_connection.user_id == user_id;
        });
    }
    
    private do_if_client_reconnecting_to_provider(client_connection:WebSocket,  provider:WebsocketProvider, user_id:string):Boolean {
        var matches = this.match_connection(client_connection, provider, user_id);
        if (matches.length) {
            var match = matches.length > 1 ? matches[matches.length - 1] : matches[0];
            match.reconnect(client_connection);
            return true;
        }
        return false;
    }

    private get_provider_by_name(name:string) {
        return this.providers.filter(provider=>provider.name == name)[0];
    }

    private introduce_connection_to_provider(client_connection:WebSocket, parsed:SocketData) {
        let provider = this.get_provider_by_name(parsed['provider']);
        let user_id = parsed['user'];
        if (!provider)
             SocketManager.send_err_response(client_connection, PREMADE_RESPONSES.no_operator);
        else if (!user_id)
            SocketManager.send_err_response(client_connection, PREMADE_RESPONSES.no_user_id);
        else if (!this.do_if_client_reconnecting_to_provider(client_connection, provider, user_id)) {
            this.active_connections.push(new WebSocketInterface(client_connection, new provider.classType(), user_id));
            client_connection.send(PREMADE_RESPONSES.provider_accept.toString());
        }
    }

    private process_connection() {
        this.socket.on('connection', (client_connection:WebSocket)=>{
            client_connection.addEventListener('message', (data)=>{
                let parsed = SocketData.receive_data(data.data);
                if (parsed === false) {
                    SocketManager.send_err_response(client_connection, PREMADE_RESPONSES.json_required);
                }else if (parsed['provider'] === undefined)
                    SocketManager.send_err_response(client_connection, PREMADE_RESPONSES.no_operator);
                else {
                    this.introduce_connection_to_provider(client_connection, parsed);
                }
            }, {once:true});
        })
    }
}