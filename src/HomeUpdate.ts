import { sanitize_string } from "./reusable";

export class HomeUpdate {
    private type: Number;
    private title:String;
    private text:String;
    private timestamp:String;
    private expiry_date:String;

    constructor(type:Number, title:String, text:String, timestamp:String, expiry_date:String) {
        if (type > 0 && type < 4) {
            this.type = type;
        } else {
            throw "Type must be integer from 1 to 3.";
        }

        this.title = sanitize_string(title);
        this.text = sanitize_string(text);
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
        }
    }

    static toArray(updates:Array<HomeUpdate>) {
        return updates.map((update)=>{
            return update.getJSON();
        })
    }

    static fromArray(updates:Array<any>):Array<HomeUpdate> {
        return updates.map((update)=>{
            return new HomeUpdate(update.type, update.title, update.text, update.timestamp, update.expiry_date);
        })
    }
}