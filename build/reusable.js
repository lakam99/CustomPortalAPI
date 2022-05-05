"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitize_string = void 0;
function sanitize_string(str) {
    var clean = new RegExp(/["\*\d,;{}\[\]!@#$%\^&\(\)/\\\\]/g);
    return str.replace(clean, '');
}
exports.sanitize_string = sanitize_string;
