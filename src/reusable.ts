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