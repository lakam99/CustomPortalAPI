"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceManagerInterface = void 0;
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
class ServiceManagerInterface {
    constructor(computerName) {
        this.computerName = computerName;
        this.initialization = fs.readFileSync(path.join(__dirname + '../ServiceManagerInterfaceInit.ps1'));
    }
    static json_to_psobj(obj) {
        var r = Object.keys(obj).reduce((psobj, key) => { return `"${psobj}${key}"="${psobj[key]}"`; }, '@{') + '}';
        return r;
    }
    new_srq(properties) {
        return new Promise((resolve, reject) => {
            var psobj = ServiceManagerInterface.json_to_psobj(properties);
            var command = `
                ${this.initialization}
                New-SCSMObject -Class $srq -PropertyHashtable ${psobj};
            `;
            exec(command, (e, stdout, stderr) => {
                e ? reject(e) : resolve(true || stderr || stdout);
            });
        });
    }
}
exports.ServiceManagerInterface = ServiceManagerInterface;
