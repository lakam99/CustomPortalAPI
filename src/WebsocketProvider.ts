import { SocketData } from "./SocketData";
import { PREMADE_RESPONSES } from "./SocketManager";

export class WebsocketProvider {
    name:string;
    status:string;
    classType:any;
    work_data:any;
    acknowledged:boolean;
    acknowledgement_expiry:any;

    constructor(name:string, classType:any) {
        Object.assign(this, {name, classType});
        this.acknowledged = false;
    }

    private acknowledge() {
        this.acknowledged = true;
        this.acknowledgement_expiry = setInterval(()=>{
            this.acknowledged = false; 
            this.work_data = undefined;
            clearInterval(this.acknowledgement_expiry);
        }, 86400000);
    }

    protected report_data({data}:any) {
        //implement
    }

    process_data(data:SocketData):Promise<SocketData> {
        return new Promise((resolve,reject)=>{
            switch (data['request']) {
                case 'work':
                    if (data['params'] === undefined) {
                        reject(new SocketData({error: "Parameters are missing from work request."}));
                    } else {
                        this.do_work(data['params']).then((data)=>{
                            if (!this.work_data) this.work_data = {data};
                            if (this.work_data.data.length == 0 && !this.acknowledged) this.acknowledge();
                            this.work_data.acknowledged = this.acknowledged;
                            resolve(new SocketData(this.work_data));
                        }, (e)=>{reject(new SocketData({error: e}))});
                    }
                    break;
                case 'acknowledge':
                    if (this.acknowledged)
                        reject(new SocketData({error: "Acknowledgement already sent &/ not yet expired."}));
                    else {
                        this.acknowledge();
                        resolve(PREMADE_RESPONSES.ok);
                    }
                    break;
                case 'report':
                    if (data['data'] === undefined) 
                        reject(new SocketData({error: "No data reported."}));
                    else {
                        this.report_data(data);
                        resolve(PREMADE_RESPONSES.ok);
                    }
            }
        });
    }

    do_work(data:any):Promise<any> {
        return new Promise((resolve,reject)=>{resolve(null)})
    }
}