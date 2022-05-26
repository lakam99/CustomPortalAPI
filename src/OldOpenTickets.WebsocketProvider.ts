import { get_req_json, today_add } from "./reusable";
import { ServiceManagerInterface } from "./ServiceManagerInterface";
import { WebsocketProvider } from "./WebsocketProvider";
const request = require('request');
var spawn = require('child_process').spawn;
const path = require('path');
var fs = require('fs');

export class OldOpenTickets extends WebsocketProvider {
    client_connection: WebSocket;
    name = 'Old Open Tickets';
    status = 'closed';
    portal_fetcher:any;
    scsm:ServiceManagerInterface;
    mgmt_emails:Array<string>;

    constructor() {
        super('Old Open Tickets', null);
        this.scsm = new ServiceManagerInterface('ottansm1');
        OldOpenTickets.get_manager_emails().then((d)=>this.mgmt_emails = d, (e)=>{console.warn(e)})
    }

    private static get_manager_emails():Promise<Array<string>> {
        return new Promise((resolve,reject)=>{
            fs.readFile(path.join(__dirname, '/../management-emails.json'),'utf8', (err,data)=>{
                err ? reject(err) : resolve(data);
            });
        })   
    }

    private static send_email([To,...Cc]:Array<string>, Subject, Message) {
        return new Promise(async (resolve,reject)=>{
            var token = await OldOpenTickets.get_auth_token();
            let url = 'https://services/EmailNotification/SendEmailNotification';
            let json = {To, Cc, Subject, Message};
            let config = {
                headers: {"Authorization": `Token ${token}`},
                url: url,
                form: json
            }
            request.post(config, (e,r,resp_data)=>{
                e || r.statusCode >= 400 ? reject(e || resp_data.MessageDetail || resp_data) : resolve(resp_data);
            })
        })
    }

    private report_close_all_to_manager(user, formatted_ticket_data):Promise<any> {
        return new Promise(async (resolve,reject)=>{
            var managers = await OldOpenTickets.get_manager_emails();
            let subject = `${user.Name} closed ${formatted_ticket_data.length} tickets.`;
            let msg_body = `The tickets closed are:\n${formatted_ticket_data}`;
            await OldOpenTickets.send_email(managers, subject, msg_body);
        })
    }

    private report_close_all(user, closing_comment) {
        let close_count = this.work_data.data.length;
        let formatted_data = this.work_data.data.map(ticket => `${ticket.Id},${ticket.Title},${ticket.AffectedUser}`);
        
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
                request.get(config, (e, r, resp_data)=>{
                    try {
                        resp_data = JSON.parse(resp_data);
                    } catch (e) {
                        reject(e);
                    }
                    e || r.statusCode >= 400 ? reject(e || resp_data.MessageDetail || resp_data) : resolve(resp_data);
                })
            })
        });
    }

    get_user_old_tickets(data) {
        return new Promise((resolve,reject)=>{
            var created_threshold = today_add(-10);
            var modified_threshold = today_add(-1);
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
            return this.report_close_all(data.user, data.closing_comment);
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