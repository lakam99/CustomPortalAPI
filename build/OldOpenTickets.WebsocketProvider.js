"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OldOpenTickets = void 0;
const reusable_1 = require("./reusable");
const WebsocketProvider_1 = require("./WebsocketProvider");
const axios = require('axios');
var spawn = require('child_process').spawn;
const path = require('path');
class OldOpenTickets extends WebsocketProvider_1.WebsocketProvider {
    constructor() {
        super('Old Open Tickets', null);
        this.name = 'Old Open Tickets';
        this.status = 'closed';
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
                let config = {
                    headers: {
                        "Authorization": `Token ${token}`
                    }
                };
                axios.get(`http://ottansm2/api/V3/WorkItem/GetGridWorkItemsByUser?UserId=${data.userId}&isScoped=false&showActivities=false&showInactiveItems=false`, config).then((resp_data) => {
                    resolve(resp_data.data);
                }).catch((e) => { throw e; });
            });
        });
    }
    get_user_old_tickets(data) {
        return new Promise((resolve, reject) => {
            var threshold = (0, reusable_1.today_add)(-10);
            this.get_all_user_tickets(data).then((assigned_tickets) => {
                let old_tickets = assigned_tickets.filter((ticket) => {
                    let ticket_created = new Date(ticket.Created);
                    return ticket_created <= threshold;
                });
                resolve(old_tickets);
            });
        });
    }
    do_work(data) {
        return this.get_user_old_tickets(data);
    }
}
exports.OldOpenTickets = OldOpenTickets;
