"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OldOpenTickets = void 0;
const EmailManager_1 = require("./EmailManager");
const reusable_1 = require("./reusable");
const ServiceManagerInterface_1 = require("./ServiceManagerInterface");
const WebsocketProvider_1 = require("./WebsocketProvider");
const request = require('request');
const path = require('path');
var fs = require('fs');
class OldOpenTickets extends WebsocketProvider_1.WebsocketProvider {
    constructor() {
        super('Old Open Tickets', null);
        this.name = 'Old Open Tickets';
        this.status = 'closed';
        this.scsm = new ServiceManagerInterface_1.ServiceManagerInterface('ottansm1');
        OldOpenTickets.get_manager_emails().then((d) => this.mgmt_emails = d, (e) => { console.warn(e); });
    }
    static get_manager_emails() {
        return new Promise((resolve, reject) => {
            fs.readFile(path.join(__dirname, '/../management-emails.json'), 'utf8', (err, data) => {
                err ? reject(err) : resolve(JSON.parse(data));
            });
        });
    }
    static async send_email([To, ...Cc], Subject, Message) {
        return await EmailManager_1.EmailManager.send_email(To, Subject, Message);
    }
    report_close_all_to_manager(user, formatted_ticket_data, closing_comment) {
        return new Promise(async (resolve, reject) => {
            var managers = await OldOpenTickets.get_manager_emails();
            let subject = `${user.Name} closed ${formatted_ticket_data.length} tickets.`;
            let msg_body = `${user.Name} ticket closing reason:${closing_comment}<p></p><p></p>The tickets closed are:<p></p>${formatted_ticket_data}`;
            resolve(await OldOpenTickets.send_email(managers, subject, msg_body));
        });
    }
    report_close_all(user, closing_comment) {
        let formatted_data = `
            <table>
                <th>
                    <tr>Id</tr>
                    <tr>Title</tr>
                    <tr>AffectedUser</tr>
                </th>
                <tbody>
        `;
        formatted_data += this.work_data.data.map(ticket => {
            `
            <tr>
                <td>${ticket.Id}</td>
                <td>${ticket.Title}</td>
                <td>${ticket.AffectedUser}</td>
            </tr>
        `;
        }).join('') + '<tbody/></table>';
        return this.report_close_all_to_manager(user, formatted_data, closing_comment);
    }
    static async get_auth_token() {
        let data = await (0, reusable_1.runPowershellScript)(path.join(__dirname + '/../getAuthToken.ps1'));
        return data.replaceAll('"', '');
    }
    get_all_user_tickets(data) {
        return new Promise((resolve, reject) => {
            OldOpenTickets.get_auth_token().then((token) => {
                let json = { UserId: data.userId, isScoped: false, showActivities: false, showInactiveItems: false };
                let url = 'http://ottansm2/api/V3/WorkItem/GetGridWorkItemsByUser';
                let config = {
                    headers: { "Authorization": `Token ${token}` },
                    url: (0, reusable_1.get_req_json)(url, json),
                };
                request.get(config, (e, r, resp_data) => {
                    try {
                        resp_data = JSON.parse(resp_data);
                    }
                    catch (e) {
                        reject(e);
                    }
                    e || r.statusCode >= 400 ? reject(e || resp_data.MessageDetail || resp_data) : resolve(resp_data);
                });
            });
        });
    }
    get_user_old_tickets(data) {
        return new Promise((resolve, reject) => {
            var created_threshold = (0, reusable_1.today_add)(-10);
            var modified_threshold = (0, reusable_1.today_add)(0);
            this.get_all_user_tickets(data).then((assigned_tickets) => {
                let old_tickets = assigned_tickets.filter((ticket) => {
                    let ticket_created = new Date(ticket.Created);
                    let ticket_modified = new Date(ticket.LastModified);
                    return ticket_created <= created_threshold && ticket_modified <= modified_threshold;
                });
                resolve(old_tickets);
            }, (e) => { reject("Failed to retrieve authentication token."); });
        });
    }
    do_work(data) {
        if (data.close_all)
            return this.report_close_all(data.user, data.closing_comment);
        if (this.work_data)
            return new Promise(resolve => resolve(this.work_data));
        else
            return this.get_user_old_tickets(data);
    }
    report_data(data) {
        if (Array.isArray(data.data))
            this.work_data = data;
    }
}
exports.OldOpenTickets = OldOpenTickets;
