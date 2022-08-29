import { UUID } from "./reusable";

var spawn = require('child_process').spawn;
const fs = require('fs');
const path = require('path');

export class ServiceManagerInterface {
    computerName:string;
    initialization:string;
    loaded:Promise<any>;

    constructor(computerName:string) {
        this.computerName = computerName;
        this.initialization = `Import-Module \\\\${computerName}\\d\`$\\Program Files\\Microsoft System Center\\Service Manager\\Powershell\\System.Center.Service.Manager.psd1;`;
        this.loaded = new Promise((resolve,reject)=>{
            fs.readFile(path.join(__dirname + '/../ServiceManagerInterfaceInit.ps1'), 'utf8'  ,(e,d)=>{
                e ? reject(e) : (this.initialization = d, resolve(true));
            })
        })
    }

    static json_to_psobj(obj:object):string {
        var r = Object.keys(obj).reduce((psobj, key) => {return `${psobj}${key}=@"\n${obj[key]}\n"@;`}, '@{').slice(0, -1) + '}';
        return r;
    }

    private write_command(command:string):Promise<any> {
        return new Promise((resolve,reject)=>{
            var instance = path.join(__dirname,`/../ps-instances/${UUID()}.ps1`);
            command = `${this.initialization}${command}`;
            fs.writeFile(instance, command, (e)=>{
                e ? reject(e) : resolve(instance);
            });
        });
    }

    private run_command(command:string):Promise<any> {
        return new Promise((resolve,reject)=>{
            this.write_command(command).then((path)=>{
                var child = spawn('powershell.exe', [path]);
                child.once('close', (code)=>{
                    resolve(code);
                    fs.unlinkSync(path);
                })
            }, (e)=>{reject(e)})
        })
    }

    new_srq(properties:object):Promise<any> {
        return new Promise((resolve,reject)=>{
            this.loaded.then(()=>{
                var psobj = ServiceManagerInterface.json_to_psobj(properties);
                var command = `New-SCSMObject -Class $srq -PropertyHashtable ${psobj}`;
                this.run_command(command);
            })
        })
    }

    async close_ticket(ticket_guid:string) {
        await this.loaded;
        var command = `$t=Get-SCSMObject -Id '${ticket_guid}';Set-SCSMObject $t -Property Status -Value 'Closed';`;
        await this.run_command(command);
    }

}