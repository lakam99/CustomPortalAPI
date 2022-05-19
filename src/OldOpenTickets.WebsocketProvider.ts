import { get_req_json, today_add } from "./reusable";
import { ServiceManagerInterface } from "./ServiceManagerInterface";
import { WebsocketProvider } from "./WebsocketProvider";
const request = require('request');
var spawn = require('child_process').spawn;
const path = require('path');

export class OldOpenTickets extends WebsocketProvider {
    client_connection: WebSocket;
    name = 'Old Open Tickets';
    status = 'closed';
    portal_fetcher:any;
    scsm:ServiceManagerInterface;

    constructor() {
        super('Old Open Tickets', null);
        this.scsm = new ServiceManagerInterface('ottansm1');
    }

    private report_close_all(user, close_count) {
        var ticket = {Title:'{SCSM-SYSTEM-LOG}:{CLOSE-ALL} DO NOT TOUCH!!!', Description: `${user.DisplayName} submitted a request to close ${close_count} tickets.`};
        return this.scsm.new_srq(ticket);
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
                let json = {UserId: data.userId, isScoped:false, showActivities:false, showInactiveItems:false};
                let url = 'http://ottansm2/api/V3/WorkItem/GetGridWorkItemsByUser';
                let config = {
                    headers: {"Authorization": `Token ${token}`},
                    url: get_req_json(url, json),
                }
                try {
                    request.get(config, (e, r, resp_data)=>{
                        resp_data = JSON.parse(resp_data);
                        e || r.statusCode >= 400 ? reject(e || resp_data.MessageDetail || resp_data) : resolve(resp_data);
                    })
                } catch(e) {
                    reject(e);
                }
            })
        });
    }

    get_user_old_tickets(data) {
        return new Promise((resolve,reject)=>{
            var created_threshold = today_add(-10);
            var modified_threshold = today_add(-5);
            this.get_all_user_tickets(data).then((assigned_tickets)=>{
                let old_tickets = assigned_tickets.filter((ticket)=>{
                    let ticket_created = new Date(ticket.Created);
                    let ticket_modified = new Date(ticket.LastModified);
                    return ticket_created <= created_threshold && ticket_modified <= modified_threshold;
                });
                resolve(old_tickets);
            }, (e)=>{reject(e)})
        })
    }

    do_work (data):Promise<any> {
        if (data.close_all) {
            return this.report_close_all(data.user, data.close_count);
        }
        if (this.work_data)
            return new Promise(resolve=>resolve(this.work_data));
        else 
            return this.get_user_old_tickets(data);
    }

    protected report_data(data:any) {
        if (Array.isArray(data.data)) this.work_data = data;
    }
}