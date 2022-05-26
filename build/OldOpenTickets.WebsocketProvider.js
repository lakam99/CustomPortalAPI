"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OldOpenTickets = void 0;
const reusable_1 = require("./reusable");
const ServiceManagerInterface_1 = require("./ServiceManagerInterface");
const WebsocketProvider_1 = require("./WebsocketProvider");
const request = require('request');
var spawn = require('child_process').spawn;
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
                err ? reject(err) : resolve(data);
            });
        });
    }
    report_close_all(user, closing_comment) {
        let close_count = this.work_data.data.length;
        let formatted_data = this.work_data.data.map(ticket => `${ticket.Id},${ticket.Title},${ticket.AffectedUser}`);
        var ticket = {
            Title: '{SCSM-SYSTEM-LOG}: Please do not touch, I will auto-close',
            Description: `${user.Name} submitted a request to close ${close_count} tickets for reason "${closing_comment}".'`,
            Notes: JSON.stringify({ user: user.Name, manager_emails: this.mgmt_emails, tickets: formatted_data })
        };
        return this.scsm.new_srq(ticket);
    }
    static get_auth_token() {
        return new Promise((resolve, reject) => {
            var child = spawn("powershell.exe", [path.join(__dirname + '/../getAuthToken.ps1')]);
            child.stdout.once('data', (data) => {
                data = data.toString('utf-8');
                if (data != 'flopped') {
                    resolve(data.replaceAll('"', ''));
                }
                else
                    reject(data);
            });
        });
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
            var modified_threshold = (0, reusable_1.today_add)(-1);
            this.get_all_user_tickets(data).then((assigned_tickets) => {
                let old_tickets = assigned_tickets.filter((ticket) => {
                    let ticket_created = new Date(ticket.Created);
                    let ticket_modified = new Date(ticket.LastModified);
                    return ticket_created <= created_threshold && ticket_modified <= modified_threshold;
                });
                resolve(old_tickets);
            }, (e) => { reject(e); });
        });
    }
    do_work(data) {
        if (data.close_all) {
            return this.report_close_all(data.user, data.closing_comment);
        }
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
