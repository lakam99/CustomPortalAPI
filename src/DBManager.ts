import * as fs from 'fs';
const {EventEmitter} = require('events');

const eventManager = new EventEmitter();

class DBManager {
    private cache: any;
    private path = __dirname + "/../databases/keytable.json";
    private writing: boolean;
    private done_writing = 'writing-finished';

    constructor() {
        this.cache = JSON.parse(fs.readFileSync(this.path, 'utf8'));
        this.writing = false;
    }

    private writeToDB() {
        this.writing = true;
        fs.writeFile(this.path, JSON.stringify(this.cache), (err)=>{
            if (err) {
                console.log(err);
            }
            this.writing = false;
            eventManager.emit(this.done_writing);
        });
    }

    get(table:string) {
        if (this.cache.table[table]) {
            return this.cache.table[table];
        } else {
            throw "No such table exists" + table + ".";
        }
    }

    put(table:string, data:any) {
        this.cache.table[table] = data;
        if (this.writing) {
            eventManager.on(this.done_writing, ()=>{
                eventManager.removeAllListeners(this.done_writing);
                this.writeToDB();
            });
        } else {
            this.writeToDB();
        }
    }
}

export const primaryDB = new DBManager();