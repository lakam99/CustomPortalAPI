"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OldOpenTickets = void 0;
const https = require('https');
const WebsocketProvider_1 = require("./WebsocketProvider");
class OldOpenTickets extends WebsocketProvider_1.WebsocketProvider {
    constructor() {
        super(...arguments);
        this.name = 'Old Open Tickets';
        this.status = 'closed';
    }
    do_work(data) {
        return new Promise((resolve, reject) => {
            https.get(`https://services/api/V3/WorkItem/GetGridWorkItemsByUser?userId=${data.userId}&isScoped=false&showActivities=false&showInactiveItems=false`, (resp) => {
                let data = { data: JSON.parse(resp) };
                resolve(data);
            });
        });
    }
}
exports.OldOpenTickets = OldOpenTickets;
