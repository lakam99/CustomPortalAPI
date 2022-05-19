const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

export class ServiceManagerInterface {
    computerName:string;
    initialization:string;

    constructor(computerName:string) {
        this.computerName = computerName;
        this.initialization = fs.readFileSync(path.join(__dirname + '../ServiceManagerInterfaceInit.ps1'));
    }

    static json_to_psobj(obj:object):string {
        var r = Object.keys(obj).reduce((psobj, key) => {return `"${psobj}${key}"="${psobj[key]}"`}, '@{') + '}';
        return r;
    }

    new_srq(properties:object):Promise<any> {
        return new Promise((resolve,reject)=>{
            var psobj = ServiceManagerInterface.json_to_psobj(properties);
            var command = `
                ${this.initialization}
                New-SCSMObject -Class $srq -PropertyHashtable ${psobj};
            `;
            exec(command, (e, stdout, stderr)=>{
                e ? reject(e) : resolve(true || stderr || stdout);
            })
        })
    }

}