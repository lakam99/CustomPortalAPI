"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketProvider = void 0;
const SocketData_1 = require("./SocketData");
class WebsocketProvider {
    constructor(name, classType) {
        Object.assign(this, { name, classType });
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
                            resolve(new SocketData_1.SocketData({ data }));
                        });
                    }
                    break;
            }
        });
    }
    do_work(data) {
        return new Promise((resolve, reject) => { resolve(null); });
    }
}
exports.WebsocketProvider = WebsocketProvider;
