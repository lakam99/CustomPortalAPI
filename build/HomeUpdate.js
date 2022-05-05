"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeUpdate = void 0;
const reusable_1 = require("./reusable");
class HomeUpdate {
    constructor(type, title, text, timestamp, expiry_date) {
        if (type > 0 && type < 4) {
            this.type = type;
        }
        else {
            throw "Type must be integer from 1 to 3.";
        }
        this.title = (0, reusable_1.sanitize_string)(title);
        this.text = (0, reusable_1.sanitize_string)(text);
        this.timestamp = timestamp;
        this.expiry_date = expiry_date;
    }
    getJSON() {
        return {
            type: this.type,
            title: this.title,
            text: this.text,
            timestamp: this.timestamp,
            expiry_date: this.expiry_date
        };
    }
    static toArray(updates) {
        return updates.map((update) => {
            return update.getJSON();
        });
    }
    static fromArray(updates) {
        return updates.map((update) => {
            return new HomeUpdate(update.type, update.title, update.text, update.timestamp, update.expiry_date);
        });
    }
}
exports.HomeUpdate = HomeUpdate;
