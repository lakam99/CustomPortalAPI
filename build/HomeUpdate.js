"use strict";
exports.__esModule = true;
exports.HomeUpdate = void 0;
var reusable_1 = require("./reusable");
var HomeUpdate = /** @class */ (function () {
    function HomeUpdate(type, title, text, timestamp, expiry_date) {
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
    HomeUpdate.prototype.getJSON = function () {
        return {
            type: this.type,
            title: this.title,
            text: this.text,
            timestamp: this.timestamp,
            expiry_date: this.expiry_date
        };
    };
    HomeUpdate.toArray = function (updates) {
        return updates.map(function (update) {
            return update.getJSON();
        });
    };
    HomeUpdate.fromArray = function (updates) {
        return updates.map(function (update) {
            return new HomeUpdate(update.type, update.title, update.text, update.timestamp, update.expiry_date);
        });
    };
    return HomeUpdate;
}());
exports.HomeUpdate = HomeUpdate;
