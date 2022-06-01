"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomAPICall = exports.CUSTOM_API_METHODS = void 0;
exports.CUSTOM_API_METHODS = {
    post: 1,
    get: 2
};
class CustomAPICall {
    constructor(method, name, callback) {
        if (method > 0 && method < 3) {
            this.method = method;
        }
        else {
            throw "Method must be between 1 and 2.";
        }
        this.name = name;
        this.callback = callback;
    }
    get_method() {
        return this.method;
    }
    get_name() {
        return this.name;
    }
    get_callback() {
        return this.callback;
    }
}
exports.CustomAPICall = CustomAPICall;
