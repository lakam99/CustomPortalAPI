export class SocketData extends Object {
    constructor(data_obj) {
        super();
        Object.assign(this, data_obj);
    }

    static receive_data(data:string) {
        try {
            var parsed_data = JSON.parse(data);
        } catch {
            return false;
        }
        return new SocketData(parsed_data);
    }

    public toString():string {
        return JSON.stringify(this);
    }
}
