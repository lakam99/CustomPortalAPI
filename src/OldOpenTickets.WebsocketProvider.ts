import { ConfigManager } from "./ConfigManager";
import { EmailManager } from "./EmailManager";
import { get_req_json, runPowershellScript, today_add } from "./reusable";
import { WebsocketProvider } from "./WebsocketProvider";

const Handlebars = require('handlebars');
const request = require('request');
const path = require('path');
var fs = require('fs');
(async() =>{fs.readFileSync(path.join(__dirname, ))})

export class OldOpenTickets extends WebsocketProvider {
    client_connection: WebSocket;
    name = 'Old Open Tickets';
    status = 'closed';
    portal_fetcher:any;
    mgmt_emails:Array<string>;
    time_config:any;

    constructor() {
        super('Old Open Tickets', null);
        this.get_time_criteria_config();
        this.get_manager_emails();
    }

    private async get_manager_emails(){
        this.mgmt_emails = await ConfigManager.get('Management-Emails');
    }

    private async get_time_criteria_config() {
        this.time_config = await ConfigManager.get('Old-Ticket-Config');
    }
    
    private static async send_email(To:Array<string>, Subject, Message) {
        return await EmailManager.send_email(To, Subject, Message);
    }

    private report_close_all_to_manager(user, formatted_ticket_data):Promise<any> {
        return new Promise(async (resolve,reject)=>{
            var managers = this.mgmt_emails;
            let subject = `${user.Name} closed ${this.work_data.data.length} tickets.`;
            resolve(await OldOpenTickets.send_email(managers, subject, formatted_ticket_data));
        })
    }

    private create_close_notification_html(user, reason) {
        var html_template = EmailManager.get_template_for('close-ticket-notification');
        var {table} = html_template;
        var tickets = this.work_data.data;
        var table_template = Handlebars.compile(table);
        var table_data = {user: user.Name, ticket_count:tickets.length, reason, ticket_data: tickets};
        var table_html = table_template(table_data);
        return table_html;
    }

    private report_close_all(user, closing_comment) {
        var formatted_data = this.create_close_notification_html(user, closing_comment);
        return this.report_close_all_to_manager(user, formatted_data);
    }

    private static async get_auth_token() {
        let data = await runPowershellScript(path.join(__dirname + '/../getAuthToken.ps1'));
        return data.replaceAll('"', '');
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
            var created_threshold = today_add(this.time_config.created_threshold);
            var modified_threshold = today_add(this.time_config.modified_threshold);
            this.get_all_user_tickets(data).then((assigned_tickets)=>{
                let old_tickets = assigned_tickets.filter((ticket)=>{
                    let ticket_created = new Date(ticket.Created);
                    let ticket_modified = new Date(ticket.LastModified);
                    return ticket_created <= created_threshold && ticket_modified <= modified_threshold;
                });
                resolve(old_tickets);
            }, (e)=>{reject("Something went wrong: "+e)})
        })
    }

    do_work (data):Promise<any> {
        if (data.close_all)
            return this.report_close_all(data.user, data.closing_comment);
        if (this.work_data)
            return new Promise(resolve=>resolve(this.work_data));
        else 
            return this.get_user_old_tickets(data);
    }

    protected report_data(data:any) {
        if (Array.isArray(data.data)) this.work_data = data;
    }
}