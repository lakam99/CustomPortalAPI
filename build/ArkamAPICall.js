"use strict";
exports.__esModule = true;
exports.ArkamAPICall = exports.ARKAM_API_METHODS = void 0;
exports.ARKAM_API_METHODS = {
    post: 1,
    get: 2
};
var ArkamAPICall = /** @class */ (function () {
    function ArkamAPICall(method, name, callback) {
        if (method > 0 && method < 3) {
            this.method = method;
        }
        else {
            throw "Method must be between 1 and 2.";
        }
        this.name = name;
        this.callback = callback;
    }
    ArkamAPICall.prototype.get_method = function () {
        return this.method;
    };
    ArkamAPICall.prototype.get_name = function () {
        return this.name;
    };
    ArkamAPICall.prototype.get_callback = function () {
        return this.callback;
    };
    return ArkamAPICall;
}());
exports.ArkamAPICall = ArkamAPICall;
