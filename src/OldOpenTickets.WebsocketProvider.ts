const https = require('https');
import { WebsocketProvider } from "./WebsocketProvider";

export class OldOpenTickets extends WebsocketProvider {
    client_connection: WebSocket;
    name = 'Old Open Tickets';
    status = 'closed';

    do_work (data):Promise<any> {
        return new Promise((resolve,reject)=>{
            https.get(`https://services/api/V3/WorkItem/GetGridWorkItemsByUser?userId=${data.userId}&isScoped=false&showActivities=false&showInactiveItems=false`, (resp)=>{
                let data = {data:JSON.parse(resp)};
                resolve(data);
            });
        });
    }
}