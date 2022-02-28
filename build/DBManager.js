"use strict";
exports.__esModule = true;
exports.primaryDB = void 0;
var fs = require("fs");
var EventEmitter = require('events').EventEmitter;
var eventManager = new EventEmitter();
var DBManager = /** @class */ (function () {
    function DBManager() {
        this.path = __dirname + "/../databases/keytable.json";
        this.done_writing = 'writing-finished';
        this.cache = JSON.parse(fs.readFileSync(this.path, 'utf8'));
        this.writing = false;
    }
    DBManager.prototype.writeToDB = function () {
        var _this = this;
        this.writing = true;
        fs.writeFile(this.path, JSON.stringify(this.cache), function (err) {
            if (err) {
                console.log(err);
            }
            _this.writing = false;
            eventManager.emit(_this.done_writing);
        });
    };
    DBManager.prototype.get = function (table) {
        if (this.cache.table[table]) {
            return this.cache.table[table];
        }
        else {
            throw "No such table exists" + table + ".";
        }
    };
    DBManager.prototype.put = function (table, data) {
        var _this = this;
        this.cache.table[table] = data;
        if (this.writing) {
            eventManager.on(this.done_writing, function () {
                eventManager.removeAllListeners(_this.done_writing);
                _this.writeToDB();
            });
        }
        else {
            this.writeToDB();
        }
    };
    return DBManager;
}());
exports.primaryDB = new DBManager();
