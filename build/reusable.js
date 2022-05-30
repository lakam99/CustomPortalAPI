"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPowershellScript = exports.UUID = exports.get_req_json = exports.today_add = exports.sanitize_string = void 0;
var spawn = require('child_process').spawn;
function sanitize_string(str) {
    var clean = new RegExp(/["\*\d,;{}\[\]!@#$%\^&\(\)/\\\\]/g);
    return str.replace(clean, '');
}
exports.sanitize_string = sanitize_string;
function today_add(days) {
    return new Date(new Date().getTime() + days * 24 * 60 * 60 * 1000);
}
exports.today_add = today_add;
function get_req_json(url, body) {
    return Object.keys(body).reduce((url, param) => { return url + param + `=${body[param]}&`; }, url + '?').slice(0, -1);
}
exports.get_req_json = get_req_json;
function UUID() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}
exports.UUID = UUID;
function runPowershellScript(script_path) {
    return new Promise((resolve) => {
        var child = spawn("powershell.exe", [script_path]);
        child.stdout.once('data', (data) => {
            data = data.toString('utf-8');
            resolve(data);
        });
    });
}
exports.runPowershellScript = runPowershellScript;
