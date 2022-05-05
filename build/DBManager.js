"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.primaryDB = void 0;
const fs = __importStar(require("fs"));
const { EventEmitter } = require('events');
const eventManager = new EventEmitter();
class DBManager {
    constructor() {
        this.path = __dirname + "/../databases/keytable.json";
        this.done_writing = 'writing-finished';
        this.cache = JSON.parse(fs.readFileSync(this.path, 'utf8'));
        this.writing = false;
    }
    readCache(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    writeToDB() {
        this.writing = true;
        fs.writeFile(this.path, JSON.stringify(this.cache), (err) => {
            if (err) {
                console.log(err);
            }
            this.writing = false;
            eventManager.emit(this.done_writing);
        });
    }
    get(table) {
        if (this.cache.table[table]) {
            return this.cache.table[table];
        }
        else {
            throw "No such table exists" + table + ".";
        }
    }
    put(table, data) {
        this.cache.table[table] = data;
        if (this.writing) {
            eventManager.on(this.done_writing, () => {
                eventManager.removeAllListeners(this.done_writing);
                this.writeToDB();
            });
        }
        else {
            this.writeToDB();
        }
    }
}
exports.primaryDB = new DBManager();
