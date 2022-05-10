import { today_add } from "./reusable";
import { WebsocketProvider } from "./WebsocketProvider";
const axios = require('axios');
var spawn = require('child_process').spawn;
const path = require('path');

export class OldOpenTickets extends WebsocketProvider {
    client_connection: WebSocket;
    name = 'Old Open Tickets';
    status = 'closed';
    portal_fetcher:any;

    constructor() {
        super('Old Open Tickets', null);
    }

    private static get_auth_token() {
        return new Promise((resolve,reject)=>{
            var child = spawn("powershell.exe", [path.join(__dirname + '/../getAuthToken.ps1')]);
            child.stdout.once('data', (data)=>{
                data = data.toString('utf-8');
                if (data != 'flopped') {
                    resolve(data.replaceAll('"', ''));
                }
                else
                    reject(data);
            })
        })
    }

    get_all_user_tickets(data):Promise<any> {
        return new Promise((resolve,reject)=>{
            OldOpenTickets.get_auth_token().then((token)=>{
                let config = {
                    headers: {
                        "Authorization": `Token ${token}`
                    }
                }
                axios.get(`http://ottansm2/api/V3/WorkItem/GetGridWorkItemsByUser?UserId=${data.userId}&isScoped=false&showActivities=false&showInactiveItems=false`, config).then(
                    (resp_data)=>{
                        resolve(resp_data.data);
                    }
                ).catch((e)=>{reject(e)})
            })
        });
    }

    get_user_old_tickets(data) {
        return new Promise((resolve,reject)=>{
            var threshold = today_add(-10);
            this.get_all_user_tickets(data).then((assigned_tickets)=>{
                let old_tickets = assigned_tickets.filter((ticket)=>{
                    let ticket_created = new Date(ticket.Created);
                    return ticket_created <= threshold;
                });
                resolve(old_tickets);
            }, (e)=>{reject(e)})
        })
    }

    do_work (data):Promise<any> {
        if (this.work_data)
            return new Promise(resolve=>resolve(this.work_data));
        else 
            return this.get_user_old_tickets(data);
    }
}