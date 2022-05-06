import { SocketData } from "./SocketData";

export class WebsocketProvider {
    name:string;
    status:string;
    classType:any;

    constructor(name:string, classType:any) {
        Object.assign(this, {name, classType});
    }

    process_data(data:SocketData):Promise<SocketData> {
        return new Promise((resolve,reject)=>{
            switch (data['request']) {
                case 'work':
                    if (data['params'] === undefined) {
                        reject(new SocketData({error: "Parameters are missing from work request."}));
                    } else {
                        this.do_work(data['params']).then((data)=>{
                            resolve(new SocketData({data}));
                        });
                    }
                    break;
            }
        });
    }

    do_work(data:any):Promise<any> {
        return new Promise((resolve,reject)=>{resolve(null)})
    }
}