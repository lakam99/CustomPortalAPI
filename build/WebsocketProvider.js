"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketProvider = void 0;
const SocketData_1 = require("./SocketData");
const SocketManager_1 = require("./SocketManager");
class WebsocketProvider {
    constructor(name, classType) {
        Object.assign(this, { name, classType });
        this.acknowledged = false;
    }
    acknowledge() {
        this.acknowledged = true;
        this.acknowledgement_expiry = setInterval(() => { this.acknowledged = false; clearInterval(this.acknowledgement_expiry); }, 3600000);
    }
    process_data(data) {
        return new Promise((resolve, reject) => {
            switch (data['request']) {
                case 'work':
                    if (data['params'] === undefined) {
                        reject(new SocketData_1.SocketData({ error: "Parameters are missing from work request." }));
                    }
                    else {
                        this.do_work(data['params']).then((data) => {
                            if (!this.work_data)
                                this.work_data = { data };
                            this.work_data.acknowledged = this.acknowledged;
                            resolve(new SocketData_1.SocketData(this.work_data));
                        });
                    }
                    break;
                case 'acknowledge':
                    if (this.acknowledged)
                        reject(new SocketData_1.SocketData({ error: "Acknowledgement already sent &/ not yet expired." }));
                    else {
                        this.acknowledge();
                        resolve(SocketManager_1.PREMADE_RESPONSES.ok);
                    }
            }
        });
    }
    do_work(data) {
        return new Promise((resolve, reject) => { resolve(null); });
    }
}
exports.WebsocketProvider = WebsocketProvider;
