"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OldOpenTickets = void 0;
const ConfigManager_1 = require("./ConfigManager");
const EmailManager_1 = require("./EmailManager");
const reusable_1 = require("./reusable");
const WebsocketProvider_1 = require("./WebsocketProvider");
const Handlebars = require('handlebars');
const request = require('request');
const path = require('path');
var fs = require('fs');
(async () => { fs.readFileSync(path.join(__dirname)); });
class OldOpenTickets extends WebsocketProvider_1.WebsocketProvider {
    constructor() {
        super('Old Open Tickets', null);
        this.name = 'Old Open Tickets';
        this.status = 'closed';
        this.get_time_criteria_config();
        this.get_manager_emails();
    }
    async get_manager_emails() {
        this.mgmt_emails = await ConfigManager_1.ConfigManager.get('Management-Emails');
    }
    async get_time_criteria_config() {
        this.time_config = await ConfigManager_1.ConfigManager.get('Old-Ticket-Config');
    }
    static async send_email(To, Subject, Message) {
        return await EmailManager_1.EmailManager.send_email(To, Subject, Message);
    }
    report_close_all_to_manager(user, formatted_ticket_data) {
        return new Promise(async (resolve, reject) => {
            var managers = this.mgmt_emails;
            let subject = `${user.Name} closed ${this.work_data.data.length} tickets.`;
            resolve(await OldOpenTickets.send_email(managers, subject, formatted_ticket_data));
        });
    }
    create_close_notification_html(user, reason) {
        var html_template = EmailManager_1.EmailManager.get_template_for('close-ticket-notification');
        var { table } = html_template;
        var tickets = this.work_data.data;
        var table_template = Handlebars.compile(table);
        var table_data = { user: user.Name, ticket_count: tickets.length, reason, ticket_data: tickets };
        var table_html = table_template(table_data);
        return table_html;
    }
    report_close_all(user, closing_comment) {
        var formatted_data = this.create_close_notification_html(user, closing_comment);
        return this.report_close_all_to_manager(user, formatted_data);
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
            var created_threshold = (0, reusable_1.today_add)(this.time_config.created_threshold);
            var modified_threshold = (0, reusable_1.today_add)(this.time_config.modified_threshold);
            this.get_all_user_tickets(data).then((assigned_tickets) => {
                let old_tickets = assigned_tickets.filter((ticket) => {
                    let ticket_created = new Date(ticket.Created);
                    let ticket_modified = new Date(ticket.LastModified);
                    return ticket_created <= created_threshold && ticket_modified <= modified_threshold;
                });
                resolve(old_tickets);
            }, (e) => { reject("Something went wrong: " + e); });
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
