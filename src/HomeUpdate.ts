export class HomeUpdate {
    private type: Number;
    private title:String;
    private text:String;
    private timestamp:String;

    constructor(type:Number, title:String, text:String, timestamp:String) {
        if (type > 0 && type < 4) {
            this.type = type;
        } else {
            throw "Type must be integer from 1 to 3.";
        }

        this.title = title;
        this.text = text;
        this.timestamp = timestamp;
    }

    getJSON() {
        return {
            type: this.type,
            title: this.title,
            text: this.text,
            timestamp: this.timestamp
        }
    }

    static toArray(updates:Array<HomeUpdate>) {
        return updates.map((update)=>{
            return update.getJSON();
        })
    }

    static fromArray(updates:Array<any>):Array<HomeUpdate> {
        return updates.map((update)=>{
            return new HomeUpdate(update.type, update.title, update.text, update.timestamp);
        })
    }
}