"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceManagerInterface = void 0;
const reusable_1 = require("./reusable");
var spawn = require('child_process').spawn;
const fs = require('fs');
const path = require('path');
class ServiceManagerInterface {
    constructor(computerName) {
        this.computerName = computerName;
        this.initialization = `Import-Module \\\\${computerName}\\d\`$\\Program Files\\Microsoft System Center\\Service Manager\\Powershell\\System.Center.Service.Manager.psd1;`;
        this.loaded = new Promise((resolve, reject) => {
            fs.readFile(path.join(__dirname + '/../ServiceManagerInterfaceInit.ps1'), 'utf8', (e, d) => {
                e ? reject(e) : (this.initialization = d, resolve(true));
            });
        });
    }
    static json_to_psobj(obj) {
        var r = Object.keys(obj).reduce((psobj, key) => { return `${psobj}${key}=@"\n${obj[key]}\n"@;`; }, '@{').slice(0, -1) + '}';
        return r;
    }
    write_command(command) {
        return new Promise((resolve, reject) => {
            var instance = path.join(__dirname, `/../ps-instances/${(0, reusable_1.UUID)()}.ps1`);
            command = `${this.initialization}${command}`;
            fs.writeFile(instance, command, (e) => {
                e ? reject(e) : resolve(instance);
            });
        });
    }
    run_command(command) {
        return new Promise((resolve, reject) => {
            this.write_command(command).then((path) => {
                var child = spawn('powershell.exe', [path]);
                child.once('close', (code) => {
                    resolve(code);
                });
            }, (e) => { reject(e); });
        });
    }
    new_srq(properties) {
        return new Promise((resolve, reject) => {
            this.loaded.then(() => {
                var psobj = ServiceManagerInterface.json_to_psobj(properties);
                var command = `New-SCSMObject -Class $srq -PropertyHashtable ${psobj}`;
                this.run_command(command);
            });
        });
    }
}
exports.ServiceManagerInterface = ServiceManagerInterface;
