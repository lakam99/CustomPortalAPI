"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get_req_json = exports.today_add = exports.sanitize_string = void 0;
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
