var spawn = require('child_process').spawn;

export function sanitize_string(str) {
    var clean = new RegExp(/["\*\d,;{}\[\]!@#$%\^&\(\)/\\\\]/g);
    return str.replace(clean,'');
}

export function today_add(days:number):Date {
    return new Date(new Date().getTime() + days * 24 * 60 * 60 * 1000);
}

export function get_req_json(url:string, body:object) {
    return Object.keys(body).reduce((url, param)=>{return url + param + `=${body[param]}&`}, url + '?').slice(0,-1);
}

export function UUID() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}

export function runPowershellScript(script_path:string):Promise<string> {
    return new Promise((resolve)=>{
        var child = spawn("powershell.exe", [script_path]);
        child.stdout.once('data', (data)=>{
            data = data.toString('utf-8');
            resolve(data);
        })
    })
}