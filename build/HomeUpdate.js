"use strict";
exports.__esModule = true;
exports.HomeUpdate = void 0;
var HomeUpdate = /** @class */ (function () {
    function HomeUpdate(type, title, text, timestamp) {
        if (type > 0 && type < 4) {
            this.type = type;
        }
        else {
            throw "Type must be integer from 1 to 3.";
        }
        this.title = title;
        this.text = text;
        this.timestamp = timestamp;
    }
    HomeUpdate.prototype.getJSON = function () {
        return {
            type: this.type,
            title: this.title,
            text: this.text,
            timestamp: this.timestamp
        };
    };
    HomeUpdate.toArray = function (updates) {
        return updates.map(function (update) {
            return update.getJSON();
        });
    };
    HomeUpdate.fromArray = function (updates) {
        return updates.map(function (update) {
            return new HomeUpdate(update.type, update.title, update.text, update.timestamp);
        });
    };
    return HomeUpdate;
}());
exports.HomeUpdate = HomeUpdate;
